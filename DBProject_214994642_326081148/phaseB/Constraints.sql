--הוספת עמודה לטבלה לפי הצורך

ALTER TABLE BOOKINGS
ADD total_price DECIMAL(10, 2);

ALTER TABLE TOUR
ADD t_duration INT;

--אילוצים
ALTER TABLE BOOKINGS
ADD CONSTRAINT chk_people_positive 
CHECK (amount_pepole >= 0);

ALTER TABLE TOURINSTANCE
ADD CONSTRAINT chk_tour_times 
CHECK (end_time > start_time);

ALTER TABLE GUIDE
ADD CONSTRAINT uni_guide_phone 
UNIQUE (g_phone);

ALTER TABLE TOUR
ADD CONSTRAINT chk_tour_price 
CHECK (price > 0);

ALTER TABLE TOUR
ADD CONSTRAINT chk_tour_max_participants 
CHECK (max_participants > 0);

ALTER TABLE TOUR
ADD CONSTRAINT chk_tour_level 
CHECK (t_level >= 1 AND t_level <= 5);


