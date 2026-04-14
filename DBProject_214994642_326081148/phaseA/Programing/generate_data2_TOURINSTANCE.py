import csv
import random
from datetime import datetime, timedelta

# --- הגדרות בסיסיות ---
NUM_RECORDS = 20000
OUTPUT_FILE = "TOURINSTANCE.sql"
TOURS_FILE = 'TOUR.csv'  # קובץ המקור של הסיורים

def generate_instances():
    # --- טעינת נתונים מהקובץ ---
    try:
        with open(TOURS_FILE, mode='r', encoding='utf-8') as f:
            # קריאת שמות הסיורים מתוך עמודת t_name
            tour_names = [row['t_name'] for row in csv.DictReader(f)]
    except FileNotFoundError:
        print(f"שגיאה: הקובץ {TOURS_FILE} לא נמצא. וודאי שהוא באותה תיקייה.")
        return
    except KeyError:
        print(f"שגיאה: לא נמצאה עמודה בשם 't_name' בקובץ {TOURS_FILE}.")
        return

    # נניח שיש 500 מדריכים (ניתן לשנות בהתאם לצורך)
    guide_ids = list(range(1, 501)) 

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("-- Auto-generated 20,000 Tour Instances\n\n")
        
        for i in range(1, NUM_RECORDS + 1):
            t_i_id = i  # ה-ID של המופע
            
            # הגרלת תאריך (במהלך שנת 2026)
            random_days = random.randint(0, 365)
            t_date = datetime(2026, 1, 1) + timedelta(days=random_days)
            
            # הגרלת שעות
            start_hour = random.randint(8, 16)
            duration = random.randint(2, 5)
            
            start_time = f"{start_hour:02}:00:00"
            end_time = f"{(start_hour + duration):02}:00:00"
            
            # בחירת מדריך וסיור מהרשימות
            g_id = random.choice(guide_ids)
            t_name = random.choice(tour_names)
            
            # טיפול בגרש בשם הסיור כדי שלא ישבור את ה-SQL
            t_name_safe = t_name.replace("'", "''")
            
            # יצירת שורת ה-SQL
            sql_line = f"INSERT INTO TOURINSTANCE (t_i_ID, t_date, start_time, end_time, g_ID, t_name) " \
                       f"VALUES ({t_i_id}, '{t_date.date()}', '{start_time}', '{end_time}', {g_id}, '{t_name_safe}');\n"
            
            f.write(sql_line)
            
    print(f"Success! Created {OUTPUT_FILE} with {NUM_RECORDS} records using names from {TOURS_FILE}.")

if __name__ == "__main__":
    generate_instances()