from flask import Flask, jsonify, request
from flask_cors import CORS
from db_connection import get_connection

app = Flask(__name__)
CORS(app)


# ------------------------ מקטע API 1: פונקציות עזר ------------------------
def rows_to_dicts(cursor, rows):
    columns = [description[0] for description in cursor.description]
    return [dict(zip(columns, row)) for row in rows]


def query_all(sql, params=None):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(sql, params or ())
        rows = cur.fetchall()
        return rows_to_dicts(cur, rows)
    finally:
        cur.close()
        conn.close()


# ------------------------ מקטע API 2: בדיקת שרת ------------------------
@app.route("/")
def home():
    return "SweetTour API is running!"


# ------------------------ מקטע API 3: לקוחות CRUD ------------------------
@app.route("/api/customers", methods=["GET"])
def get_customers():
    rows = query_all("""
                     SELECT customerid, fullname, phone, email, joindate
                     FROM customer
                     ORDER BY customerid;
                     """)

    for row in rows:
        row["joindate"] = str(row["joindate"]) if row["joindate"] else ""

    return jsonify(rows)


@app.route("/api/customers", methods=["POST"])
def add_customer():
    data = request.get_json() or {}

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    INSERT INTO customer (customerid, fullname, phone, email, joindate)
                    VALUES (%s, %s, %s, %s, COALESCE(%s::date, CURRENT_DATE))
                        RETURNING customerid;
                    """, (
                        data.get("customerid"),
                        data.get("fullname"),
                        data.get("phone"),
                        data.get("email"),
                        data.get("joindate")
                    ))

        customerid = cur.fetchone()[0]
        conn.commit()

        return jsonify({
            "message": "Customer added successfully",
            "customerid": customerid
        }), 201

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


@app.route("/api/customers/<int:customerid>", methods=["PUT"])
def update_customer(customerid):
    data = request.get_json() or {}

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    UPDATE customer
                    SET fullname = %s,
                        phone = %s,
                        email = %s,
                        joindate = COALESCE(%s::date, joindate)
                    WHERE customerid = %s
                        RETURNING customerid;
                    """, (
                        data.get("fullname"),
                        data.get("phone"),
                        data.get("email"),
                        data.get("joindate"),
                        customerid
                    ))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return jsonify({"error": "Customer not found"}), 404

        conn.commit()
        return jsonify({"message": "Customer updated successfully"})

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


