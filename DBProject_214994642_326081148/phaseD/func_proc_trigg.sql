--func1
CREATE OR REPLACE FUNCTION fn_get_remaining_spots(p_tourid INT)
RETURNS INTEGER AS $$
DECLARE
    v_max_participants INTEGER;
    v_current_registered INTEGER;
BEGIN
    -- קבלת הקיבולת המקסימלית לסיור
    SELECT maxparticipants
    INTO v_max_participants
    FROM guidedtour
    WHERE tourid = p_tourid;

    -- חישוב סך המשתתפים הפעילים בסיור
    SELECT COALESCE(SUM(numpeople),0)
    INTO v_current_registered
    FROM registration
    WHERE tourid = p_tourid
      AND registrationstatusid <> 3;

    -- החזרת מספר המקומות הפנויים
    RETURN (v_max_participants - v_current_registered);
END;
$$ LANGUAGE plpgsql;

--proc1

CREATE OR REPLACE PROCEDURE pr_register_customer(
    p_customerid INT, 
    p_tourid INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_spots_left INTEGER;
BEGIN
    -- קריאה לפונקציה כדי לבדוק מקום
    v_spots_left := fn_get_remaining_spots(p_tourid);

    -- הסתעפויות (If/Else) - דרישת שלב 4
    IF v_spots_left > 0 THEN
        -- ביצוע ההרשמה (DML) - הוספת רשומה לטבלת registration
        INSERT INTO registration (customerid, tourid, registrationdate, amounttopay)
        VALUES (p_customerid, p_tourid, CURRENT_DATE, 0); 
        
        RAISE NOTICE 'Registration successful for customer %! Spots left: %', p_customerid, v_spots_left - 1;
    ELSE
        -- אם אין מקום, זורקים חריגה מפורשת
        RAISE EXCEPTION 'No spots left for tour ID: %', p_tourid;
    END IF;

EXCEPTION
    -- טיפול בחריגות (Exception)
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to register customer: %', SQLERRM;
END;
$$;

---------------------------------------------------------------------------------------------------
--fun2
--מחזיר עבור לקוח את סכום חובותיו
CREATE OR REPLACE FUNCTION fn_get_customer_debt(p_customerid INT)
RETURNS NUMERIC AS $$
DECLARE
    v_total_debt NUMERIC := 0;
BEGIN
    -- חישוב סכום ההזמנות שהסטטוס שלהן הוא "לא שולם" (נניח שסטטוס 1 זה "לא שולם")
    SELECT SUM(amounttopay) INTO v_total_debt
    FROM registration
    WHERE customerid = p_customerid 
    AND registrationstatusid = 1; -- נניח ש-1 זה הסטטוס ההתחלתי של "טרם שולם"

    RETURN COALESCE(v_total_debt, 0); -- מחזיר 0 אם אין חוב
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END;

$$ LANGUAGE plpgsql;

--proc2

CREATE OR REPLACE PROCEDURE pr_pay_customer_debt(p_customerid INT)
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
    v_new_paymentid INT;

    c_unpaid_registrations CURSOR FOR 
        SELECT registrationid, amounttopay 
        FROM registration 
        WHERE customerid = p_customerid 
          AND registrationstatusid = 1;
BEGIN
    IF fn_get_customer_debt(p_customerid) = 0 THEN
        RAISE NOTICE 'Customer % has no pending debt.', p_customerid;
        RETURN;
    END IF;

    FOR rec IN c_unpaid_registrations LOOP

        UPDATE registration 
        SET registrationstatusid = 2 
        WHERE registrationid = rec.registrationid;

        SELECT COALESCE(MAX(paymentid), 0) + 1
        INTO v_new_paymentid
        FROM payment;

        INSERT INTO payment (
            paymentid,
            paymentdate,
            amount,
            notes,
            paymentmethod,
            referencenumber,
            registrationid,
            paymentstatusid
        )
        VALUES (
            v_new_paymentid,
            CURRENT_DATE,
            rec.amounttopay,
            'Created by pr_pay_customer_debt',
            'Credit Card',
            'AUTO-' || v_new_paymentid,
            rec.registrationid,
            1
        );

        RAISE NOTICE 'Processed payment for registration: %, payment ID: %',
            rec.registrationid, v_new_paymentid;

    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process payments for customer %: %', p_customerid, SQLERRM;
END;
$$;

---------------------------------------------------------------------------------
-- פונקציה עבור הטריגר הראשון 
CREATE OR REPLACE FUNCTION fn_audit_registration_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO registration_audit(registrationid, old_status)
    VALUES (OLD.registrationid, OLD.registrationstatusid);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--triger1
CREATE TRIGGER trg_audit_registration
AFTER UPDATE ON registration
FOR EACH ROW
EXECUTE FUNCTION fn_audit_registration_change();

--בדיקת טריגר ראשון
SELECT * FROM registration_audit 
ORDER BY change_date DESC; --  השינויים הכי אחרונים למעלה

--בדיקות
-- מה הסטטוס הנוכחי של הזמנה #?
SELECT registrationid, registrationstatusid 
FROM registration 
WHERE registrationid = 20002;

--נשנה סטטוס
UPDATE registration 
SET registrationstatusid = 4 
WHERE registrationid = 20002;
-----------------------------------------------------------------------------------------

--פונקציה עבור הטריגר השני
CREATE OR REPLACE FUNCTION fn_cancel_related_registrations()
RETURNS TRIGGER AS $$
BEGIN
    -- בדיקה: האם הסטטוס השתנה ל-3 (מבוטל) והוא לא היה כזה קודם?
    IF NEW.tourstatusid = 3 AND OLD.tourstatusid != 3 THEN
        
        -- עדכון אוטומטי של כל הרישומים לסיור הזה לסטטוס "מבוטל"
        UPDATE registration
        SET registrationstatusid = 3 --3 זה ביטול גם בטבלת הרשומים
        WHERE tourid = NEW.tourid;
        
        RAISE NOTICE 'Automatic cancellation triggered for tour ID: %', NEW.tourid;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


--triger2
CREATE TRIGGER trg_auto_cancel_registrations
AFTER UPDATE ON guidedtour
FOR EACH ROW
EXECUTE FUNCTION fn_cancel_related_registrations();

--שאילתות להרצה להדיקת טריגר 2
select tourid, tourstatusid
FROM guidedtour
WHERE tourid=5

UPDATE guidedtour
SET tourstatusid = 3
WHERE tourid = 5;

select registrationid ,tourid, registrationstatusid
FROM registration
WHERE tourid=5


-------------------------------------------------------------------------------------------


-- func0  - פונק מקדימה (בשבילנו) - מחשבת עלות להזמנה
CREATE OR REPLACE FUNCTION fn_calculate_registration_total(p_registrationid INT)
RETURNS NUMERIC AS $$
DECLARE
    v_total NUMERIC;
BEGIN
    -- חישוב: כמות משתתפים * מחיר הסיור
    SELECT (r.numpeople * t.price) INTO v_total
    FROM registration r
    JOIN guidedtour t ON r.tourid = t.tourid
    WHERE r.registrationid = p_registrationid;

    RETURN COALESCE(v_total, 0);
END;
$$ LANGUAGE plpgsql;

--triger0  --מחשב כשצריך ומעדכן את הסכום טוטאל להזמנה
CREATE OR REPLACE FUNCTION fn_update_registration_price()
RETURNS TRIGGER AS $$
BEGIN
    -- חישוב המחיר החדש לפי כמות האנשים והמחיר של הסיור
    NEW.amounttopay := NEW.numpeople * (SELECT price FROM guidedtour WHERE tourid = NEW.tourid);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_calc_price
BEFORE INSERT OR UPDATE ON registration
FOR EACH ROW
EXECUTE FUNCTION fn_update_registration_price();



