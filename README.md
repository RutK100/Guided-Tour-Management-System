# Guided-Tour-Management-System
🌍 SweeTour - מערכת לניהול סיורים ותחנות
Rot Kalimi and Shirel Farzam
## Table of Contents  
- [Phase 1: Design and Build the Database](#phase-1-design-and-build-the-database)  
  - [Introduction](#introduction)  
  - [ERD (Entity-Relationship Diagram)](#erd-entity-relationship-diagram)  
  - [DSD (Data Structure Diagram)](#dsd-data-structure-diagram)  
  - [SQL Scripts](#sql-scripts)  
  - [Data](#data)
  - [Backup](#backup)  
- [Phase 2: Integration](#phase-2-integration)  
## Phase 1: Design and Build the Database  

### Introduction
TO DO 
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

###  ERD (Entity-Relationship Diagram)    
![ERD Diagram](DBProject_214994642_326081148/phaseA/ERD_image.png)

###  DSD (Data Structure Diagram)   
![DSD](DBProject_214994642_326081148/phaseA/DSD_image.png)

###  SQL Scripts  
Provide the following SQL scripts:  
- **Create Tables Script** - The SQL script for creating the database tables is available in the repository:

- 📜**[View `create_tables.sql`](init-db/2createTables.sql)**
- - **Insert Data Script** - The SQL script for insert data to the database tables is available in the repository:  

📜 **[View `insert_tables.sql`](init-db/3insertTables.sql)**  
 
- **Drop Tables Script** - The SQL script for droping all tables is available in the repository:  

📜 **[View `drop_tables.sql`](init-db/1dropTables.sql)**  

- **Select All Data Script**  - The SQL script for selectAll tables is available in the repository:  

📜 **[View `selectAll_tables.sql`](init-db/4selectAll.sql)**  
  









סקריפטים של SQL

תהליך חילול הנתונים (Data Generation)

גיבוי ותחזוקה

🚀 מבוא
מערכת SweeTour נועדה לנהל בצורה חכמה סיורים תיירותיים, אתרים (תחנות) והקשרים ביניהם. המערכת מאפשרת מעקב אחר לוחות זמנים, נגישות של אתרים, רמות קושי של סיורים ושיבוץ תחנות בתוך מסלולים קיימים.

🎯 מטרת מסד הנתונים
מסד הנתונים משמש כפתרון מובנה עבור מנהלי תיירות כדי:

ניהול מסלולים: ארגון סיורים לפי אזור גאוגרפי, מחיר ורמת קושי.

אופטימיזציה של תחנות: שיבוץ תחנות בתוך סיור עם סדר כרונולוגי (t_index) וזמן שהייה (s_during).

נגישות ומידע: מעקב אחר נגישות האתרים למבקרים שונים.

📊 תרשימי מבנה
ERD (Entity Relationship Diagram)
(כאן תעלו את התמונה לתיקיית images ותקשרו: ![ERD](images/erd.png))

DSD (Data Structure Diagram)
(כאן תעלו את התמונה: ![DSD](DBProject_214994642_326081148/phaseA/DSD_image.png))

📜 סקריפטים של SQL
המערכת מבוססת על הסקריפטים הבאים הנמצאים בתיקיית init-db:

יצירת טבלאות: 📜 צפייה ב-create_tables.sql

הוספת נתונים: 📜 צפייה ב-insert_tables.sql

מחיקת טבלאות: 📜 צפייה ב-drop_tables.sql

📂 נתונים
כלי ראשון: Mockaroo
השתמשנו ב-Mockaroo ליצירת הבסיס לטבלאות הישויות:

טבלת TOUR: חילול 500 סיורים כולל מחיר ורמת קושי. 📄 TOUR.csv

טבלת STATION: חילול תחנות הכוללות מיקום ונגישות. 📄 STATION.csv

כלי שני: Python Script (Custom Logic)
ליצירת הטבלה המקשרת TOURSTATION, השתמשנו בסקריפט פייתון ייעודי כדי להבטיח שלמות נתונים (Data Integrity):

הלוגיקה: הגרלת 1-5 תחנות ייחודיות לכל סיור עם אינדקס רץ.

הסקריפט: 🐍 generate_data3_TOURSTATION.py

💾 גיבוי
קבצי הגיבוי והלוגים של בסיס הנתונים נשמרים תחת תיקיית backups.

ניתן לשחזר את המערכת בכל עת באמצעות הרצת ה-Container מחדש עם קבצי ה-SQL המצורפים.
