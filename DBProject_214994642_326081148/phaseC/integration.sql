-- הוספת עמודה רמת קושי מסלול 
ALTER TABLE route ADD COLUMN level INTEGER;

UPDATE route
SET level = floor(random() * 5 + 1)::int;


ALTER TABLE route DROP COLUMN IF EXISTS difficultyid;
DROP TABLE IF EXISTS difficultylevel;

-- טיפול בסטטוס סיור 

UPDATE guidedtour
SET tourstatusid = floor(random() * 4 + 1)::int;

DELETE FROM tourstatus
WHERE tourstatusid > 4;

-- טיפול בסטטוס הזמנה 
UPDATE payment 
SET paymentstatusid = floor(random() * 5 + 1)::int;

DELETE FROM paymentstatus
WHERE paymentstatusid > 5;

-- טיפול בסטטורס 
UPDATE registration 
SET registrationstatusid = floor(random() * 5 + 1)::int;

DELETE FROM registrationstatus
WHERE registrationstatusid > 5;

-- הוספת סוג ונגישות למסלול 
ALTER TABLE guidedtour ADD COLUMN accessibility INTEGER;
ALTER TABLE guidedtour ADD COLUMN t_type VARCHAR(30);


-- העברת כל 500 נתוני הלקוח
INSERT INTO public.customer (customerid, fullname, phone, email, joindate)
SELECT 
    c_id + 500,                         -- יצירת ID חדש: הנוכחי + 500
    c_first_name || ' ' || c_last_name, -- שרשור שם פרטי ושם משפחה ל-fullname
    c_phone, 
    c_email, 
    CURRENT_DATE                        -- הגדרת תאריך הצטרפות כנוכחי
FROM public.customer1;

--הוספת עמודה 
ALTER TABLE public.guide
ADD COLUMN school CHARACTER VARYING(100);


--העברת כל 500 נתוני המדריך
INSERT INTO public.guide (
    guideid, 
    firstname, 
    lastname, 
    phone, 
    email, 
    birthdate, 
    joindate,        -- כאן היה התיקון!
    dailyrate, 
    experienceyears, 
    rating, 
    address, 
    notes
)
SELECT
    g_id + 500,
    g_first_name,
    g_last_name,
    g_phone,
    g_email,
    '1990-01-01',    -- birthdate
    CURRENT_DATE,    -- joindate
    0.00,            -- dailyrate
    0,               -- experienceyears
    0.0,             -- rating
    'Not provided',  -- address
    'Imported data'  -- notes
FROM public.guide1;


--שאילתת הזמנות לא הרצנו אפשר רק אחרי טיפול בסיורים.

INSERT INTO public.registration (
    registrationid, 
    registrationstatusid, 
    customerid, 
    registrationdate, 
    tourid, 
    amounttopay, 
    notes
)
SELECT 
    20000 + b.b_id, 
    CASE WHEN b.b_status = TRUE THEN 2 ELSE 1 END,
    b.c_id,
    b.b_date,
    gt.tourid, -- אנחנו משתמשים ב-ID מהטבלה החדשה בוודאות!
    0, 
    'none'
FROM public.bookings b
-- כאן קורה הקסם: ה-JOIN מבטיח שרק הזמנות עם סיור קיים יעברו
JOIN public.guidedtour gt ON (b.t_i_id + 500) = gt.tourid;





--טיפול בסיורים 
--הוספת איזור מסלול
ALTER TABLE route ADD COLUMN area CHARACTER VARYING(100);

--שינוי שמות 2 העמודות מטבלת ROUT
ALTER TABLE public.route RENAME COLUMN name TO r_name;
ALTER TABLE public.route RENAME COLUMN level TO r_level;

--הכנסת נתונים מTOUR ל ROUT
INSERT INTO public.route (
	routeid, 
	r_name, 
	estimatedlength, 
	estimatedduration, 
	description, 
	r_level, 
	area)
SELECT 
    ROW_NUMBER() OVER () + 500 AS routeid,
     t_name, 
     round((random() * 40 + 10)::numeric, 2), 
	 60,     
    'Imported from legacy tour system',
     t_level, 
     area
