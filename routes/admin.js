const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { dbOperations, AdminUser } = require('../database/database'); // Import AdminUser model
const twoFactorService = require('../services/twoFactorService');
const mongoose = require('mongoose');

const router = express.Router();

// Middleware to verify admin token
const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

// Admin login validation
const loginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Admin login
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Get admin user from database
        const admin = await dbOperations.getAdminByUsername(username);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await dbOperations.record2FAUsage(admin._id, 'login'); // Using record2FAUsage to update last_login

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin._id, // Use _id for MongoDB
                username: admin.username, 
                role: admin.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                admin: {
                    id: admin._id, // Use _id for MongoDB
                    username: admin.username,
                    email: admin.email,
                    role: admin.role
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// Get all registrations (admin only)
router.get('/registrations', authenticateAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', sortBy = 'registrationDate', sortOrder = 'desc' } = req.query; // MongoDB sortOrder is 'desc' or 'asc'
        
        const offset = (page - 1) * limit;
        
        const registrations = await dbOperations.getAllRegistrations(search, parseInt(limit), offset, sortBy, sortOrder);
        const total = await dbOperations.getRegistrationsCount(search);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                registrations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations'
        });
    }
});

// Get registration by ID (admin only)
router.get('/registrations/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const registration = await dbOperations.getRegistrationById(id);
        
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        res.json({
            success: true,
            data: registration
        });

    } catch (error) {
        console.error('Get registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registration'
        });
    }
});

// Update registration (admin only)
router.put('/registrations/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate required fields
        const requiredFields = ['fullName', 'email', 'phone', 'branch', 'yearOfStudy', 'workshopAttendance'];
        for (const field of requiredFields) {
            if (!updateData[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        const result = await dbOperations.updateRegistration(id, updateData);
        
        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found or no changes made'
            });
        }

        res.json({
            success: true,
            message: 'Registration updated successfully'
        });

    } catch (error) {
        console.error('Update registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update registration'
        });
    }
});

// Delete registration (admin only)
router.delete('/registrations/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid registration ID format'
            });
        }
        
        const result = await dbOperations.deleteRegistration(id);
        
        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        
        res.json({
            success: true,
            message: 'Registration deleted successfully'
        });

    } catch (error) {
        console.error('Delete registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete registration'
        });
    }
});

