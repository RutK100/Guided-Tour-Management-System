--================ טרנזקציה ראששונה commmit 
SELECT b_ID, amount_pepole, total_price FROM BOOKINGS LIMIT 5;

BEGIN;

UPDATE BOOKINGS b
SET total_price = b.amount_pepole * t.price
FROM TOURINSTANCE ti JOIN TOUR t ON ti.t_name = t.t_name
WHERE b.t_i_ID = ti.t_i_ID;

SELECT b_ID, amount_pepole, total_price FROM BOOKINGS LIMIT 5;

COMMIT;

SELECT b_ID, total_price FROM BOOKINGS LIMIT 5;

--================ טרנזקציה ראששונה rollback 
SELECT t_name, price FROM TOUR WHERE t_name IN (SELECT t_name FROM TOURINSTANCE);

BEGIN;

UPDATE TOUR t

SELECT t_name, price FROM TOUR WHERE t_name IN (SELECT t_name FROM TOURINSTANCE);

SET t.price = t.price * 1.1
WHERE t.t_name IN (
    SELECT ti.t_name
    FROM TOURINSTANCE ti
    JOIN BOOKINGS b ON ti.t_i_ID = b.t_i_ID
    GROUP BY ti.t_name
    HAVING SUM(b.amount_pepole) > 200
);
SELECT t_name, price FROM TOUR WHERE t_name IN (SELECT t_name FROM TOURINSTANCE);
ROLLBACK;


