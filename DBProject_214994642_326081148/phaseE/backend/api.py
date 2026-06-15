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


# ------------------------ מקטע API 4: מדריכים CRUD ------------------------
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


@app.route("/api/guides", methods=["POST"])
def add_guide():
    data = request.get_json() or {}

    required_fields = ["guideid", "firstname", "lastname", "phone", "email"]
    missing = [field for field in required_fields if data.get(field) in (None, "")]

    if missing:
        return jsonify({
            "error": "Missing required fields: " + ", ".join(missing)
        }), 400

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    INSERT INTO guide (
                        guideid, firstname, lastname, phone, email,
                        birthdate, joindate, dailyrate, experienceyears,
                        rating, address, notes, school
                    )
                    VALUES (
                               %s, %s, %s, %s, %s,
                               %s::date, %s::date, %s, %s,
                               %s, %s, %s, %s
                           )
                        RETURNING guideid;
                    """, (
                        data.get("guideid"),
                        data.get("firstname"),
                        data.get("lastname"),
                        data.get("phone"),
                        data.get("email"),
                        data.get("birthdate"),
                        data.get("joindate"),
                        data.get("dailyrate"),
                        data.get("experienceyears"),
                        data.get("rating"),
                        data.get("address"),
                        data.get("notes"),
                        data.get("school")
                    ))

        guideid = cur.fetchone()[0]
        conn.commit()

        return jsonify({
            "message": "Guide added successfully",
            "guideid": guideid
        }), 201

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


@app.route("/api/guides/<int:guideid>", methods=["PUT"])
def update_guide(guideid):
    data = request.get_json() or {}

    required_fields = ["firstname", "lastname", "phone", "email"]
    missing = [field for field in required_fields if data.get(field) in (None, "")]

    if missing:
        return jsonify({
            "error": "Missing required fields: " + ", ".join(missing)
        }), 400

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    UPDATE guide
                    SET firstname = %s,
                        lastname = %s,
                        phone = %s,
                        email = %s,
                        birthdate = %s::date,
                joindate = %s::date,
                        dailyrate = %s,
                        experienceyears = %s,
                        rating = %s,
                        address = %s,
                        notes = %s,
                        school = %s
                    WHERE guideid = %s
                        RETURNING guideid;
                    """, (
                        data.get("firstname"),
                        data.get("lastname"),
                        data.get("phone"),
                        data.get("email"),
                        data.get("birthdate"),
                        data.get("joindate"),
                        data.get("dailyrate"),
                        data.get("experienceyears"),
                        data.get("rating"),
                        data.get("address"),
                        data.get("notes"),
                        data.get("school"),
                        guideid
                    ))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return jsonify({"error": "Guide not found"}), 404

        conn.commit()
        return jsonify({
            "message": "Guide updated successfully",
            "guideid": guideid
        })

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


@app.route("/api/guides/<int:guideid>", methods=["DELETE"])
def delete_guide(guideid):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    DELETE FROM guide
                    WHERE guideid = %s
                        RETURNING guideid;
                    """, (guideid,))

        deleted = cur.fetchone()

        if not deleted:
            conn.rollback()
            return jsonify({"error": "Guide not found"}), 404

        conn.commit()
        return jsonify({
            "message": "Guide deleted successfully",
            "guideid": guideid
        })

    except Exception as error:
        conn.rollback()
        return jsonify({
            "error": (
                "Could not delete this guide. "
                "The guide may still be assigned to one or more tour instances."
            ),
            "details": str(error)
        }), 409

    finally:
        cur.close()
        conn.close()


# ------------------------ מקטע API 5: מסלולים CRUD ------------------------
@app.route("/api/routes", methods=["GET"])
def get_routes():
    rows = query_all("""
                     SELECT
                         r.routeid,
                         r.r_name,
                         r.estimatedlength,
                         r.estimatedduration,
                         r.description,
                         r.r_level,
                         r.area,
                         MIN(gt.price) AS min_price
                     FROM route r
                              LEFT JOIN guidedtour gt ON gt.routeid = r.routeid
                     GROUP BY
                         r.routeid,
                         r.r_name,
                         r.estimatedlength,
                         r.estimatedduration,
                         r.description,
                         r.r_level,
                         r.area
                     ORDER BY r.routeid;
                     """)

    for row in rows:
        row["estimatedlength"] = (
            float(row["estimatedlength"])
            if row["estimatedlength"] is not None
            else None
        )
        row["min_price"] = (
            float(row["min_price"])
            if row["min_price"] is not None
            else None
        )

    return jsonify(rows)


@app.route("/api/routes", methods=["POST"])
def add_route():
    data = request.get_json() or {}

    if data.get("routeid") in (None, "") or not data.get("r_name"):
        return jsonify({
            "error": "Route ID and route name are required"
        }), 400

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    INSERT INTO route (
                        routeid, r_name, estimatedlength, estimatedduration,
                        description, r_level, area
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING routeid;
                    """, (
                        data.get("routeid"),
                        data.get("r_name"),
                        data.get("estimatedlength"),
                        data.get("estimatedduration"),
                        data.get("description"),
                        data.get("r_level"),
                        data.get("area")
                    ))

        routeid = cur.fetchone()[0]
        conn.commit()

        return jsonify({
            "message": "Route added successfully",
            "routeid": routeid
        }), 201

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


