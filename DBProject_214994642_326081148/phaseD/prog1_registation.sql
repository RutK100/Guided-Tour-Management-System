-- תוכנית1- הזמנות
DO $$
DECLARE
    v_tour_id INT := 200;          -- מס' סיור לבדיקה
    v_customer_id INT := 60;      -- מס' לקוח לבדיקה
    v_spots_before INTEGER;
BEGIN
    RAISE NOTICE '--- תוכנית ראשית 1: רישום לקוח לסיור ---';

    -- 1. זימון הפונקציה לבדיקת זמינות
    v_spots_before := fn_get_remaining_spots(v_tour_id);
    RAISE NOTICE 'מספר מקומות פנויים לפני הרישום: %', v_spots_before;

    -- 2. זימון הפרוצדורה לביצוע הרישום
    CALL pr_register_customer(v_customer_id, v_tour_id);
    
    RAISE NOTICE 'התוכנית הראשית הסתיימה בהצלחה.';
END $$;



--שאילתה שמביאה את כל מספרי הרשומים לסיור מספר #
SELECT DISTINCT customerid
FROM registration
WHERE tourid = 200
ORDER BY customerid ASC;





---שאילתה כדי לדעת באיזה סיורים יש מקום (בשבילנו)
SELECT 
    t.tourid, 
    t.meetingpoint, 
    t.maxparticipants, 
    SUM(r.numpeople) AS total_registered,
    (t.maxparticipants - SUM(r.numpeople)) AS spots_left
FROM guidedtour t
JOIN registration r ON t.tourid = r.tourid
GROUP BY t.tourid, t.meetingpoint, t.maxparticipants
HAVING SUM(r.numpeople) < t.maxparticipants 
   AND SUM(r.numpeople) > 0
ORDER BY spots_left DESC;


-- בואי נראה את כל הנתונים של הסיור הזה
SELECT * FROM registration 
WHERE tourid = 368;



