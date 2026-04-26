
-- 1. בדיקת כמות אנשים שלילית (חריגה מ-amount_pepole >= 0)
INSERT INTO BOOKINGS (b_ID, c_ID, t_i_ID, amount_pepole, total_price, b_status) 
VALUES (999, 1, 1, -5, 100, 'Confirmed');

-- 2. בדיקת זמנים הפוכים (חריגה מ-end_time > start_time)
INSERT INTO TOURINSTANCE (t_i_ID, t_name, t_date, start_time, end_time) 
VALUES (999, 'Desert Trek', '2026-06-01', '10:00:00', '08:00:00');

-- 3. בדיקת טלפון כפול למדריך (הפרת UNIQUE - ודאי שהטלפון '050-1234567' כבר קיים)
INSERT INTO GUIDE (g_ID, g_name, g_phone) 
VALUES (999, 'Israel Israeli', '050-1234567'); 

-- 4. בדיקת מחיר אפס (חריגה מ-price > 0)
INSERT INTO TOUR (t_name, max_participants, price, t_type, area, accessibility, t_level) 
VALUES ('Free Tour', 20, 0, 'Walking', 'Old City', 1, 1);

-- 5. בדיקת כמות משתתפים מקסימלית לא תקינה (חריגה מ-max_participants > 0)
INSERT INTO TOUR (t_name, max_participants, price, t_type, area, accessibility, t_level) 
VALUES ('Tiny Tour', 0, 100, 'Walking', 'Haifa', 1, 1);

-- 6. בדיקת רמת קושי מחוץ לטווח (חריגה מ-1 עד 5)
INSERT INTO TOUR (t_name, max_participants, price, t_type, area, accessibility, t_level) 
VALUES ('Extreme Tour', 10, 500, 'Hiking', 'Galilee', 0, 6);