
-- 1 -- 
-- מחזיר את השם של המדריך ואת מספר סיורי ההליכה שהוא העביר
-- רק עבור מדריכים שהרדיכו יותר מ5 סיורי הליכה
SELECT g.g_first_name, g.g_last_name, COUNT(ti.t_i_ID) AS hiking_tours_count
FROM GUIDE g
JOIN TOURINSTANCE ti ON g.g_ID = ti.g_ID
JOIN TOUR t ON ti.t_name = t.t_name
WHERE t.t_type = 'Hiking'
GROUP BY g.g_ID, g.g_first_name, g.g_last_name
HAVING COUNT(ti.t_i_ID) > 5
ORDER BY hiking_tours_count DESC;

--2--
-- מחזיר את השם פרטי ושם משפחה של המדריך ומספר הטלפון שלו
-- רק עבור מדריכים שהעבירו סיורים נגישים
SELECT DISTINCT g.g_first_name, g.g_last_name, g.g_phone
FROM GUIDE g
JOIN TOURINSTANCE ti ON g.g_ID = ti.g_ID
JOIN TOUR t ON ti.t_name = t.t_name
WHERE t.accessibility = 1
ORDER BY g.g_last_name ASC;

--3--
-- מחזיר את השם של הסיור ואת משך הסיור
-- רק עבור סיורים שהמשך שלהם הוא 2 שעות לפחות
SELECT t.t_name,
       EXTRACT(YEAR FROM ti.t_date) AS tour_year,
       EXTRACT(MONTH FROM ti.t_date) AS tour_month,
       EXTRACT(DAY FROM ti.t_date) AS tour_day,
       t.t_duration
FROM TOUR t
JOIN TOURINSTANCE ti ON t.t_name = ti.t_name
WHERE t.t_duration >= 2
ORDER BY tour_year, tour_month, tour_day;

--4--
--וגם את שם המדריך מחזיר את השם של הסיור ואת שעת ההתחלה והסיום שלו 
--רק עבור סיורים שמתחילים אחרי 18:00 
SELECT t_name, start_time, end_time, g.g_first_name, g.g_last_name
FROM TOURINSTANCE t 
JOIN GUIDE g ON g.g_ID = ti.g_ID
WHERE start_time >= '18:00:00'
ORDER BY start_time ASC;

--5--
-- מחזיר את השם פרטי ושם משפחה של המדריך ואת מספר הסיורים המקצועיים שהוא העביר
-- רק עבור מדריכים שהעבירו יותר מ2 סיורים מקצועיים
SELECT g.g_first_name, g.g_last_name, COUNT(ti.t_i_ID) AS professional_tours
FROM GUIDE g
JOIN TOURINSTANCE ti ON g.g_ID = ti.g_ID
JOIN TOUR t ON ti.t_name = t.t_name
WHERE t.t_level = 5 AND t.price > 100
GROUP BY g.g_ID, g.g_first_name, g.g_last_name
HAVING COUNT(ti.t_i_ID) >= 2;

--6--
-- מחזיר את השם פרטי ושם משפחה של הלקוח ואת מספר הטלפון שלו
-- רק עבור לקוחות שהזמינו 25 סיורים לא משולמים
SELECT c.c_ID, c.c_first_name, c.c_last_name, c.c_phone
FROM CUSTOMER c
JOIN BOOKINGS b ON c.c_ID = b.c_ID
WHERE b.b_status = FALSE
GROUP BY c.c_ID, c.c_first_name, c.c_last_name, c.c_phone
HAVING COUNT(b.b_id) > 25
ORDER BY c.c_last_name;

--7--
-- מחזיר את המדריכים בסיורים בחודשי הקיץ 
SELECT EXTRACT(MONTH FROM t_date) AS tour_month, 
       COUNT(*) AS total_instances,
       g.g_first_name AS guide_name, 
       g.g_phone AS guide_phone
FROM TOURINSTANCE ti
JOIN GUIDE g ON ti.g_ID = g.g_ID
WHERE EXTRACT(MONTH FROM t_date) IN (6, 7)
  AND EXTRACT(YEAR FROM t_date) = 2026
GROUP BY EXTRACT(MONTH FROM t_date), g.g_first_name, g.g_phone;

-- 8 --
-- מחזיר את שם המדריך ואת סכום המחירים של כל הסיורים שהוא העביר
-- רק עבור מדריכים שהניבו הכנסה מצטברת של מעל 500 ש"ח
SELECT g.g_first_name, g.g_last_name, SUM(t.price) AS total_revenue
FROM GUIDE g
JOIN TOURINSTANCE ti ON g.g_ID = ti.g_ID
JOIN TOUR t ON ti.t_name = t.t_name
GROUP BY g.g_ID, g.g_first_name, g.g_last_name
HAVING SUM(t.price) > 500
ORDER BY total_revenue DESC;

-- שאילתות פחות יעילות
-- 2 ב 
-- גרסה פחות יעילה: שימוש ב-IN
SELECT g_first_name, g_last_name, g_phone
FROM GUIDE
WHERE g_ID IN (
    SELECT ti.g_ID 
    FROM TOURINSTANCE ti
    WHERE ti.t_name IN (
        SELECT t_name FROM TOUR WHERE accessibility = 1
    )
);
--6 ב 
-- מחזיר את השם פרטי ושם משפחה של הלקוח ואת מספר הטלפון שלו
-- רק עבור לקוחות שהזמינו 25 סיורים לא משולמים
SELECT c.c_first_name, c.c_last_name, c.c_phone
FROM CUSTOMER c
WHERE (
    SELECT COUNT(*)
    FROM BOOKINGS b
    WHERE b.c_ID = c.c_ID AND b.b_status = FALSE
) > 25
ORDER BY c_last_name;

--7 ב 
-- מחזיר את המדריכים בסיורים בחודשי הקיץ 
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

-- 8 --
-- מחזיר את שם המדריך ואת סכום המחירים של כל הסיורים שהוא העביר
-- רק עבור מדריכים שהניבו הכנסה מצטברת של מעל 500 ש"ח

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