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







