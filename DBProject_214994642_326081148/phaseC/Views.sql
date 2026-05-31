--Views
--V1
CREATE VIEW customer_financial_summary AS
SELECT 
    c.customerid, 
    c.fullname, 
    COUNT(r.registrationid) AS total_registrations,
    SUM(p.amount) AS total_paid
FROM customer c
LEFT JOIN registration r ON c.customerid = r.customerid
LEFT JOIN payment p ON r.registrationid = p.registrationid
GROUP BY c.customerid, c.fullname;

--V2
CREATE VIEW guide_performance_view AS
SELECT 
    g.guideid, 
    g.firstname, 
    g.lastname, 
    r.r_name AS route_name,
    COUNT(gt.tourid) AS tours_led
FROM guide g
JOIN guidedtour gt ON g.guideid = gt.guideid
JOIN route r ON gt.routeid = r.routeid
GROUP BY g.guideid, g.firstname, g.lastname, r.r_name;

--Q_V1
--q1
SELECT fullname, total_paid
FROM customer_financial_summary
WHERE total_paid > 500
ORDER BY total_paid DESC;
--q2
SELECT fullname, total_registrations, total_paid
FROM customer_financial_summary
WHERE total_registrations > 3 AND (total_paid < 100 OR total_paid IS NULL)
ORDER BY total_registrations DESC;


--Q_V2
--q1
SELECT firstname, lastname, tours_led
FROM guide_performance_view
WHERE route_name LIKE '%Jerusalem%'
ORDER BY tours_led DESC;
--q2
SELECT firstname, lastname, SUM(tours_led) AS grand_total_tours
FROM guide_performance_view
GROUP BY firstname, lastname
HAVING SUM(tours_led) > 2
ORDER BY grand_total_tours DESC;