const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { dbOperations } = require('../database/database');

class TwoFactorService {
    constructor() {
        this.serviceName = process.env.APP_NAME || 'Seminar Registration';
        this.issuer = process.env.TOTP_ISSUER || 'Prompt Your Future';
    }

    /**
     * Generate a new 2FA secret for a user
     * @param {string} username - The username for the account
     * @param {string} email - The email for the QR code label
     * @returns {Object} - Contains secret, backup codes, and QR code URL
     */
    async generateSecret(username, email) {
        try {
            // Generate secret
            const secret = speakeasy.generateSecret({
                name: `${this.serviceName} (${email})`,
                issuer: this.issuer,
                length: 32
            });

            // Generate backup codes
            const backupCodes = this.generateBackupCodes();

            // Generate QR code data URL
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

            return {
                secret: secret.base32,
                tempSecret: secret.base32, // Used for verification before enabling
                qrCode: qrCodeUrl,
                manualEntryKey: secret.base32,
                backupCodes: backupCodes,
                otpauthUrl: secret.otpauth_url
            };
        } catch (error) {
            console.error('Error generating 2FA secret:', error);
            throw new Error('Failed to generate 2FA secret');
        }
    }

    /**
     * Generate backup codes for 2FA recovery
     * @returns {Array} - Array of backup codes
     */
    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            // Generate 8-character alphanumeric codes
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            codes.push(code);
        }
        return codes;
    }

    /**
     * Verify a TOTP token
     * @param {string} token - The 6-digit token from authenticator app
     * @param {string} secret - The user's 2FA secret
     * @param {number} window - Time window for token validation (default: 1)
     * @returns {boolean} - Whether the token is valid
     */
    verifyToken(token, secret, window = 1) {
        try {
            const verified = speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: window // Allow 30 seconds before/after current time
            });

            return verified;
        } catch (error) {
            console.error('Error verifying 2FA token:', error);
            return false;
        }
    }

    /**
     * Verify a backup code
     * @param {string} code - The backup code entered by user
     * @param {Array} backupCodes - Array of valid backup codes
     * @returns {Object} - Verification result and remaining codes
     */
    verifyBackupCode(code, backupCodes) {
        try {
            const codeIndex = backupCodes.findIndex(
                backupCode => backupCode.toUpperCase() === code.toUpperCase()
            );

            if (codeIndex === -1) {
                return { verified: false, remainingCodes: backupCodes };
            }

            // Remove used backup code
            const remainingCodes = backupCodes.filter((_, index) => index !== codeIndex);
            
            return { 
                verified: true, 
                remainingCodes: remainingCodes,
                usedCode: code.toUpperCase()
            };
        } catch (error) {
            console.error('Error verifying backup code:', error);
            return { verified: false, remainingCodes: backupCodes };
        }
    }

    /**
     * Enable 2FA for a user after successful verification
     * @param {number} userId - The user ID
     * @param {string} secret - The 2FA secret
     * @param {Array} backupCodes - The backup codes
     * @returns {Promise<boolean>} - Success status
     */
    async enable2FA(userId, secret, backupCodes) {
        try {
            await dbOperations.enable2FA(userId, secret, backupCodes);
            return true;
        } catch (error) {
            console.error('Error enabling 2FA:', error);
            throw new Error('Failed to enable 2FA');
        }
    }

    /**
     * Disable 2FA for a user
     * @param {number} userId - The user ID
     * @returns {Promise<boolean>} - Success status
     */
    async disable2FA(userId) {
        try {
            await dbOperations.disable2FA(userId);
            return true;
        } catch (error) {
            console.error('Error disabling 2FA:', error);
            throw new Error('Failed to disable 2FA');
        }
    }

    /**
     * Check if user has 2FA enabled
     * @param {number} userId - The user ID
     * @returns {Promise<boolean>} - Whether 2FA is enabled
     */
    async is2FAEnabled(userId) {
        try {
            const user = await dbOperations.getAdminById(userId);
            return user && user.two_factor_enabled === 1;
        } catch (error) {
            console.error('Error checking 2FA status:', error);
            return false;
        }
    }

    /**
     * Get user's 2FA settings
     * @param {number} userId - The user ID
     * @returns {Promise<Object>} - 2FA settings
     */
    async get2FASettings(userId) {
        try {
            const user = await dbOperations.getAdminById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            return {
                enabled: user.two_factor_enabled === 1,
                backupCodesCount: user.backup_codes ? JSON.parse(user.backup_codes).length : 0,
                lastUsed: user.two_factor_last_used
            };
        } catch (error) {
            console.error('Error getting 2FA settings:', error);
            throw new Error('Failed to get 2FA settings');
        }
    }

    /**
     * Regenerate backup codes
     * @param {number} userId - The user ID
     * @returns {Promise<Array>} - New backup codes
     */
    async regenerateBackupCodes(userId) {
        try {
            const newBackupCodes = this.generateBackupCodes();
            await dbOperations.updateBackupCodes(userId, newBackupCodes);
            return newBackupCodes;
        } catch (error) {
            console.error('Error regenerating backup codes:', error);
            throw new Error('Failed to regenerate backup codes');
        }
    }

    /**
     * Record 2FA usage
     * @param {number} userId - The user ID
     * @param {string} method - The method used ('totp' or 'backup')
     * @returns {Promise<void>}
     */
    async record2FAUsage(userId, method = 'totp') {
        try {
            await dbOperations.record2FAUsage(userId, method);
        } catch (error) {
            console.error('Error recording 2FA usage:', error);
            // Don't throw error as this is not critical
        }
    }

    /**
     * Validate 2FA setup token during initial setup
     * @param {string} token - The token to verify
     * @param {string} tempSecret - The temporary secret
     * @returns {boolean} - Whether the token is valid
     */
    validateSetupToken(token, tempSecret) {
        return this.verifyToken(token, tempSecret, 2); // Wider window for setup
    }
}

module.exports = new TwoFactorService();
