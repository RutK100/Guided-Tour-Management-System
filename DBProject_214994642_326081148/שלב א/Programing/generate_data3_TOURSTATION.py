import csv
import random

# הגדרות שמות הקבצים
TOURS_FILE = 'TOUR.csv'
STATIONS_FILE = 'STATION.csv'
OUTPUT_FILE = 'TOURSTATION_INSERT.sql'
TARGET_ROWS = 500  # היעד הסופי שלכן

def generate_tour_stations():
    try:
        # טעינת נתונים
        with open(TOURS_FILE, mode='r', encoding='utf-8') as f:
            tours = [row['t_name'] for row in csv.DictReader(f)]
        with open(STATIONS_FILE, mode='r', encoding='utf-8') as f:
            stations = [row['s_name'] for row in csv.DictReader(f)]
    except FileNotFoundError as e:
        print(f"שגיאה: וודאי שהקובץ {e.filename} נמצא בתיקייה של הסקריפט.")
        return

    sql_statements = []
    rows_count = 0
    tour_index = 0

    # לופ שרץ עד שמגיעים ל-500 שורות בדיוק
    while rows_count < TARGET_ROWS:
        # לוקחים סיור לפי הסדר (ואם נגמרה הרשימה, חוזרים להתחלה עם %)
        current_tour = tours[tour_index % len(tours)]
        tour_index += 1
        
        # מגרילים כמה תחנות יהיו בסיור הזה (1-5), אבל לא יותר ממה שנותר ליעד
        max_possible = min(5, TARGET_ROWS - rows_count)
        num_stations = random.randint(1, max_possible)
        
        # הגרלת תחנות ייחודיות לאותו סיור
        selected_stations = random.sample(stations, num_stations)
        
        for i, station in enumerate(selected_stations, start=1):
            t_index = i
            s_during = random.randint(15, 60)
            
            # טיפול בגרש בשמות
            t_name_safe = current_tour.replace("'", "''")
            s_name_safe = station.replace("'", "''")
            
            statement = f"INSERT INTO TOURSTATION (t_name, s_name, t_index, s_during) VALUES ('{t_name_safe}', '{s_name_safe}', {t_index}, {s_during});"
            sql_statements.append(statement)
            rows_count += 1

    # כתיבה לקובץ
    with open(OUTPUT_FILE, mode='w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))

    print(f"בוצע! הקובץ {OUTPUT_FILE} מכיל {len(sql_statements)} שורות INSERT.")

if __name__ == "__main__":
    generate_tour_stations()