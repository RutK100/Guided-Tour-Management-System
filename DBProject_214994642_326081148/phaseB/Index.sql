--1
CREATE INDEX idx_tour_date ON TOURINSTANCE(t_date); 
--SELECT ti.t_i_ID, ti.t_name, ti.t_date, ti.start_time
--FROM TOURINSTANCE ti
--WHERE ti.t_date BETWEEN '2026-05-01' AND '2026-05-31'
--ORDER BY ti.t_date ASC;

--2
CREATE INDEX idx_bookings_status_customer ON BOOKINGS(b_status, c_ID); --Composite Index
--SELECT b_ID, c_ID, b_status, total_price
--FROM BOOKINGS
--WHERE b_status = 'TRUE'
--AND c_ID = 10

--3
CREATE INDEX idx_tour_level_price ON TOUR(t_level ASC, price DESC); --Composite Index
--SELECT t_name, t_level, price, area, t_type
--FROM TOUR
--WHERE t_level = 3            
--ORDER BY t_level ASC, price DESC; 

