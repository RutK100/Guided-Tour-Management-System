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
- [Phase 2: Integration](#phase-2-integration)  
## Phase 1: Design and Build the Database  

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
#### 1️⃣ First tool: using [mockaro](https://www.mockaroo.com/) to create csv file
#####  Entering a data to STATION table
- station id scope: 1-500
- 🗒️[View `STATION.csv`](DBProject_214994642_326081148/phaseA/mockarooFiles/STATION.csv)
#####  Entering a data to TOUR table
- tour id scope 1-500
🗒️[View `TOUR.csv`](DBProject_214994642_326081148/phaseA/mockarooFiles/TOUR.csv)

  
![image](DBProject_214994642_326081148/phaseA/images/STATION.png)

🗒️ **[View `STATION.csv`](Phase1/mockData/apotropusMOCK_DATA.csv)**

TO DO  in pgadmin

#### 2️⃣ Second tool: using [generatedata](https://generatedata.com/generator). to create csv file 
#####  Entering a data to CUSTOMER table

🗒️ **[View `CUSTOMER.csv`](DBProject_214994642_326081148/phaseA/generateData/CUSTOMER.csv)**
לעשותתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתתת תמונות מהאתר השני


#####  Entering a data to baby table
-  Bayby id scope 801-1200
-  Group Number  range 1-400




#### 3️⃣Third tool: using python to create csv file

### Backup 
-   backups files are kept with the date and hour of the backup:  


[go to backup folder](DBProject_214994642_326081148/PhaseA/Backup)




