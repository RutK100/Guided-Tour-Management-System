CREATE TABLE registration_audit (
    audit_id SERIAL PRIMARY KEY,
    registrationid INT,
    old_status INT,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE registration ALTER COLUMN amounttopay SET DEFAULT 0;