@app.route("/api/routes/<int:routeid>", methods=["PUT"])
def update_route(routeid):
    data = request.get_json() or {}

    if not data.get("r_name"):
        return jsonify({"error": "Route name is required"}), 400

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    UPDATE route
                    SET r_name = %s,
                        estimatedlength = %s,
                        estimatedduration = %s,
                        description = %s,
                        r_level = %s,
                        area = %s
                    WHERE routeid = %s
                        RETURNING routeid;
                    """, (
                        data.get("r_name"),
                        data.get("estimatedlength"),
                        data.get("estimatedduration"),
                        data.get("description"),
                        data.get("r_level"),
                        data.get("area"),
                        routeid
                    ))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return jsonify({"error": "Route not found"}), 404

        conn.commit()

        return jsonify({
            "message": (
                "Route updated successfully. "
                "Related tour instances now display the updated route data."
            ),
            "routeid": routeid
        })

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


@app.route("/api/routes/<int:routeid>", methods=["DELETE"])
def delete_route(routeid):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    DELETE FROM route
                    WHERE routeid = %s
                        RETURNING routeid;
                    """, (routeid,))

        deleted = cur.fetchone()

        if not deleted:
            conn.rollback()
            return jsonify({"error": "Route not found"}), 404

        conn.commit()

        return jsonify({
            "message": "Route deleted successfully",
            "routeid": routeid
        })

    except Exception as error:
        conn.rollback()
        return jsonify({
            "error": (
                "Could not delete this route because it is still used by "
                "one or more tour instances."
            ),
            "details": str(error)
        }), 409

    finally:
        cur.close()
        conn.close()


