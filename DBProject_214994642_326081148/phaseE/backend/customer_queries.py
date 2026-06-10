from db_connection import get_connection


def get_all_customers():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
                SELECT customerid, fullname, phone, email, joindate
                FROM customer
                ORDER BY customerid
                    LIMIT 50;
                """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return rows