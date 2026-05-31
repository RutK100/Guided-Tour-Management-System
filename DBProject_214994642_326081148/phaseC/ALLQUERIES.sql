--GUIED SYSTEM

-- 1. כל פרטי הלקוח שהזמין בחודש מרץ סהכ יותר 5אלף שח
SELECT 
    CONCAT(g.firstname, ' ', g.lastname) AS guidename,
    g.email,
    EXTRACT(MONTH FROM p.paymentdate) AS paymentmonth,
    SUM(p.amount) AS totalearned
FROM guide g
JOIN guidedtour gt ON g.guideid = gt.guideid
JOIN registration r ON gt.tourid = r.tourid
JOIN payment p ON r.registrationid = p.registrationid
WHERE EXTRACT(YEAR FROM p.paymentdate) = 2026
  AND EXTRACT(MONTH FROM p.paymentdate) = 3
GROUP BY g.guideid, g.firstname, g.lastname, g.email, EXTRACT(MONTH FROM p.paymentdate)
HAVING SUM(p.amount) > 5000
ORDER BY totalearned DESC;

-- 2. לכל חודש ב2026 כמה תשלומים בו וכמה כסף נכנס
SELECT 
    EXTRACT(YEAR FROM paymentdate) AS year,
    EXTRACT(MONTH FROM paymentdate) AS month, 
    SUM(amount) AS monthlyincome,
    COUNT(paymentid) AS transactioncount
FROM payment
WHERE EXTRACT(YEAR FROM paymentdate) = 2026
GROUP BY EXTRACT(YEAR FROM paymentdate), EXTRACT(MONTH FROM paymentdate)
ORDER BY month;

-- 3. רשימת לקוחות שיש להם הזמנה בירושלים שממתינה
SELECT DISTINCT c.fullname, c.phone, r.registrationid, rt.r_name AS routename
FROM customer c
JOIN registration r ON c.customerid = r.customerid
JOIN guidedtour gt ON r.tourid = gt.tourid
JOIN route rt ON gt.routeid = rt.routeid
WHERE rt.description LIKE '%Jerusalem%' 
  AND r.registrationstatusid = (SELECT registrationstatusid FROM registrationstatus WHERE statusname = 'Pending');

-- 4. שמות המדריכים (ומספר הטיולים שלהם) שהרייטינג גבוה מהממוצע והדריכו לפחות ב3 טיולים
SELECT g.firstname, g.lastname, g.rating, COUNT(gt.tourid) AS tourcount
FROM guide g
JOIN guidedtour gt ON g.guideid = gt.guideid
GROUP BY g.guideid, g.firstname, g.lastname, g.rating
HAVING COUNT(gt.tourid) > 3 
   AND g.rating > (SELECT AVG(rating) FROM guide);

-- 5. שמות ופרטי הסיורים לשבוע הקרוב וגם כמה מקומות זמינים בהם
SELECT 
    gt.tourid, 
    rt.r_name AS routename, 
    gt.startdate AS starting,
    gt.maxparticipants,
    (gt.maxparticipants - (SELECT COUNT(*) FROM registration r WHERE r.tourid = gt.tourid)) AS availableslots
FROM guidedtour gt
JOIN route rt ON gt.routeid = rt.routeid
WHERE gt.startdate BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY gt.startdate;

-- 6. שם מייל כמה שילם ומה התשלום הכי יקר של לקוחות בשנה האחרונה ורק לקוח ששילם יותר מאלפיים
SELECT 
    c.fullname, 
    c.email, 
    SUM(p.amount) AS totalspent,
    MAX(p.paymentdate) AS lastpayment
FROM customer c
JOIN registration r ON c.customerid = r.customerid
JOIN payment p ON r.registrationid = p.registrationid
WHERE p.paymentdate >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY c.customerid, c.fullname, c.email
HAVING SUM(p.amount) > 2000;

-- 7.  סיור שיש לו לפחות 2מופעים (ימויין בסדר יורד לפי כמות אנשים) ומחזיר שם, כמות מקס' של משתתפים
--וכמה מופעי סיור ישלו
SELECT 
    r.r_name, 
    SUM(gt.maxparticipants) AS totalcapacity,
    COUNT(gt.tourid) AS occurrences
FROM route r
JOIN guidedtour gt ON r.routeid = gt.routeid
GROUP BY r.routeid, r.r_name
HAVING COUNT(gt.tourid) >= 2
ORDER BY totalcapacity DESC;

-- 8. מחזיר שמות מדיריכם שנות ניסיון מסלול והערה שכתובה עליהם באותו מסלול רק עבור מדריכים עם וותק של פחות משנתיים
SELECT 
    CONCAT(g.firstname, ' ', g.lastname) AS guidename,
    g.experienceyears,
    rt.r_name AS routename,
    r.notes AS feedback
FROM registration r
JOIN guidedtour gt ON r.tourid = gt.tourid
JOIN guide g ON gt.guideid = g.guideid
JOIN route rt ON gt.routeid = rt.routeid
WHERE g.experienceyears < 2 AND r.notes IS NOT NULL;

------------------- Delete Section ----------------------------------------

-- 1. Cleanup: Remove customers with no activity in 3 years
DELETE FROM customer
WHERE customerid NOT IN (
    SELECT DISTINCT customerid FROM registration 
    WHERE registrationdate > CURRENT_DATE - INTERVAL '3 years'
);

-- 2. Data Retention: Delete payments older than 5 years
DELETE FROM payment
WHERE paymentdate < CURRENT_DATE - INTERVAL '5 years';

