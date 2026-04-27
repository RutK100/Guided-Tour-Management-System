# Guided-Tour-Management-System
🌍 SweeTour - Tour management system
Rot Kalimi and Shirel Farzam
## Table of Contents  
- [Phase 1: Design and Build the Database](#phase-1-design-and-build-the-database)  
  - [Introduction](#introduction)
  - [Images from the site](#images-from-the-site)  
  - [ERD (Entity-Relationship Diagram)](#erd-entity-relationship-diagram)  
  - [DSD (Data Structure Diagram)](#dsd-data-structure-diagram)  
  - [SQL Scripts](#sql-scripts)  
  - [Data](#data)
  - [Backup](#backup)  
- [Phase 2: Queries](#phase-2-Queries)

# Phase 1: Design and Build the Database  

### Introduction
SweeTour is an advanced platform designed for planning and managing guided tours, streamlining the connection between tour operators, guides, and customers. The system offers a comprehensive solution for the entire "tour experience"—from building detailed routes with specific time stations and geographic locations, to managing guide assignments and tracking real-time bookings and revenue.  

### Purpose of the Database
This database serves as a structured and reliable solution for tour management systems to:
Organize tour routes based on geographic areas, pricing, and difficulty levels.
Manage station sequences by linking specific points of interest to tours with chronological indexes.
Maintain station-tour relationships, ensuring a smooth flow of information regarding site visits.
Store site specifications, including accessibility details and duration of stay for each station.
Track essential tour data such as participant limits, pricing strategies, and historical tour instances.

### Potential Use Cases
Tour Operators and Administrators can use this database to efficiently design new routes, manage site allocations, and set pricing models.
Tour Guides can track their assigned tour instances, view the specific sequence of stations, and prepare for site-specific durations.
Travelers and Clients can explore available tours based on their preferred area, budget, and accessibility requirements.
Operational Staff can use the system for record-keeping of tour executions, scheduling, and resource management.

### images-from-the-site
A folder containing images from our system built on the site.
[Click here to view the images](DBProject_214994642_326081148/phaseA/images)

###  ERD (Entity-Relationship Diagram)    
![ERD Diagram](DBProject_214994642_326081148/phaseA/ERD_image.png)

###  DSD (Data Structure Diagram)   
![DSD](DBProject_214994642_326081148/phaseA/DSD_image.png)

###  SQL Scripts  
Provide the following SQL scripts:  
- **Create Tables Script** - The SQL script for creating the database tables is available in the repository:

🗒️ **[View `create_tables.sql`](init-db/2createTables.sql)**
 - **Insert Data Script** - The SQL script for insert data to the database tables is available in the repository:  

🗒️ **[View `insert_tables.sql`](init-db/3insertTables.sql)**  
 
- **Drop Tables Script** - The SQL script for droping all tables is available in the repository:  

🗒️ **[View `drop_tables.sql`](init-db/1dropTables.sql)**  

- **Select All Data Script**  - The SQL script for selectAll tables is available in the repository: 

🗒️ **[View `selectAll_tables.sql`](init-db/4selectAll.sql)**  

###  Data  
#### 1️⃣ First Method: Direct SQL Scripts (Mockaroo Export)
#### Tool: using [mockaro](https://www.mockaroo.com/) to create csv file
We exported structured data from Mockaroo as .sql files containing INSERT statements. These scripts were integrated into our workspace and executed to populate the core tables.

#####  Entering a data to STATION table
- station id scope: 1-500
- 🗒️[View `STATION.sql`](DBProject_214994642_326081148/phaseA/mockarooFiles/STATION.sql)

![genererte station's data in the site](DBProject_214994642_326081148/phaseA/images/STATION.png)


#### 2️⃣ Second Method: CSV Import via pgAdmin
#### Tool: import csv files (that generated in mockaroo)
We generated raw data in CSV format and utilized the pgAdmin Import Tool. This allowed us to map spreadsheet data directly to our existing database schema efficiently.

#####  Entering a data to CUSTOMER table
#####  Entering a data to TOUR table
- tour id scope 1-500
🗒️ **[View `TOUR.csv`](DBProject_214994642_326081148/phaseA/mockarooFiles/TOUR.csv)**

🗒️ **[View `GUIDE.csv`](DBProject_214994642_326081148/phaseA/generateData/GUIDE.csv)**


![import data](DBProject_214994642_326081148/phaseA/images/import2.png)

![import seccside](DBProject_214994642_326081148/phaseA/images/import_guid_pgAdmin.png)





#### 3️⃣ Third method: Custom Python Scripting & SQL Generation
#### Tools: using python to create csv file
We developed a Python script to handle complex data logic, such as the many-to-many relationship between tours and stations. This script automatically generated precise SQL INSERT statements, ensuring data integrity and consistency across the database.

![script python for booking scama](DBProject_214994642_326081148/phaseA/images/script.png)

![booking data](DBProject_214994642_326081148/phaseA/images/data_booking_pgAdmin.png)


### Backup 
-   Clicking on the backup files (of the two methods required):  

[backup from pgAdmin (UI)](DBProject_214994642_326081148/phaseA/backups/backup_23_04_2026.sql)

[backup from CLI](DBProject_214994642_326081148/phaseA/backups/backup_cli_23_04.sql)

-Pictures from the backup creation process:

![creating backup from pgAdmin (UI)](DBProject_214994642_326081148/phaseA/images/backup_pgAdmin1.png)
![succeeded backup from pgAdmin (UI)](DBProject_214994642_326081148/phaseA/images/backup_pgAdmin2.png)
![creating backup from CLI](DBProject_214994642_326081148/phaseA/images/backup_cli3.png)

# Phase 2: Queries



## SELECT queries:
 🎭- next to the duplicate queries.
<!--<img src="/DBProject_214994642_326081148/phaseB/images_B/q1.png" alt="Querie 1" width="600"> -->

### Query 1: Top Hiking Guides
מחזיר את השם של המדריך ואת מספר סיורי ההליכה שהוא העביר
רק עבור מדריכים שהרדיכו יותר מ5 סיורי הליכה

SQL Code:
      
      SELECT g.g_first_name, g.g_last_name, COUNT(ti.t_i_ID) AS hiking_tours_count
      FROM GUIDE g
      JOIN TOURINSTANCE ti ON g.g_ID = ti.g_ID
      JOIN TOUR t ON ti.t_name = t.t_name
      WHERE t.t_type = 'Hiking'
      GROUP BY g.g_ID, g.g_first_name, g.g_last_name
      HAVING COUNT(ti.t_i_ID) > 5
      ORDER BY hiking_tours_count DESC;
![Querie 1](/DBProject_214994642_326081148/phaseB/images_B/q1.png)

### 🎭 Query 2: Accessible Tour Guides
מחזיר את השם פרטי ושם משפחה של המדריך ומספר הטלפון שלו
רק עבור מדריכים שהעבירו סיורים נגישים

SQL Code:
      
    SELECT DISTINCT g.g_first_name, g.g_last_name, g.g_phone
    FROM GUIDE g
    JOIN TOURINSTANCE ti ON g.g_ID = ti.g_ID
    JOIN TOUR t ON ti.t_name = t.t_name
    WHERE t.accessibility = 1
    ORDER BY g.g_last_name ASC;

    -- פחות יעילה
    SELECT g_first_name, g_last_name, g_phone
    FROM GUIDE
    WHERE g_ID IN (
        SELECT ti.g_ID 
        FROM TOURINSTANCE ti
        WHERE ti.t_name IN (
            SELECT t_name FROM TOUR WHERE accessibility = 1
        )
    );


![Querie 2](/DBProject_214994642_326081148/phaseB/images_B/q2_a.png)
![Querie 2](/DBProject_214994642_326081148/phaseB/images_B/q2_a_time.png)

![Querie 2](/DBProject_214994642_326081148/phaseB/images_B/q2_b.png)
![Querie 2](/DBProject_214994642_326081148/phaseB/images_B/q2_b_time.png)
בבדיקת זמני הריצה שביצענו, ניכר הבדל משמעותי בין שתי הצורות:

צורה א' (JOIN): זמן ריצה של כ-345ms.

צורה ב' (Nested IN): זמן ריצה של כ-4,859ms (מעל 4 שניות).

מדוע צורה א' (JOIN) יעילה יותר במקרה זה?

אופטימיזציה של ה-Join: בשימוש ב-JOIN, מנוע בסיס הנתונים (Query Optimizer) יכול לתכנן מסלול גישה יעיל שמשלב את הטבלאות במקביל, תוך שימוש באינדקסים על המפתחות הזרים (g_id, t_name).

עלות הקינון: בצורה ב', בסיס הנתונים נדרש לבנות "קבוצות זמניות" (Intermediate result sets) עבור כל רמת קינון. בטבלאות גדולות, הפעולה של בדיקת IN מול רשימה ארוכה שנוצרת בזמן אמת היא הרבה יותר "יקרה" מבחינת משאבי עיבוד מאשר חיבור טבלאות ישיר.

מסקנה: למרות שצורה ב' לעיתים קריאה יותר לאנשים מסוימים, היא איטית משמעותית במקרה של ריבוי נתונים, ולכן נעדיף להשתמש ב-JOIN (צורה א') או ב-EXISTS בייצור


### Querie 3
מחזיר את השם של הסיור ואת משך הסיור
רק עבור סיורים שהמשך שלהם הוא 2 שעות לפחות

SQL Code:
      
SELECT t.t_name,
       EXTRACT(YEAR FROM ti.t_date) AS tour_year,
       EXTRACT(MONTH FROM ti.t_date) AS tour_month,
       EXTRACT(DAY FROM ti.t_date) AS tour_day,
       t.t_duration
FROM TOUR t
JOIN TOURINSTANCE ti ON t.t_name = ti.t_name
WHERE t.t_duration >= 2
ORDER BY tour_year, tour_month, tour_day;

![Querie 3](/DBProject_214994642_326081148/phaseB/images_B/q3.png)

### Querie 4
וגם את שם המדריך מחזיר את השם של הסיור ואת שעת ההתחלה והסיום שלו 
רק עבור סיורים שמתחילים אחרי 18:00 

SQL Code:
      
SELECT t_name, start_time, end_time, g.g_first_name, g.g_last_name
FROM TOURINSTANCE t 
JOIN GUIDE g ON g.g_ID = ti.g_ID
WHERE start_time >= '18:00:00'
ORDER BY start_time ASC;

![Querie 4](/DBProject_214994642_326081148/phaseB/images_B/q4.png)

### Querie 5
מחזיר את השם פרטי ושם משפחה של המדריך ואת מספר הסיורים המקצועיים שהוא העביר
רק עבור מדריכים שהעבירו יותר מ2 סיורים מקצועיים

SQL Code:
      
SELECT g.g_first_name, g.g_last_name, COUNT(ti.t_i_ID) AS professional_tours
FROM GUIDE g
JOIN TOURINSTANCE ti ON g.g_ID = ti.g_ID
JOIN TOUR t ON ti.t_name = t.t_name
WHERE t.t_level = 5 AND t.price > 100
GROUP BY g.g_ID, g.g_first_name, g.g_last_name
HAVING COUNT(ti.t_i_ID) >= 2;

![Querie 5](/DBProject_214994642_326081148/phaseB/images_B/q5.png)

### 🎭Querie 6
מחזיר את השם פרטי ושם משפחה של הלקוח ואת מספר הטלפון שלו
רק עבור לקוחות שהזמינו 25 סיורים לא משולמים

SQL Code:
      
SELECT c.c_ID, c.c_first_name, c.c_last_name, c.c_phone
FROM CUSTOMER c
JOIN BOOKINGS b ON c.c_ID = b.c_ID
WHERE b.b_status = FALSE
GROUP BY c.c_ID, c.c_first_name, c.c_last_name, c.c_phone
HAVING COUNT(b.b_id) > 25
ORDER BY c.c_last_name;

-- פחות יעילה
SELECT c.c_first_name, c.c_last_name, c.c_phone
FROM CUSTOMER c
WHERE (
    SELECT COUNT(*)
    FROM BOOKINGS b
    WHERE b.c_ID = c.c_ID AND b.b_status = FALSE
) > 25
ORDER BY c_last_name;


![Querie 6](/DBProject_214994642_326081148/phaseB/images_B/q6_a.png)
![Querie 6](/DBProject_214994642_326081148/phaseB/images_B/q6_b.png)

צורה א' (JOIN): זמן ריצה של 1.73 שניות.

צורה ב' (Subquery): זמן ריצה של 13.3 שניות.

מדוע צורה א' יעילה יותר?

עיבוד קבוצתי: בצורה א', בסיס הנתונים מחבר את הטבלאות פעם אחת ומבצע ספירה מרוכזת על כל הנתונים יחד.

עיבוד שורתי: בצורה ב', בסיס הנתונים נאלץ להריץ את תת-השאילתא מחדש עבור כל שורה ושורה בטבלת הלקוחות. פעולה חוזרת זו גורמת לעיכוב משמעותי ככל שכמות הלקוחות בטבלה גדלה.

מסקנה: צורה א' עדיפה לשימוש במערכת כיוון שהיא מהירה פי כמה ומבצעת חישוב מאוחד במקום חישובים חוזרים.

### 🎭Querie 7
מחזיר את המדריכים בסיורים בחודשי הקיץ 

SQL Code:
      
SELECT EXTRACT(MONTH FROM t_date) AS tour_month, 
       COUNT(*) AS total_instances,
       g.g_first_name AS guide_name, 
       g.g_phone AS guide_phone
FROM TOURINSTANCE ti
JOIN GUIDE g ON ti.g_ID = g.g_ID
WHERE EXTRACT(MONTH FROM t_date) IN (6, 7)
  AND EXTRACT(YEAR FROM t_date) = 2026
GROUP BY EXTRACT(MONTH FROM t_date), g.g_first_name, g.g_phone;

-- פחות יעילה
SELECT DISTINCT
    EXTRACT(MONTH FROM t1.t_date) AS tour_month,
    (SELECT COUNT(*) 
     FROM TOURINSTANCE t2 
     WHERE EXTRACT(MONTH FROM t2.t_date) = EXTRACT(MONTH FROM t1.t_date)
       AND t2.g_ID = t1.g_ID) AS total_instances,
    (SELECT g_first_name 
     FROM GUIDE g 
     WHERE g.g_ID = t1.g_ID) AS guide_name,
    (SELECT g_phone 
     FROM GUIDE g 
     WHERE g.g_ID = t1.g_ID) AS guide_phone
FROM TOURINSTANCE t1
WHERE EXTRACT(MONTH FROM t1.t_date) IN (6, 7)
  AND EXTRACT(YEAR FROM t1.t_date) = 2026;


![Querie 7](/DBProject_214994642_326081148/phaseB/images_B/q7_a.png)
![Querie 7](/DBProject_214994642_326081148/phaseB/images_B/q7_b.png)

צורה א' (JOIN + GROUP BY): זמן ריצה של 344ms.

צורה ב' (Scalar Subqueries): זמן ריצה של 5.55 שניות.

מדוע צורה א' יעילה יותר?

מניעת הרצות חוזרות: בצורה א', בסיס הנתונים מבצע חיבור (Join) אחד וסכימה אחת עבור כל הנתונים. בצורה ב', עבור כל שורה בתוצאה, בסיס הנתונים נאלץ להריץ 3 תתי-שאילתות נפרדות (אחת לספירה, אחת לשם ואחת לטלפון).

שימוש ב-Group By: פקודת ה-GROUP BY מאפשרת למנוע ה-SQL לעבד את כל קבוצות הנתונים במעבר אחד יעיל, בעוד שצורה ב' יוצרת עומס חישובי כבד שגדל ככל שיש יותר שורות בטבלה.

מסקנה: צורה א' היא הדרך המומלצת לביצוע חישובים מצטברים, שכן היא מהירה פי 16 מהחלופה המקוננת.


### 🎭Querie 8
מחזיר את שם המדריך ואת סכום המחירים של כל הסיורים שהוא העביר
רק עבור מדריכים שהניבו הכנסה מצטברת של מעל 500 ש"ח

SQL Code:
      
SELECT g.g_first_name, g.g_last_name, SUM(t.price) AS total_revenue
FROM GUIDE g
JOIN TOURINSTANCE ti ON g.g_ID = ti.g_ID
JOIN TOUR t ON ti.t_name = t.t_name
GROUP BY g.g_ID, g.g_first_name, g.g_last_name
HAVING SUM(t.price) > 500
ORDER BY total_revenue DESC;

-- פחות יעילה
SELECT g.g_first_name, g.g_last_name, 
       (SELECT SUM(t.price) 
        FROM TOUR t 
        JOIN TOURINSTANCE ti ON t.t_name = ti.t_name 
        WHERE ti.g_ID = g.g_ID) AS total_revenue
FROM GUIDE g
WHERE (SELECT SUM(t.price) 
       FROM TOUR t 
       JOIN TOURINSTANCE ti ON t.t_name = ti.t_name 
       WHERE ti.g_ID = g.g_ID) > 500
ORDER BY (SELECT SUM(t.price) 
          FROM TOUR t 
          JOIN TOURINSTANCE ti ON t.t_name = ti.t_name 
          WHERE ti.g_ID = g.g_ID) DESC;
![Querie 8](/DBProject_214994642_326081148/phaseB/images_B/q8_a.png)
![Querie 8](/DBProject_214994642_326081148/phaseB/images_B/q8_b.png)

צורה א' (JOIN + GROUP BY): זמן ריצה של 198ms.

צורה ב' (Multiple Subqueries): זמן ריצה של 2.32 שניות.

מדוע צורה א' יעילה משמעותית?

חישוב מאוחד: בצורה א', מנוע ה-SQL מבצע חישוב של הסכום (SUM) פעם אחת לכל קבוצה (מדריך) תוך שימוש ב-Join יעיל.

כפל חישובים: בצורה ב', אותה תת-שאילתא מורכבת מופיעה 3 פעמים (ב-SELECT, ב-WHERE וב-ORDER BY). המשמעות היא שעבור כל שורה בטבלת המדריכים, בסיס הנתונים מריץ את החישוב הכבד 3 פעמים בנפרד.

מסקנה: צורה א' מהירה פי 11 מצורה ב'. שימוש ב-GROUP BY ו-HAVING הוא הסטנדרט המקצועי לביצוע אגרגציות, בעוד שצורה ב' יוצרת עומס מיותר ואיטיות ניכרת.

## DELETE queries:

### Delete querie 1
![](/DBProject_214994642_326081148/phaseB/images_B/pre_d1.png)
![](/DBProject_214994642_326081148/phaseB/images_B/pro_d1.png)


### Delete querie 2
![](/DBProject_214994642_326081148/phaseB/images_B/pre_d2.png)
![](/DBProject_214994642_326081148/phaseB/images_B/pro_d2.png)


### Delete querie 3
![](/DBProject_214994642_326081148/phaseB/images_B/pre_d3.png)
![](/DBProject_214994642_326081148/phaseB/images_B/pro_d3.png)

## UPDATE queries:

### Update querie 1
![](/DBProject_214994642_326081148/phaseB/images_B/pre_update1.png)
![](/DBProject_214994642_326081148/phaseB/images_B/pro_update1.png)
![](/DBProject_214994642_326081148/phaseB/images_B/pro_update1_data.png)

### Update querie 2
![](/DBProject_214994642_326081148/phaseB/images_B/pre_update2.png)
![](/DBProject_214994642_326081148/phaseB/images_B/pro_update2.png)
![](/DBProject_214994642_326081148/phaseB/images_B/pro_update2_data.png)


### Update querie 3
![](/DBProject_214994642_326081148/phaseB/images_B/pre_update3.png)
![](/DBProject_214994642_326081148/phaseB/images_B/pro_update3.png)
![](/DBProject_214994642_326081148/phaseB/images_B/pro_update3_data.png)


## ALTER-TABLE
![](/DBProject_214994642_326081148/phaseB/images_B/alter_table%20.png)

## CONSTRAINS
### Constrain num 1 
![](/DBProject_214994642_326081148/phaseB/images_B/constrain1_pre.png)
![](/DBProject_214994642_326081148/phaseB/images_B/constrain1_pro.png)

### Constrain num 2
![](/DBProject_214994642_326081148/phaseB/images_B/constrain2_pre.png)
![](/DBProject_214994642_326081148/phaseB/images_B/constrain2_pro.png)

### Constrain num 3
![](/DBProject_214994642_326081148/phaseB/images_B/constrain3_pre.png)
![](/DBProject_214994642_326081148/phaseB/images_B/constrain3_pro.png)





## COMMIT
![](/DBProject_214994642_326081148/phaseB/images_B/commit1.png)
![](/DBProject_214994642_326081148/phaseB/images_B/commit2.png)
![](/DBProject_214994642_326081148/phaseB/images_B/commit3.png)

## ROLLBACK
![](/DBProject_214994642_326081148/phaseB/images_B/rollback1.png)
![](/DBProject_214994642_326081148/phaseB/images_B/rollback2.png)
![](/DBProject_214994642_326081148/phaseB/images_B/rollback3.png)

## INDEX
### Index num 1

![](/DBProject_214994642_326081148/phaseB/images_B/index1_pre.png)
![](/DBProject_214994642_326081148/phaseB/images_B/index1.png)
![](/DBProject_214994642_326081148/phaseB/images_B/index1_pro.png)

### Index num 2

![](/DBProject_214994642_326081148/phaseB/images_B/index2_pre.png)
![](/DBProject_214994642_326081148/phaseB/images_B/index2.png)
![](/DBProject_214994642_326081148/phaseB/images_B/index2_pro.png)

### Index num 3

![](/DBProject_214994642_326081148/phaseB/images_B/index3_pre.png)
![](/DBProject_214994642_326081148/phaseB/images_B/index3_pro.png)

















