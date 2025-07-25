-- Rollback script for security enhancements

-- Drop Tables
DROP TABLE IF EXISTS otp_codes;
DROP TABLE IF EXISTS failed_logins;
DROP TABLE IF EXISTS ip_whitelist;
DROP TABLE IF EXISTS ip_blacklist;
DROP TABLE IF EXISTS security_logs;

-- Remove columns from admin_users
ALTER TABLE admin_users DROP COLUMN force_password_change;
ALTER TABLE admin_users DROP COLUMN twofa_enabled;
ALTER TABLE admin_users DROP COLUMN lockout_until;
ALTER TABLE admin_users DROP COLUMN last_password_change;
ALTER TABLE admin_users DROP COLUMN emergency_code_hash;

-- Drop Indexes
DROP INDEX IF EXISTS idx_admin_users_username_created_at;
