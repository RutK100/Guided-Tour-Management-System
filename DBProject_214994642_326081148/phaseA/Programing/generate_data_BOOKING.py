import random
from datetime import datetime, timedelta

# הגדרות בסיסיות
NUM_RECORDS = 20000
FILE_NAME = "BOOKINGS.sql"

# רשימת ה-IDs שקיימים אצלנו בטבלאות האחרות (כדי שלא תהיה שגיאת Foreign Key)
customer_ids = list(range(1, 501))     # יצרנו 500 לקוחות ב-Mockaroo
instance_ids = list(range(1, 501))     # נניח שיצרנו 500 מופעי סיור

def create_massive_data():
    with open(FILE_NAME, "w", encoding="utf-8") as f:
        f.write("-- Massive Data Insert for BOOKINGS\n")
        
        # אנחנו נכתוב בקבוצות (Chunks) כדי שהקובץ לא יקרוס
        for i in range(1, NUM_RECORDS + 1):
            # הגרלת נתונים לכל שורה
            b_id = i
            amount = random.randint(1, 8)  # בין 1 ל-8 אנשים
            
            # יצירת תאריך אקראי בשנה האחרונה
            days_ago = random.randint(1, 365)
            b_date = datetime.now() - timedelta(days=days_ago)
            
            b_status = random.choice(['TRUE', 'FALSE'])
            t_i_id = random.choice(instance_ids)
            c_id = random.choice(customer_ids)

            # יצירת השורה של ה-SQL
            sql_line = f"INSERT INTO BOOKINGS (b_ID, amount_pepole, b_date, b_status, t_i_ID, c_ID) " \
                       f"VALUES ({b_id}, {amount}, '{b_date.date()}', {b_status}, {t_i_id}, {c_id});\n"
            
            f.write(sql_line)

    print(f"Success! {FILE_NAME} was created with {NUM_RECORDS} lines.")

if __name__ == "__main__":
    create_massive_data()