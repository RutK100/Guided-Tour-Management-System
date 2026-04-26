-- עדכון משך זמן הסיור בטבלת TOUR לפי הפרש השעות ב-TOURINSTANCE
UPDATE TOUR t
SET t_duration = (
    SELECT AVG(EXTRACT(EPOCH FROM (ti.end_time - ti.start_time)) / 3600)
    FROM TOURINSTANCE ti
    WHERE ti.t_name = t.t_name
)
WHERE t.t_name IN (SELECT t_name FROM TOURINSTANCE);

-- עדכון המחיר הכולל בטבלת BOOKINGS לפי כמות האנשים ומחיר הסיור
UPDATE BOOKINGS b
SET total_price = b.amount_pepole * t.price
FROM TOURINSTANCE ti 
JOIN TOUR t ON ti.t_name = t.t_name
WHERE b.t_i_ID = ti.t_i_ID;

--3--
-- עדכון המחיר של הסיורים שהעבירו יותר מ5 סיורים
UPDATE TOUR t
SET price = price * 1.10
WHERE t_name IN (
    SELECT ti.t_name
    FROM TOURINSTANCE ti
    JOIN BOOKINGS b ON ti.t_i_ID = b.t_i_ID
    GROUP BY ti.t_name
    HAVING COUNT(b.b_ID) > 5
);