# ------------------------ מקטע API 5.1: תחנות של מסלול ------------------------
@app.route("/api/routes/<int:routeid>/stations", methods=["GET"])
def get_route_stations(routeid):
    """
    מחזיר את התחנות שמשויכות למסלול בלי לחשוף מזהה פנימי של תחנה.

    הקוד תומך בשני מבנים אפשריים של טבלת tourstation:
    1. קישור ישיר באמצעות routeid.
    2. קישור באמצעות tourid, ואז מתבצע JOIN דרך guidedtour.
    """
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'tourstation';
                    """)
        tourstation_columns = {row[0] for row in cur.fetchall()}

        station_reference_candidates = [
            "s_name",
            "stationname",
            "station_name",
            "stationid",
            "station_id"
        ]
        station_reference = next(
            (
                column
                for column in station_reference_candidates
                if column in tourstation_columns
            ),
            None
        )

        if station_reference is None:
            return jsonify({
                "error": (
                    "Could not identify the station reference column "
                    "inside tourstation."
                )
            }), 500

        order_candidates = [
            "stationorder",
            "station_order",
            "stoporder",
            "stop_order",
            "position",
            "sequence",
            "order_number"
        ]
        order_column = next(
            (column for column in order_candidates if column in tourstation_columns),
            None
        )

        station_join = (
            f"s.s_name = ts.{station_reference}"
            if station_reference in {"s_name", "stationname", "station_name"}
            else f"s.s_name::text = ts.{station_reference}::text"
        )

        order_select = (
            f"ts.{order_column} AS station_order"
            if order_column
            else "NULL::INTEGER AS station_order"
        )
        order_by = (
            f"ORDER BY ts.{order_column}, s.s_name"
            if order_column
            else "ORDER BY s.s_name"
        )

        if "routeid" in tourstation_columns:
            sql = f"""
                SELECT DISTINCT
                    s.s_name,
                    s.s_address,
                    s.description,
                    {order_select}
                FROM tourstation ts
                JOIN station s ON {station_join}
                WHERE ts.routeid = %s
                {order_by};
            """
            params = (routeid,)

        elif "tourid" in tourstation_columns:
            sql = f"""
                SELECT DISTINCT
                    s.s_name,
                    s.s_address,
                    s.description,
                    {order_select}
                FROM tourstation ts
                JOIN guidedtour gt ON gt.tourid = ts.tourid
                JOIN station s ON {station_join}
                WHERE gt.routeid = %s
                {order_by};
            """
            params = (routeid,)

        else:
            return jsonify({
                "error": (
                    "The tourstation table does not contain routeid or tourid, "
                    "so its connection to a route could not be determined."
                )
            }), 500

        cur.execute(sql, params)
        rows = rows_to_dicts(cur, cur.fetchall())

        return jsonify(rows)

    except Exception as error:
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


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


# ------------------------ מקטע API 7.1: הלקוחות הרשומים למופע סיור ------------------------
@app.route("/api/tours/<int:tourid>/customers", methods=["GET"])
def get_tour_customers(tourid):
    rows = query_all("""
                     SELECT
                         r.registrationid,
                         c.fullname,
                         c.phone,
                         c.email,
                         r.numpeople,
                         r.amounttopay,
                         COALESCE(rs.statusname, 'Unknown') AS status_name
                     FROM registration r
                              JOIN customer c ON c.customerid = r.customerid
                              LEFT JOIN registrationstatus rs
                                        ON rs.registrationstatusid = r.registrationstatusid
                     WHERE r.tourid = %s
                     ORDER BY c.fullname, r.registrationid;
                     """, (tourid,))

    for row in rows:
        row["amounttopay"] = float(row["amounttopay"]) if row["amounttopay"] is not None else None

    return jsonify(rows)


# ------------------------ מקטע API 7.1: סטטוסים אפשריים להרשמה ------------------------
@app.route("/api/registration-statuses", methods=["GET"])
def get_registration_statuses():
    rows = query_all("""
                     SELECT registrationstatusid, statusname
                     FROM registrationstatus
                     ORDER BY registrationstatusid;
                     """)

    return jsonify(rows)


# ------------------------ מקטע API 7.2: עדכון הרשמה ------------------------
@app.route("/api/registrations/<int:registrationid>", methods=["PUT"])
def update_registration(registrationid):
    data = request.get_json() or {}

    required_fields = [
        "customerid",
        "tourid",
        "registrationdate",
        "numpeople",
        "registrationstatusid"
    ]
    missing = [field for field in required_fields if data.get(field) in (None, "")]

    if missing:
        return jsonify({
            "error": "Missing required fields: " + ", ".join(missing)
        }), 400

    conn = get_connection()
    cur = conn.cursor()

    try:
        # amounttopay is not written here.
        # trg_auto_calc_price recalculates it automatically before the update.
        # trg_audit_registration saves the previous status automatically.
        cur.execute("""
                    UPDATE registration
                    SET customerid = %s,
                        tourid = %s,
                        registrationdate = %s::date,
                numpeople = %s,
                        registrationstatusid = %s,
                        notes = %s
                    WHERE registrationid = %s
                        RETURNING registrationid, amounttopay;
                    """, (
                        data.get("customerid"),
                        data.get("tourid"),
                        data.get("registrationdate"),
                        data.get("numpeople"),
                        data.get("registrationstatusid"),
                        data.get("notes"),
                        registrationid
                    ))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return jsonify({"error": "Registration not found"}), 404

        conn.commit()

        return jsonify({
            "message": "Registration updated successfully",
            "registrationid": updated[0],
            "amounttopay": float(updated[1]) if updated[1] is not None else None
        })

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cur.close()
        conn.close()


# ------------------------ מקטע API 7.3: מחיקת הרשמה ------------------------
@app.route("/api/registrations/<int:registrationid>", methods=["DELETE"])
def delete_registration(registrationid):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    DELETE FROM registration
                    WHERE registrationid = %s
                        RETURNING registrationid;
                    """, (registrationid,))

        deleted = cur.fetchone()

        if not deleted:
            conn.rollback()
            return jsonify({"error": "Registration not found"}), 404

        conn.commit()

        return jsonify({
            "message": "Registration deleted successfully",
            "registrationid": registrationid
        })

    except Exception as error:
        conn.rollback()
        return jsonify({
            "error": (
                "Could not delete this registration. "
                "It may still be connected to payments or audit records."
            ),
            "details": str(error)
        }), 409

    finally:
        cur.close()
        conn.close()


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