@app.route("/api/customers/<int:customerid>", methods=["DELETE"])
def delete_customer(customerid):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    DELETE FROM customer
                    WHERE customerid = %s
                        RETURNING customerid;
                    """, (customerid,))

        deleted = cur.fetchone()

        if not deleted:
            conn.rollback()
            return jsonify({"error": "Customer not found"}), 404

        conn.commit()
        return jsonify({"message": "Customer deleted successfully"})

    except Exception as error:
        conn.rollback()
        return jsonify({
            "error": "Could not delete customer. The customer may be connected to registrations or payments.",
            "details": str(error)
        }), 500

    finally:
        cur.close()
        conn.close()


# ------------------------ מקטע API 4: מדריכים ------------------------
@app.route("/api/guides", methods=["GET"])
def get_guides():
    rows = query_all("""
                     SELECT guideid, firstname, lastname, phone, email,
                            birthdate, joindate, dailyrate, experienceyears,
                            rating, address, notes, school
                     FROM guide
                     ORDER BY guideid;
                     """)

    for row in rows:
        row["birthdate"] = str(row["birthdate"]) if row["birthdate"] else ""
        row["joindate"] = str(row["joindate"]) if row["joindate"] else ""
        row["dailyrate"] = float(row["dailyrate"]) if row["dailyrate"] is not None else None
        row["rating"] = float(row["rating"]) if row["rating"] is not None else None

    return jsonify(rows)


# ------------------------ מקטע API 5: מסלולים ------------------------
@app.route("/api/routes", methods=["GET"])
def get_routes():
    rows = query_all("""
                     SELECT routeid, r_name, estimatedlength, estimatedduration,
                            description, r_level, area
                     FROM route
                     ORDER BY routeid;
                     """)

    for row in rows:
        row["estimatedlength"] = float(row["estimatedlength"]) if row["estimatedlength"] is not None else None

    return jsonify(rows)


# ------------------------ מקטע API 6: מופעי סיור עם JOINs ------------------------
@app.route("/api/tours", methods=["GET"])
def get_tours():
    rows = query_all("""
                     SELECT
                         t.tourid,
                         t.startdate,
                         t.enddate,
                         t.starttime,
                         t.endtime,
                         t.meetingpoint,
                         t.price,
                         t.maxparticipants,
                         t.notes,
                         t.accessibility,
                         t.t_type,
                         t.guideid,
                         t.routeid,
                         t.tourstatusid,
                         COALESCE(g.firstname || ' ' || g.lastname, 'No guide') AS guide_name,
                         COALESCE(ro.r_name, 'No route') AS route_name,
                         COALESCE(ts.statusname, 'Unknown') AS status_name
                     FROM guidedtour t
                              LEFT JOIN guide g ON g.guideid = t.guideid
                              LEFT JOIN route ro ON ro.routeid = t.routeid
                              LEFT JOIN tourstatus ts ON ts.tourstatusid = t.tourstatusid
                     ORDER BY t.startdate DESC, t.tourid;
                     """)

    for row in rows:
        row["startdate"] = str(row["startdate"]) if row["startdate"] else ""
        row["enddate"] = str(row["enddate"]) if row["enddate"] else ""
        row["price"] = float(row["price"]) if row["price"] is not None else None

    return jsonify(rows)


# ------------------------ מקטע API 7: הרשמות עם JOINs ------------------------
@app.route("/api/registrations", methods=["GET"])
def get_registrations():
    rows = query_all("""
                     SELECT
                         r.registrationid,
                         r.registrationdate,
                         r.amounttopay,
                         r.notes,
                         r.numpeople,
                         r.customerid,
                         r.tourid,
                         r.registrationstatusid,
                         COALESCE(c.fullname, 'Unknown customer') AS customer_name,
                         COALESCE(ro.r_name, 'Unknown route') AS route_name,
                         COALESCE(t.meetingpoint, '') AS meetingpoint,
                         COALESCE(rs.statusname, 'Unknown') AS status_name
                     FROM registration r
                              LEFT JOIN customer c ON c.customerid = r.customerid
                              LEFT JOIN guidedtour t ON t.tourid = r.tourid
                              LEFT JOIN route ro ON ro.routeid = t.routeid
                              LEFT JOIN registrationstatus rs
                                        ON rs.registrationstatusid = r.registrationstatusid
                     ORDER BY r.registrationdate DESC, r.registrationid DESC;
                     """)

    for row in rows:
        row["registrationdate"] = str(row["registrationdate"]) if row["registrationdate"] else ""
        row["amounttopay"] = float(row["amounttopay"]) if row["amounttopay"] is not None else None

    return jsonify(rows)


# ------------------------ מקטע API 8: שאילתה משלב ב - סיורים עם מקומות פנויים ------------------------
@app.route("/api/queries/available-tours", methods=["GET"])
def available_tours():
    rows = query_all("""
                     SELECT
                         t.tourid,
                         t.meetingpoint,
                         t.maxparticipants,
                         COALESCE(SUM(r.numpeople), 0)::INT AS total_registered,
                         (t.maxparticipants - COALESCE(SUM(r.numpeople), 0))::INT AS spots_left,
                         COALESCE(ro.r_name, 'Unknown route') AS route_name
                     FROM guidedtour t
                              LEFT JOIN registration r
                                        ON t.tourid = r.tourid
                                            AND COALESCE(r.registrationstatusid, 0) <> 3
                              LEFT JOIN route ro ON ro.routeid = t.routeid
                     GROUP BY t.tourid, t.meetingpoint, t.maxparticipants, ro.r_name
                     HAVING COALESCE(SUM(r.numpeople), 0) < t.maxparticipants
                     ORDER BY spots_left DESC;
                     """)

    return jsonify(rows)


# ------------------------ מקטע API 9: פונקציה fn_get_remaining_spots ------------------------
@app.route("/api/programs/remaining-spots/<int:tourid>", methods=["GET"])
def get_remaining_spots(tourid):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT fn_get_remaining_spots(%s);", (tourid,))
        result = cur.fetchone()

        if result is None:
            return jsonify({"error": "Tour not found"}), 404

        return jsonify({
            "tourid": tourid,
            "remaining_spots": result[0]
        })

    except Exception as error:
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


# ------------------------ מקטע API 10: פרוצדורה pr_register_customer ------------------------
@app.route("/api/programs/register-customer", methods=["POST"])
def register_customer():
    data = request.get_json() or {}
    customerid = data.get("customerid")
    tourid = data.get("tourid")

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT fn_get_remaining_spots(%s);", (tourid,))
        spots_before = cur.fetchone()[0]

        if spots_before is None or spots_before <= 0:
            conn.rollback()
            return jsonify({"error": "No spots left for this tour"}), 400

        cur.execute("CALL pr_register_customer(%s, %s);", (customerid, tourid))
        conn.commit()

        cur.execute("SELECT fn_get_remaining_spots(%s);", (tourid,))
        spots_after = cur.fetchone()[0]

        return jsonify({
            "message": f"Customer registered successfully. Spots before: {spots_before}, spots after: {spots_after}"
        })

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


# ------------------------ מקטע API 11: פונקציה fn_get_customer_debt ------------------------
@app.route("/api/programs/customer-debt/<int:customerid>", methods=["GET"])
def get_customer_debt(customerid):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT fn_get_customer_debt(%s);", (customerid,))
        debt = cur.fetchone()[0]

        return jsonify({
            "customerid": customerid,
            "debt": float(debt or 0)
        })

    except Exception as error:
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


# ------------------------ מקטע API 12: פרוצדורה pr_pay_customer_debt ------------------------
@app.route("/api/programs/pay-customer-debt", methods=["POST"])
def pay_customer_debt():
    data = request.get_json() or {}
    customerid = data.get("customerid")

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT fn_get_customer_debt(%s);", (customerid,))
        debt_before = cur.fetchone()[0] or 0

        cur.execute("CALL pr_pay_customer_debt(%s);", (customerid,))
        conn.commit()

        cur.execute("SELECT fn_get_customer_debt(%s);", (customerid,))
        debt_after = cur.fetchone()[0] or 0

        return jsonify({
            "message": f"Debt payment completed. Before: ₪{debt_before}, after: ₪{debt_after}"
        })

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


# ------------------------ מקטע API 13: הפעלת טריגר ביטול סיור ------------------------
@app.route("/api/tours/<int:tourid>/cancel", methods=["PUT"])
def cancel_tour(tourid):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    UPDATE guidedtour
                    SET tourstatusid = 3
                    WHERE tourid = %s
                        RETURNING tourid;
                    """, (tourid,))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return jsonify({"error": "Tour not found"}), 404

        conn.commit()

        return jsonify({
            "message": "Tour cancelled. Related registrations were cancelled by the database trigger."
        })

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


# ------------------------ מקטע API 14: Audit של עדכוני הרשמות ------------------------
@app.route("/api/audit/registrations", methods=["GET"])
def registration_audit():
    rows = query_all("""
                     SELECT audit_id, registrationid, old_status, change_date
                     FROM registration_audit
                     ORDER BY change_date DESC;
                     """)

    for row in rows:
        row["change_date"] = str(row["change_date"]) if row["change_date"] else ""

    return jsonify(rows)


# ------------------------ מקטע API 15: הרצת השרת ------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
