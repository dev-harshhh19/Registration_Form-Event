const express = require('express');
const { body, validationResult } = require('express-validator');
const { dbOperations, Registration } = require('../database/database'); // Import Registration model
const { sendWelcomeEmail } = require('../services/emailService');
const axios = require('axios');

const router = express.Router();

// Validation rules
const registrationValidation = [
    body('fullName')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Full name must be between 3 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name should only contain letters and spaces'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
        .custom(async (email) => {
            const existing = await dbOperations.getRegistrationByEmail(email);
            if (existing) {
                throw new Error('Email already registered');
            }
            return true;
        }),
    
    body('phone')
        .matches(/^\d{10}$/)
        .withMessage('Phone number must be exactly 10 digits'),
    
    body('branch')
        .isIn(['IT', 'Computer Science', 'Cybersecurity', 'Data Science', 'Other'])
        .withMessage('Please select a valid branch'),
    
    body('yearOfStudy')
        .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year'])
        .withMessage('Please select a valid year of study'),
    
    body('workshopAttendance')
        .isIn(['Yes', 'No'])
        .withMessage('Please select workshop attendance'),
    
    body('githubUsername')
        .optional()
        .trim()
        .isLength({ min: 1, max: 39 })
        .withMessage('GitHub username must be between 1 and 39 characters')
        .matches(/^[a-zA-Z0-9-]+$/)
        .withMessage('GitHub username can only contain letters, numbers, and hyphens'),
    
    body('consent')
        .isBoolean()
        .withMessage('Consent must be a boolean value')
        .custom((value) => {
            if (!value) {
                throw new Error('You must agree to receive emails');
            }
            return true;
        }),
    body('recaptchaToken')
        .notEmpty()
        .withMessage('reCAPTCHA token is required')
];

// Register new participant
router.post('/', registrationValidation, async (req, res) => {
    try {
        // Check registration control from database
        const registrationControl = await dbOperations.getRegistrationControl();
        if (registrationControl && !registrationControl.enabled) {
            return res.status(503).json({
                success: false,
                message: registrationControl.maintenance_message || 'Registration is temporarily closed.',
                contactInfo: {
                    whatsapp: process.env.WHATSAPP_NUMBER || '919156633236',
                    whatsappLink: `https://wa.me/${process.env.WHATSAPP_NUMBER || '919156633236'}`,
                    message: 'For urgent registrations or assistance, please contact us on WhatsApp.'
                }
            });
        }

        // Check seminar capacity
        const seminarSettings = await dbOperations.getSeminarSettings();
        const statistics = await dbOperations.getStatistics();
        
        if (seminarSettings && statistics.totalRegistrations >= seminarSettings.max_participants) {
            return res.status(409).json({
                success: false,
                message: 'Registration is full. Maximum capacity reached.',
                data: {
                    maxParticipants: seminarSettings.max_participants,
                    currentRegistrations: statistics.totalRegistrations
                },
                contactInfo: {
                    whatsapp: seminarSettings.whatsapp_number || process.env.WHATSAPP_NUMBER || '919156633236',
                    whatsappLink: `https://wa.me/${seminarSettings.whatsapp_number || process.env.WHATSAPP_NUMBER || '919156633236'}`,
                    message: 'Contact us on WhatsApp to join the waiting list.'
                }
            });
        }

        // Check for validation errors
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

        const { recaptchaToken, ...formData } = req.body;

        // Verify reCAPTCHA token
        if (!recaptchaToken) {
            return res.status(400).json({ success: false, message: 'reCAPTCHA token is missing.' });
        }

        try {
            const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
            const recaptchaResponse = await axios.post(recaptchaVerifyUrl);
            const { success, score } = recaptchaResponse.data;

            if (!success || score < 0.5) { // Adjust score threshold as needed (0.0 to 1.0)
                console.warn('reCAPTCHA verification failed:', recaptchaResponse.data);
                return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed. Please try again.' });
            }
        } catch (recaptchaError) {
            console.error('reCAPTCHA verification error:', recaptchaError);
            return res.status(500).json({ success: false, message: 'Internal server error during reCAPTCHA verification.' });
        }

        // Extract data from request
        const {
            fullName,
            email,
            phone,
            branch,
            yearOfStudy,
            workshopAttendance,
            githubUsername,
            consent
        } = formData;

        // Check if email already exists
        const existingRegistration = await dbOperations.getRegistrationByEmail(email);
        if (existingRegistration) {
            return res.status(409).json({
                success: false,
                message: 'This email is already registered. Please use a different email address.'
            });
        }

        // Add IP address and user agent
        const registrationData = {
            fullName,
            email,
            phone,
            branch,
            yearOfStudy,
            workshopAttendance,
            githubUsername,
            consent,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };

        // Insert into database
        const result = await dbOperations.insertRegistration(registrationData);

        // Send welcome email if enabled
        let emailSent = false;
        if (process.env.EMAIL_ENABLED === 'true') {
            try {
                await sendWelcomeEmail({
                    email,
                    fullName,
                    branch,
                    yearOfStudy,
                    workshopAttendance
                });
                
                // Mark email as sent
                await dbOperations.markEmailSent(result._id); // Use _id for MongoDB
                emailSent = true;
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Don't fail the registration if email fails
            }
        }

        // Return success response
        res.status(201).json({
            success: true,
            message: emailSent 
                ? 'Registration successful! Please check your email for seminar details.'
                : 'Registration successful! Email services are under process, but your registration has been accepted.',
            data: {
                id: result._id, // Use _id for MongoDB
                fullName: result.fullName,
                email: result.email,
                registrationDate: result.registrationDate,
                emailSent: emailSent
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific database errors (MongoDB duplicate key error)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(409).json({
                success: false,
                message: 'This email is already registered. Please use a different email address.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again later.'
        });
    }
});

// Get registration by email (for checking if already registered)
router.get('/check/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        const registration = await dbOperations.getRegistrationByEmail(email);
        
        res.json({
            success: true,
            exists: !!registration,
            data: registration ? {
                id: registration._id, // Use _id for MongoDB
                fullName: registration.fullName,
                email: registration.email,
                registrationDate: registration.registrationDate
            } : null
        });

    } catch (error) {
        console.error('Check registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check registration status'
        });
    }
});

// Get registration statistics (public endpoint)
router.get('/stats', async (req, res) => {
    try {
        const [basicStats, branchStats, yearStats] = await Promise.all([
            dbOperations.getStatistics(),
            dbOperations.getBranchStats(),
            dbOperations.getYearStats()
        ]);

        res.json({
            success: true,
            data: {
                totalRegistrations: basicStats.totalRegistrations,
                workshopYes: basicStats.workshopYes,
                workshopNo: basicStats.workshopNo,
                todayRegistrations: basicStats.todayRegistrations,
                branchStats,
                yearStats
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// Get seminar settings (public endpoint)
router.get('/seminar-info', async (req, res) => {
    try {
        const settings = await dbOperations.getSeminarSettings();
        
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Seminar settings not found'
            });
        }

        // Return only public information
        res.json({
            success: true,
            data: {
                title: settings.title,
                date: settings.date,
                time: settings.time,
                location: settings.location,
                duration: settings.duration,
                description: settings.description,
                instructor_name: settings.instructor_name,
                max_participants: settings.max_participants,
                registration_deadline: settings.registration_deadline,
                whatsapp_number: settings.whatsapp_number
            }
        });

    } catch (error) {
        console.error('Seminar info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seminar information'
        });
    }
});

module.exports = router; 