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
-- מחיקת מדריכים שהעבירו פחות מ50 סיורים
DELETE FROM GUIDE
WHERE g_id NOT IN (
    SELECT DISTINCT g_id 
    FROM TOURINSTANCE 
    GROUP BY g_id 
    HAVING COUNT(*) >= 50
);