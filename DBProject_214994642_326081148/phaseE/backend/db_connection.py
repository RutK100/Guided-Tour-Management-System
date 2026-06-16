import psycopg2


def get_connection():
    return psycopg2.connect(
        host="host.docker.internal",
        port=5433,
        database="integration_db1_new",
        user="postgres",
        password="postgres",
        options="-c search_path=public",
        connect_timeout=5
    )