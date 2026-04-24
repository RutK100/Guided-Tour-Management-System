--1--
-- Target Screen: Database Maintenance / Archive
-- מחיקת הזמנות לא משולמות משנת 2024
DELETE FROM bookings
WHERE b_status = FALSE
  AND EXTRACT(YEAR FROM b_date) < 2024;

--2--
-- Target Screen: Tour Schedule Management
-- מחיקת סיורים שלא הוזמנו
DELETE FROM tourInstance ti
WHERE NOT EXISTS (
    SELECT 1 
    FROM bookings b 
    WHERE b.t_i_ID = ti.t_i_ID
);

--3--
-- Target Screen: Guide & School Management
-- מחיקת מדריכים שהעבירו סיורים לפני יותר משנה
---------------לשנותתתתתתתתתת
DELETE FROM GUIDE
WHERE g_ID IN (
    SELECT g_ID 
    FROM TOURINSTANCE 
    GROUP BY g_ID
    HAVING MAX(t_date) < CURRENT_DATE - INTERVAL '1' YEAR
);