// Get detailed statistics (admin only)
router.get('/statistics', authenticateAdmin, async (req, res) => {
    try {
        const [basicStats, branchStats, yearStats] = await Promise.all([
            dbOperations.getStatistics(),
            dbOperations.getBranchStats(),
            dbOperations.getYearStats()
        ]);

        // Get recent registrations (last 7 days)
        const recentStats = await dbOperations.getRecentRegistrations();

        res.json({
            success: true,
            data: {
                basic: basicStats,
                branch: branchStats,
                year: yearStats,
                recent: recentStats,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// Export registrations to CSV (admin only)
router.get('/export/csv', authenticateAdmin, async (req, res) => {
    try {
        const registrations = await dbOperations.getAllRegistrations();
        
        // Create CSV content
        const csvHeaders = [
            'ID', 'Full Name', 'Email', 'Phone', 'Branch', 'Year of Study',
            'Workshop Attendance', 'GitHub Username', 'Registration Date',
            'Email Sent', 'IP Address'
        ].join(',');

        const csvRows = registrations.map(reg => [
            reg._id, // Use _id for MongoDB
            `"${reg.fullName}"`,
            reg.email,
            reg.phone,
            reg.branch,
            reg.yearOfStudy,
            reg.workshopAttendance,
            reg.githubUsername || '',
            reg.registrationDate,
            reg.emailSent ? 'Yes' : 'No',
            reg.ipAddress || ''
        ].join(','));

        const csvContent = [csvHeaders, ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="registrations-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export registrations'
        });
    }
});

// Admin profile (admin only)
router.get('/profile', authenticateAdmin, async (req, res) => {
    try {
        const admin = await dbOperations.getAdminById(req.admin.id); // Use req.admin.id (from JWT payload)
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                created_at: admin.created_at,
                last_login: admin.last_login
            }
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
});

// Update admin profile (admin only)
router.put('/profile', authenticateAdmin, [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, email } = req.body;

        // Check if username already exists (exclude current user)
        const existingUser = await AdminUser.findOne({ username: username, _id: { $ne: req.admin.id } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }
            
        // Check if email already exists (exclude current user)
        const existingEmail = await AdminUser.findOne({ email: email, _id: { $ne: req.admin.id } });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Update profile
        const result = await dbOperations.updateAdminProfile(req.admin.id, { username, email });
        
        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found or no changes made'
            });
        }

        // Get updated profile
        const updatedAdmin = await dbOperations.getAdminById(req.admin.id);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: updatedAdmin._id,
                username: updatedAdmin.username,
                email: updatedAdmin.email,
                role: updatedAdmin.role,
                created_at: updatedAdmin.created_at,
                last_login: updatedAdmin.last_login
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// Change admin password (admin only)
router.put('/change-password', authenticateAdmin, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Get current admin
        const admin = await dbOperations.getAdminById(req.admin.id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
            
        // Update password
        const result = await dbOperations.updateAdminPassword(req.admin.id, hashedPassword);
        if (result.changes === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update password'
            });
        }

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
});

// Toggle maintenance mode (admin only)
router.put('/maintenance', authenticateAdmin, async (req, res) => {
    try {
        const { enabled, message } = req.body;
        
        // In a real application, you might want to store this in a database
        // For now, we'll just return the action that should be taken
        res.json({
            success: true,
            message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
            action: {
                setEnv: {
                    REGISTRATION_MAINTENANCE: enabled ? 'true' : 'false',
                    MAINTENANCE_MESSAGE: message || 'Registration is temporarily closed due to maintenance activities.'
                }
            }
        });
    } catch (error) {
        console.error('Maintenance toggle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle maintenance mode'
        });
    }
});

// ====== SEMINAR SETTINGS MANAGEMENT ======

// Get current seminar settings (admin only)
router.get('/seminar-settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = await dbOperations.getSeminarSettings();
        const statistics = await dbOperations.getStatistics();
        
        res.json({
            success: true,
            data: {
                ...settings.toObject(), // Convert Mongoose document to plain object
                currentRegistrations: statistics.totalRegistrations,
                availableSlots: settings.max_participants - statistics.totalRegistrations,
                isRegistrationFull: statistics.totalRegistrations >= settings.max_participants
            }
        });
    } catch (error) {
        console.error('Get seminar settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seminar settings'
        });
    }
});

// Update seminar settings (admin only)
router.put('/seminar-settings', authenticateAdmin, [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
    body('time').trim().notEmpty().withMessage('Time is required'),
    body('location').trim().isLength({ min: 5, max: 200 }).withMessage('Location must be between 5 and 200 characters'),
    body('duration').trim().notEmpty().withMessage('Duration is required'),
    body('instructor_name').trim().isLength({ min: 2, max: 100 }).withMessage('Instructor name must be between 2 and 100 characters'),
    body('instructor_email').isEmail().withMessage('Valid instructor email is required'),
    body('max_participants').isInt({ min: 1, max: 1000 }).withMessage('Max participants must be between 1 and 1000')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }

        const {
            title,
            date,
            time,
            location,
            duration,
            description,
            instructor_name,
            instructor_email,
            max_participants,
            registration_deadline,
            whatsapp_number,
            whatsapp_group_link
        } = req.body;

        const settingsData = {
            title,
            date,
            time,
            location,
            duration,
            description: description || null,
            instructor_name,
            instructor_email,
            max_participants: parseInt(max_participants),
            registration_deadline: registration_deadline || null,
            whatsapp_number: whatsapp_number || null,
            whatsapp_group_link: whatsapp_group_link || null
        };

        const result = await dbOperations.updateSeminarSettings(settingsData);
        
        res.json({
            success: true,
            message: 'Seminar settings updated successfully',
            data: result // Mongoose update returns the updated document
        });
    } catch (error) {
        console.error('Update seminar settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update seminar settings'
        });
    }
});

// ====== REGISTRATION CONTROL ======

