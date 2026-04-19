-- 1. תחילת טרנזקציה
BEGIN;

-- 2. עדכון לא טריוויאלי: שימוש ב-JOIN בין טבלאות לצורך חישוב
UPDATE BOOKINGS b
SET total_price = b.amount_pepole * ti.price_per_person
FROM TOURINSTANCE ti
WHERE b.t_i_ID = ti.t_i_ID;

-- 3. בדיקה שהנתונים התעדכנו (לצילום מסך לדו"ח)
SELECT b_ID, amount_pepole, total_price FROM BOOKINGS LIMIT 5;

-- 4. ביטול השינוי (לצורך ההדגמה בסעיף 8)
ROLLBACK;

-- 5. בדיקה שהנתונים חזרו להיות NULL (לצילום מסך לדו"ח)
SELECT b_ID, total_price FROM BOOKINGS LIMIT 5;