# ------------------------ מקטע API 8.1: שאילתה משלב ב - הכנסות חודשיות ------------------------
@app.route("/api/queries/monthly-revenue", methods=["GET"])
def monthly_revenue():
    rows = query_all("""
                     SELECT
                         EXTRACT(YEAR FROM paymentdate)::INT AS year,
            EXTRACT(MONTH FROM paymentdate)::INT AS month,
            COALESCE(SUM(amount), 0) AS monthlyincome,
            COUNT(paymentid)::INT AS transactioncount
                     FROM payment
                     WHERE EXTRACT(YEAR FROM paymentdate) = 2026
                     GROUP BY EXTRACT(YEAR FROM paymentdate),
                         EXTRACT(MONTH FROM paymentdate)
                     ORDER BY month;
                     """)

    for row in rows:
        row["monthlyincome"] = float(row["monthlyincome"] or 0)

    return jsonify(rows)


# ------------------------ מקטע API 8.2: שאילתה משלב ב - סיורים בשבוע הקרוב ------------------------
@app.route("/api/queries/upcoming-tours", methods=["GET"])
def upcoming_tours():
    rows = query_all("""
                     SELECT
                         gt.tourid,
                         rt.r_name AS routename,
                         gt.startdate AS starting,
                         gt.maxparticipants,
                         (
                             gt.maxparticipants -
                             COALESCE((
                                          SELECT SUM(r.numpeople)
                                          FROM registration r
                                          WHERE r.tourid = gt.tourid
                                            AND COALESCE(r.registrationstatusid, 0) <> 3
                                      ), 0)
                             )::INT AS availableslots
                     FROM guidedtour gt
                              JOIN route rt ON gt.routeid = rt.routeid
                     WHERE gt.startdate BETWEEN CURRENT_DATE
                               AND CURRENT_DATE + INTERVAL '7 days'
                     ORDER BY gt.startdate;
                     """)

    for row in rows:
        row["starting"] = str(row["starting"]) if row["starting"] else ""

    return jsonify(rows)


# ------------------------ מקטע API 8.3: שאילתה עם פרמטר - לקוחות עם X הרשמות שלא שולמו ------------------------
@app.route("/api/queries/customers-with-unpaid-registrations", methods=["GET"])
def customers_with_unpaid_registrations():
    count_text = request.args.get("count", "10")

    try:
        required_count = int(count_text)
    except (TypeError, ValueError):
        return jsonify({
            "error": "The count parameter must be a whole number."
        }), 400

    if required_count < 0:
        return jsonify({
            "error": "The count parameter cannot be negative."
        }), 400

    rows = query_all("""
                     SELECT
                         c.fullname,
                         c.phone,
                         COUNT(r.registrationid)::INT AS unpaid_registrations
                     FROM customer c
                              JOIN registration r ON c.customerid = r.customerid
                     WHERE r.registrationstatusid = 1
                     GROUP BY c.customerid, c.fullname, c.phone
                     HAVING COUNT(r.registrationid) = %s
                     ORDER BY c.fullname;
                     """, (required_count,))

    return jsonify(rows)


# ------------------------ מקטע API 8.4: שאילתה - מדריכים פעילים ומספר הסיורים שלהם ------------------------
@app.route("/api/queries/active-guides", methods=["GET"])
def active_guides():
    rows = query_all("""
                     SELECT
                         CONCAT(g.firstname, ' ', g.lastname) AS guide_name,
                         COUNT(gt.tourid)::INT AS tours_count
                     FROM guide g
                              JOIN guidedtour gt ON g.guideid = gt.guideid
                     GROUP BY g.guideid, g.firstname, g.lastname
                     HAVING COUNT(gt.tourid) > 0
                     ORDER BY tours_count DESC, guide_name ASC;
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