// Toggle registration (admin only)
router.put('/registration-control', authenticateAdmin, async (req, res) => {
    try {
        const { enabled, message } = req.body;
        
        const result = await dbOperations.updateRegistrationControl({
            enabled: enabled, // Boolean for Mongoose
            maintenance_message: message || 'Registration is temporarily closed.',
            updated_by: req.admin.id
        });
        
        res.json({
            success: true,
            message: `Registration ${enabled ? 'enabled' : 'disabled'} successfully`,
            data: result // Mongoose update returns the updated document
        });
    } catch (error) {
        console.error('Registration control error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update registration control'
        });
    }
});

// Get registration control status (admin only)
router.get('/registration-control', authenticateAdmin, async (req, res) => {
    try {
        const control = await dbOperations.getRegistrationControl();
        
        res.json({
            success: true,
            data: control || {
                enabled: true,
                maintenance_message: 'Registration is temporarily closed.'
            }
        });
    } catch (error) {
        console.error('Get registration control error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registration control status'
        });
    }
});

// ====== EMAIL SERVICE CONTROL ======

// Toggle email service (admin only)
router.put('/email-control', authenticateAdmin, async (req, res) => {
    try {
        const { enabled } = req.body;
        
        const result = await dbOperations.updateEmailControl({
            enabled: enabled, // Boolean for Mongoose
            updated_by: req.admin.id
        });
        
        res.json({
            success: true,
            message: `Email service ${enabled ? 'enabled' : 'disabled'} successfully`,
            data: result // Mongoose update returns the updated document
        });
    } catch (error) {
        console.error('Email control error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update email service control'
        });
    }
});

// Get email service control status (admin only)
router.get('/email-control', authenticateAdmin, async (req, res) => {
    try {
        const control = await dbOperations.getEmailControl();
        
        res.json({
            success: true,
            data: control || {
                enabled: true
            }
        });
    } catch (error) {
        console.error('Get email control error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch email service control status'
        });
    }
});

// Send manual reminder emails (admin only)
router.post('/send-reminders', authenticateAdmin, async (req, res) => {
    try {
        const { type = '24h' } = req.body; // '24h' or '2h'
        
        const { scheduleReminderEmails } = require('../services/emailService');
        await scheduleReminderEmails();
        
        res.json({
            success: true,
            message: `${type} reminder emails sent successfully`
        });
    } catch (error) {
        console.error('Send reminders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send reminder emails'
        });
    }
});

// ====== 2FA ENDPOINTS ======

// Get 2FA status (admin only)
router.get('/2fa/status', authenticateAdmin, async (req, res) => {
    try {
        const is2FAEnabled = await twoFactorService.is2FAEnabled(req.admin.id);
        const settings = await twoFactorService.get2FASettings(req.admin.id);
        
        res.json({
            success: true,
            data: {
                enabled: is2FAEnabled,
                ...settings
            }
        });
    } catch (error) {
        console.error('2FA status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get 2FA status'
        });
    }
});

// Generate 2FA setup (admin only)
router.post('/2fa/setup', authenticateAdmin, async (req, res) => {
    try {
        const admin = await dbOperations.getAdminById(req.admin.id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check if 2FA is already enabled
        if (admin.two_factor_enabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is already enabled. Disable it first to regenerate.'
            });
        }

        const secretData = await twoFactorService.generateSecret(admin.username, admin.email);
        
        // Store temporary secret with expiration
        await dbOperations.storeTempSecret(admin._id, secretData.tempSecret); // Use admin._id
        
        res.json({
            success: true,
            message: 'Scan the QR code with your authenticator app and verify with a token',
            data: {
                qrCode: secretData.qrCode,
                manualEntryKey: secretData.manualEntryKey,
                backupCodes: secretData.backupCodes
            }
        });
    } catch (error) {
        console.error('2FA setup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to setup 2FA'
        });
    }
});

