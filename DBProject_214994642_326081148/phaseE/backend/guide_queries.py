from db_connection import get_connection


def get_all_guides():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
                SELECT guideid, firstname, lastname, phone, email,
                       birthdate, address, joindate, notes,
                       dailyrate, rating, experienceyears
                FROM guide
                ORDER BY guideid
                    LIMIT 50;
                """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return rows