from flask import Flask, jsonify, request
from flask_cors import CORS
from db_connection import get_connection

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "SweetTour API is running!"


@app.route("/api/customers", methods=["GET"])
def get_customers():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
                SELECT customerid, fullname, phone, email, joindate
                FROM customer
                ORDER BY customerid
                    LIMIT 100;
                """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    customers = []
    for row in rows:
        customers.append({
            "customerid": row[0],
            "fullname": row[1],
            "phone": row[2],
            "email": row[3],
            "joindate": str(row[4]) if row[4] else ""
        })

    return jsonify(customers)


@app.route("/api/customers", methods=["POST"])
def add_customer():
    data = request.get_json()

    customerid = data.get("customerid")
    fullname = data.get("fullname")
    phone = data.get("phone")
    email = data.get("email")
    joindate = data.get("joindate")

    if not customerid or not fullname or not phone or not email:
        return jsonify({"error": "customerid, fullname, phone and email are required"}), 400

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    INSERT INTO customer (customerid, fullname, phone, email, joindate)
                    VALUES (%s, %s, %s, %s, COALESCE(%s::date, CURRENT_DATE))
                        RETURNING customerid;
                    """, (customerid, fullname, phone, email, joindate))

        new_id = cur.fetchone()[0]
        conn.commit()

        return jsonify({"message": "Customer added successfully", "customerid": new_id}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


@app.route("/api/customers/<int:customerid>", methods=["PUT"])
def update_customer(customerid):
    data = request.get_json()

    fullname = data.get("fullname")
    phone = data.get("phone")
    email = data.get("email")
    joindate = data.get("joindate")

    if not fullname or not phone or not email:
        return jsonify({"error": "fullname, phone and email are required"}), 400

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
                    """, (fullname, phone, email, joindate, customerid))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return jsonify({"error": "Customer not found"}), 404

        conn.commit()
        return jsonify({"message": "Customer updated successfully", "customerid": customerid})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

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
        return jsonify({"message": "Customer deleted successfully", "customerid": customerid})

    except Exception as e:
        conn.rollback()
        return jsonify({
            "error": "Could not delete customer. The customer may be connected to registrations/payments.",
            "details": str(e)
        }), 500

    finally:
        cur.close()
        conn.close()


@app.route("/api/guides", methods=["GET"])
def get_guides():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
                SELECT guideid, firstname, lastname, phone, email,
                       birthdate, joindate, dailyrate, experienceyears,
                       rating, address, notes, school
                FROM guide
                ORDER BY guideid
                    LIMIT 100;
                """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    guides = []
    for row in rows:
        guides.append({
            "guideid": row[0],
            "firstname": row[1],
            "lastname": row[2],
            "phone": row[3],
            "email": row[4],
            "birthdate": str(row[5]) if row[5] else "",
            "joindate": str(row[6]) if row[6] else "",
            "dailyrate": float(row[7]) if row[7] is not None else None,
            "experienceyears": row[8],
            "rating": float(row[9]) if row[9] is not None else None,
            "address": row[10],
            "notes": row[11],
            "school": row[12]
        })

    return jsonify(guides)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