-- 3. Optimization: Delete routes that have never been assigned to a tour
DELETE FROM route
WHERE routeid NOT IN (SELECT DISTINCT routeid FROM guidedtour);

------------------- Updates Section ---------------------------------------

-- 1. Incentive: 10% raise for highly rated, experienced guides
UPDATE guide
SET dailyrate = dailyrate * 1.10
WHERE rating > 4.8 AND experienceyears > 5;

-- 2. Maintenance: Auto-complete past tours
UPDATE guidedtour
SET tourstatusid = (SELECT tourstatusid FROM tourstatus WHERE statusname = 'Completed')
WHERE enddate < CURRENT_DATE 
  AND tourstatusid != (SELECT tourstatusid FROM tourstatus WHERE statusname = 'Completed');

-- 3. Data Standardization: Israeli Phone Format
UPDATE customer
SET phone = CONCAT('+972', SUBSTRING(phone, 2))
WHERE phone LIKE '0%';


--TOUR SYSTEM

--- שאילתות מערכת משולבת 

-- 1 -- 
-- מחזיר את השם של המדריך ואת מספר סיורי ההליכה שהוא העביר
-- רק עבור מדריכים שהרדיכו יותר מ5 סיורי הליכה
SELECT g.firstname, g.lastname, COUNT(gt.tourid) AS hiking_tours_count
FROM guide g
JOIN guidedtour gt ON g.guideid = gt.guideid
JOIN route r ON gt.routeid = r.routeid
WHERE gt.t_type = 'hiking'
GROUP BY g.guideid, g.firstname, g.lastname
HAVING COUNT(gt.tourid) > 5
ORDER BY hiking_tours_count DESC;

-- 2 --
-- מחזיר את השם פרטי ושם משפחה של המדריך ומספר הטלפון שלו
-- רק עבור מדריכים שהעבירו סיורים נגישים
SELECT DISTINCT g.firstname, g.lastname, g.phone
FROM guide g
JOIN guidedtour gt ON g.guideid = gt.guideid
JOIN route r ON gt.routeid = r.routeid
WHERE gt.accessibility = 1 
ORDER BY g.lastname ASC;


-- 3 --
-- מחזיר את השם של הסיור ואת משך הסיור
-- רק עבור סיורים שהמשך שלהם הוא 2 שעות לפחות
SELECT r.r_name AS tour_name,
       EXTRACT(YEAR FROM gt.startdate) AS tour_year,
       EXTRACT(MONTH FROM gt.startdate) AS tour_month,
       EXTRACT(DAY FROM gt.startdate) AS tour_day,
       r.estimatedduration
FROM route r
JOIN guidedtour gt ON r.routeid = gt.routeid
WHERE r.estimatedduration >= 2
ORDER BY tour_year, tour_month, tour_day;

-- 4 --
--וגם את שם המדריך מחזיר את השם של הסיור ואת שעת ההתחלה והסיום שלו 
--רק עבור סיורים שמתחילים אחרי 12:00 
SELECT r.r_name, gt.starttime, gt.endtime, g.firstname, g.lastname
FROM guidedtour gt 
JOIN guide g ON g.guideid = gt.guideid
JOIN route r ON gt.routeid = r.routeid
WHERE gt.starttime >= '12:00:00'
ORDER BY gt.starttime ASC;

-- 5 --
-- מחזיר את השם פרטי ושם משפחה של המדריך ואת מספר הסיורים המקצועיים שהוא העביר
-- רק עבור מדריכים שהעבירו יותר מ2 סיורים מקצועיים
SELECT g.firstname, g.lastname, COUNT(gt.tourid) AS professional_tours
FROM guide g
JOIN guidedtour gt ON g.guideid = gt.guideid
JOIN route r ON gt.routeid = r.routeid
WHERE r.r_level = 5 AND gt.price > 100
GROUP BY g.guideid, g.firstname, g.lastname
HAVING COUNT(gt.tourid) >= 2;

-- 6 --
-- מחזיר את השם פרטי ושם משפחה של הלקוח ואת מספר הטלפון שלו
-- רק עבור לקוחות שהזמינו 25 סיורים לא משולמים
SELECT c.customerid, c.fullname
FROM customer c
JOIN registration reg ON c.customerid = reg.customerid
WHERE reg.registrationstatusid = 1 -- נניח ש-1 זה הסטטוס ל-"לא משולם"
GROUP BY c.customerid, c.fullname
HAVING COUNT(reg.registrationid) > 25
ORDER BY c.fullname;

-- 7 --
-- מחזיר את המדריכים בסיורים בחודשי הקיץ 
SELECT EXTRACT(MONTH FROM gt.startdate) AS tour_month, 
       COUNT(*) AS total_instances,
       g.firstname AS guide_name, 
       g.phone AS guide_phone
FROM guidedtour gt
JOIN guide g ON gt.guideid = g.guideid
WHERE EXTRACT(MONTH FROM gt.startdate) IN (6, 7)
  AND EXTRACT(YEAR FROM gt.startdate) = 2026
GROUP BY EXTRACT(MONTH FROM gt.startdate), g.firstname, g.phone;

-- 8 --
-- מחזיר את שם המדריך ואת סכום המחירים של כל הסיורים שהוא העביר
-- רק עבור מדריכים שהניבו הכנסה מצטברת של מעל 500 ש"ח
SELECT g.firstname, g.lastname, SUM(gt.price) AS total_revenue
FROM guide g
JOIN guidedtour gt ON g.guideid = gt.guideid
GROUP BY g.guideid, g.firstname, g.lastname
HAVING SUM(gt.price) > 500
ORDER BY total_revenue DESC;