FROM public.tour;

--הכנסת נתונים מtourinstance ל guidedtour
--עשינו JOIN כדי לייבא נתונים כמו מס משתתפים מסיור למופע סיור

INSERT INTO public.guidedtour (
    tourid, startdate, enddate, starttime, endtime, 
    meetingpoint, price, maxparticipants, notes, 
    tourstatusid, guideid, routeid, accessibility, t_type
)
SELECT 
    ROW_NUMBER() OVER () + 500 AS tourid, -- מתחיל מ-501
    ti.t_date, -- startdate
    ti.t_date, -- enddate (נניח שזה מסתיים באותו יום)
    ti.start_time,
    ti.end_time,
    'TBD', -- meetingpoint (ברירת מחדל)
    t.price,
    t.max_participants,
    'Imported', -- notes
    1, -- tourstatusid
    ti.g_id,
    r.routeid, -- החיבור למסלול שיצרנו קודם
    0, -- accessibility
    'Unassigned' -- t_type
FROM public.tourinstance ti
JOIN public.tour t ON ti.t_name = t.t_name
JOIN public.route r ON ti.t_name = r.r_name;



--טיפלנו בהוספת סיורים ומופעיהם

--לפני הכל הסרת אילוץ מגביל
ALTER TABLE public.tourstation
DROP CONSTRAINT tourstation_t_name_fkey;

--בסוף לזכור לחזור ולהריץ אילוץ מתוקן זה:
ALTER TABLE public.tourstation
ADD CONSTRAINT tourstation_route_fkey 
FOREIGN KEY (t_name) REFERENCES public.route(r_name);

--טיפול בשיוך תחנות לסיורים שאין להם תחנות עדיין
INSERT INTO public.tourstation (t_name, s_name, t_index, s_during)
SELECT 
    empty_tours.r_name, 
    s.s_name, 
    99,   -- אינדקס זמני
    15    -- זמן שהות
FROM (
    -- שלב 1: מציאת כל הסיורים שאין להם אף תחנה בטבלת ה-tourstation
    SELECT r.r_name
    FROM public.route r
    WHERE NOT EXISTS (
        SELECT 1 
        FROM public.tourstation ts 
        WHERE ts.t_name = r.r_name
    )
) AS empty_tours
CROSS JOIN LATERAL (
    -- שלב 2: הגרלת 3 תחנות רנדומליות לכל סיור כזה
    SELECT s_name 
    FROM public.station 
    ORDER BY RANDOM() 
    LIMIT 3
) s;


--כאן טיפלנו בהזמנות
--עכשיו נעדכן מחירים בהזמנה בהתאם לסיור
UPDATE public.registration r
SET amounttopay = gt.price
FROM public.guidedtour gt
WHERE r.tourid = gt.tourid;


--טיפול בpayment
INSERT INTO public.payment (
    paymentid,
    registrationid, 
    amount, 
    paymentdate, 
    paymentstatusid, 
    paymentmethod, 
    referencenumber, 
    notes
)
SELECT 
    (SELECT COALESCE(MAX(paymentid), 0) FROM public.payment) + ROW_NUMBER() OVER (),
    registrationid, 
    amounttopay, 
    registrationdate, 
    3,                  -- סטטוס "שולם"
    'Credit Card',      -- שיטת תשלום
    'REF-' || registrationid, 
    'Imported Payment'
FROM public.registration
WHERE registrationid > 20000;


--נוסיף סתם בדיקת שפיות לראות שהנתונים יתווספו בדיקה נוספת
SELECT 
    (SELECT COUNT(*) FROM public.route) AS total_routes,
    (SELECT COUNT(*) FROM public.guidedtour) AS total_tours,
    (SELECT COUNT(*) FROM public.registration) AS total_registrations,
    (SELECT COUNT(*) FROM public.payment) AS total_payments;


--מחיקת טבלאות מהDB1 שלנו שכבר לא צריך
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.customer1 CASCADE;
DROP TABLE IF EXISTS public.guide1 CASCADE;
DROP TABLE IF EXISTS public.tour CASCADE;
DROP TABLE IF EXISTS public.tourinstance CASCADE;