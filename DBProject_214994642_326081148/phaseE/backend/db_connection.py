import os

import psycopg2


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "integration_db1"),
        user=os.getenv("DB_USER", "rut"),
        password=os.getenv("DB_PASSWORD", "rut"),
    )