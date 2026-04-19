SELECT 
    c.c_name,
    c.c_email,
    COUNT(b.b_ID) AS total_bookings,
    SUM(b.) AS total_people
FROM CUSTOMER c LEFT JOIN BOOKINGS b ON c.c_ID = b.c_ID
GROUP BY c.c_name, c.c_email
ORDER BY total_people DESC;


