-- 1. Create Table: otp_codes
CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    otp_code TEXT NOT NULL,
    expiry DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- 2. Create Table: failed_logins
CREATE TABLE IF NOT EXISTS failed_logins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    fail_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip TEXT,
    FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- 3. Create Table: ip_whitelist
CREATE TABLE IF NOT EXISTS ip_whitelist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT UNIQUE NOT NULL,
    description TEXT
);

-- 4. Create Table: ip_blacklist
CREATE TABLE IF NOT EXISTS ip_blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT UNIQUE NOT NULL,
    description TEXT
);

-- 5. Create Table: security_logs
CREATE TABLE IF NOT EXISTS security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Alter Table: admin_users
ALTER TABLE admin_users
ADD COLUMN force_password_change BOOLEAN DEFAULT 0,
ADD COLUMN twofa_enabled BOOLEAN DEFAULT 0,
ADD COLUMN lockout_until DATETIME,
ADD COLUMN last_password_change DATETIME,
ADD COLUMN emergency_code_hash TEXT;

-- 7. Add Indexes
CREATE INDEX idx_admin_users_username_created_at ON admin_users(username, created_at);