// Verify and enable 2FA (admin only)
router.post('/2fa/verify-setup', authenticateAdmin, [
    body('token').isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { token } = req.body;
        
        // Get temporary secret
        const tempSecretData = await dbOperations.getTempSecret(req.admin.id);
        if (!tempSecretData) {
            return res.status(400).json({
                success: false,
                message: 'Setup session expired. Please start setup again.'
            });
        }

        // Verify token
        const isValid = twoFactorService.validateSetupToken(token, tempSecretData.temp_secret);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token. Please try again.'
            });
        }

        // Generate backup codes
        const backupCodes = twoFactorService.generateBackupCodes();
        
        // Enable 2FA
        await dbOperations.enable2FA(req.admin.id, tempSecretData.temp_secret, backupCodes);
        
        res.json({
            success: true,
            message: '2FA enabled successfully. Save your backup codes in a safe place.',
            data: {
                backupCodes
            }
        });
    } catch (error) {
        console.error('2FA verify setup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify 2FA setup'
        });
    }
});

// Disable 2FA (admin only)
router.post('/2fa/disable', authenticateAdmin, [
    body('password').notEmpty().withMessage('Password is required to disable 2FA')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { password } = req.body;
        
        // Verify password
        const admin = await dbOperations.getAdminById(req.admin.id);
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Check if 2FA is enabled
        if (!admin.two_factor_enabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is not enabled'
            });
        }

        // Disable 2FA
        await dbOperations.disable2FA(req.admin.id);
        
        res.json({
            success: true,
            message: '2FA disabled successfully'
        });
    } catch (error) {
        console.error('2FA disable error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disable 2FA'
        });
    }
});

// Regenerate backup codes (admin only)
router.post('/2fa/regenerate-backup-codes', authenticateAdmin, [
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { password } = req.body;
        
        // Verify password
        const admin = await dbOperations.getAdminById(req.admin.id);
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Check if 2FA is enabled
        if (!admin.two_factor_enabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is not enabled'
            });
        }

        // Regenerate backup codes
        const newBackupCodes = await twoFactorService.regenerateBackupCodes(req.admin.id);
        
        res.json({
            success: true,
            message: 'Backup codes regenerated successfully. Save them in a safe place.',
            data: {
                backupCodes: newBackupCodes
            }
        });
    } catch (error) {
        console.error('Regenerate backup codes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate backup codes'
        });
    }
});

// 2FA login verification endpoint
router.post('/2fa/verify', [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('token').isLength({ min: 6, max: 8 }).withMessage('Token must be 6-8 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, password, token } = req.body;
        
        // Get admin user
        const admin = await dbOperations.getAdminByUsername(username);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if 2FA is enabled
        if (!admin.two_factor_enabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is not enabled for this account'
            });
        }

        let verified = false;
        let usedBackupCode = false;

        // Try TOTP first
        if (token.length === 6) {
            verified = twoFactorService.verifyToken(token, admin.two_factor_secret);
        }
        
        // If TOTP failed, try backup codes
        if (!verified && token.length === 8 && admin.backup_codes) {
            const backupCodes = JSON.parse(admin.backup_codes);
            const backupResult = twoFactorService.verifyBackupCode(token, backupCodes);
            
            if (backupResult.verified) {
                verified = true;
                usedBackupCode = true;
                
                // Update backup codes (remove used code)
                await dbOperations.updateBackupCodes(admin._id, backupResult.remainingCodes); // Use admin._id
            }
        }

        if (!verified) {
            return res.status(401).json({
                success: false,
                message: 'Invalid 2FA token'
            });
        }

        // Record 2FA usage
        await dbOperations.record2FAUsage(admin._id, usedBackupCode ? 'backup' : 'totp'); // Use admin._id

        // Generate JWT token
        const jwtToken = jwt.sign(
            { 
                id: admin._id, // Use _id for MongoDB
                username: admin.username, 
                role: admin.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: '2FA verification successful',
            data: {
                token: jwtToken,
                admin: {
                    id: admin._id, // Use _id for MongoDB
                    username: admin.username,
                    email: admin.email,
                    role: admin.role
                },
                usedBackupCode,
                remainingBackupCodes: usedBackupCode ? JSON.parse(admin.backup_codes).length - 1 : undefined
            }
        });
    } catch (error) {
        console.error('2FA verify error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify 2FA'
        });
    }
});

module.exports = router; 
