--================ טרנזקציה ראששונה commmit 
SELECT b_ID, amount_pepole, total_price FROM BOOKINGS ORDER BY b_ID LIMIT 5;

BEGIN;

UPDATE BOOKINGS b
SET total_price = b.amount_pepole * t.price
FROM TOURINSTANCE ti JOIN TOUR t ON ti.t_name = t.t_name
WHERE b.t_i_ID = ti.t_i_ID;

SELECT b_ID, amount_pepole, total_price FROM BOOKINGS ORDER BY b_ID LIMIT 5;

COMMIT;
SELECT b_ID, amount_pepole, total_price FROM BOOKINGS ORDER BY b_ID LIMIT 5;

--================ טרנזקציה ראששונה rollback 
SELECT b_ID, total_price 
FROM BOOKINGS 
ORDER BY total_price DESC;

BEGIN;
UPDATE BOOKINGS b
SET total_price = total_price * 0.85 
WHERE b.total_price > 1000
AND b.c_ID IN (
    SELECT c_ID
    FROM BOOKINGS
    GROUP BY c_ID
    HAVING COUNT(b_ID) > 3
);

SELECT b_ID, total_price 
FROM BOOKINGS 
ORDER BY total_price DESC;

ROLLBACK;

SELECT b_ID, total_price 
FROM BOOKINGS 
ORDER BY total_price DESC;