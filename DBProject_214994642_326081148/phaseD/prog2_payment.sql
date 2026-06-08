--תוכנית2-חוב לקוחות
DO $$
DECLARE
    v_customer_id INT := 20;      -- מס' לקוח לבדיקה
    v_debt_before NUMERIC;
    v_debt_after NUMERIC;
BEGIN
    RAISE NOTICE '--- תוכנית ראשית 2: ניהול תשלום חובות לקוח ---';

    -- 1. זימון הפונקציה לבדיקת חוב נוכחי
    v_debt_before := fn_get_customer_debt(v_customer_id);
    RAISE NOTICE 'חוב לקוח לפני תשלום: % ₪', v_debt_before;

    -- 2. זימון הפרוצדורה לביצוע תשלום (משתמשת ב-Cursor)
    CALL pr_pay_customer_debt(v_customer_id);
    
    -- 3. זימון הפונקציה שוב לבדיקה שהחוב התאפס
    v_debt_after := fn_get_customer_debt(v_customer_id);
    RAISE NOTICE 'חוב לקוח לאחר תשלום: % ₪', v_debt_after;
    
    RAISE NOTICE 'התוכנית הראשית הסתיימה בהצלחה.';
END $$;


--
SELECT
    r.customerid,
    COUNT(*) AS unpaid_registrations,
    SUM(r.amounttopay) AS total_debt
FROM registration r
WHERE r.customerid = 20
  AND r.registrationstatusid = 1
GROUP BY r.customerid;








