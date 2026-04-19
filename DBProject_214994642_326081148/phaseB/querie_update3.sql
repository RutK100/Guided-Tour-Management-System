-- עדכון משך זמן הסיור בטבלת TOUR לפי הפרש השעות ב-TOURINSTANCE
UPDATE TOUR t
SET t.t_duration = (
    SELECT AVG(EXTRACT(HOUR FROM (ti.end_time - ti.start_time)))
    FROM TOURINSTANCE ti
    WHERE ti.t_name = t.t_name
)
WHERE t.t_name IN (SELECT t_name FROM TOURINSTANCE);

-- עדכון המחיר הכולל בטבלת BOOKINGS לפי כמות האנשים ומחיר הסיור
UPDATE BOOKINGS b
SET b.total_price = b.amount_pepole * t.price
FROM TOURINSTANCE ti JOIN TOUR t ON ti.t_name = t.t_name
WHERE b.t_i_ID = ti.t_i_ID;


-- עדכון כמות האנשים בסיורים שהמחיר שלהם עלה ב-10%
UPDATE BOOKINGS b
SET b.amount_pepole = b.amount_pepole * 1.1
FROM TOURINSTANCE ti JOIN TOUR t ON ti.t_name = t.t_name
WHERE b.t_i_ID = ti.t_i_ID
AND t.price > (SELECT price FROM TOUR WHERE t_name = t.t_name AND price > 1000);