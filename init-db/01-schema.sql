-- 1. טבלאות עצמאיות (ללא Foreign Keys)
CREATE TABLE CUSTOMER (
    c_ID INT NOT NULL,
    c_first_name VARCHAR(30) NOT NULL,
    c_last_name VARCHAR(30) NOT NULL,
    c_email VARCHAR(60) NOT NULL,
    c_phone VARCHAR(15) NOT NULL, -- שיניתי ל-VARCHAR כי טלפון מתחיל ב-0
    PRIMARY KEY (c_ID)
);

CREATE TABLE TOUR (
    t_name VARCHAR(100) NOT NULL,
    max_participants INT NOT NULL,
    price INT NOT NULL,
    t_type VARCHAR(30) NOT NULL,
    area VARCHAR(100) NOT NULL,
    accessibility INT NOT NULL,
    level INT NOT NULL,
    PRIMARY KEY (t_name)
);

CREATE TABLE GUIDE (
    g_ID INT NOT NULL,
    g_first_name VARCHAR(30) NOT NULL,
    g_last_name VARCHAR(30) NOT NULL,
    g_phone VARCHAR(15) NOT NULL, -- שיניתי ל-VARCHAR
    g_email VARCHAR(60) NOT NULL,
    school VARCHAR(100) NOT NULL, -- שיניתי ל-VARCHAR (שם בית ספר הוא טקסט)
    PRIMARY KEY (g_ID)
);

CREATE TABLE STATION (
    s_name VARCHAR(100) NOT NULL,
    addres VARCHAR(150) NOT NULL,
    description VARCHAR(300) NOT NULL,
    PRIMARY KEY (s_name)
);

-- 2. טבלאות תלויות (עם Foreign Keys)
CREATE TABLE TOURINSTANCE (
    t_i_ID INT NOT NULL,
    t_date DATE NOT NULL,
    start_time TIME NOT NULL, -- בפוסטגרס משתמשים ב-TIME לשעה ו-DATE לתאריך
    end_time TIME NOT NULL,
    g_ID INT NOT NULL,
    t_name VARCHAR(100) NOT NULL, -- תיקון: חייב להיות VARCHAR כדי להתאים לטבלת TOUR
    PRIMARY KEY (t_i_ID),
    FOREIGN KEY (g_ID) REFERENCES GUIDE(g_ID),
    FOREIGN KEY (t_name) REFERENCES TOUR(t_name)
);

CREATE TABLE BOOKINGS (
    b_ID INT NOT NULL,
    amount_pepole INT NOT NULL,
    b_date DATE NOT NULL,
    status BOOLEAN NOT NULL, -- בפוסטגרס עדיף BOOLEAN במקום BIT
    t_i_ID INT NOT NULL,
    c_ID INT NOT NULL,
    PRIMARY KEY (b_ID),
    FOREIGN KEY (t_i_ID) REFERENCES TOURINSTANCE(t_i_ID),
    FOREIGN KEY (c_ID) REFERENCES CUSTOMER(c_ID)
);

CREATE TABLE TOURSTATION (
    index INT NOT NULL,
    s_during FLOAT NOT NULL,
    t_name VARCHAR(100) NOT NULL, -- תיקון: חייב להיות VARCHAR כדי להתאים ל-TOUR
    s_name VARCHAR(100) NOT NULL, -- תיקון: חייב להיות VARCHAR כדי להתאים ל-STATION
    PRIMARY KEY (index, t_name, s_name),
    FOREIGN KEY (t_name) REFERENCES TOUR(t_name),
    FOREIGN KEY (s_name) REFERENCES STATION(s_name)
);