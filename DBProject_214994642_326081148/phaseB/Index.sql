--1
CREATE INDEX idx_tour_date ON TOURINSTANCE(t_date);

--2
CREATE INDEX idx_bookings_status_customer ON BOOKINGS(b_status, c_ID); --Composite Index

--3
CREATE INDEX idx_tour_level_price ON TOUR(t_level ASC, price DESC); --Composite Index

