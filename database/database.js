


const mongoose = require('mongoose');

const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seminar_registration';

const db = mongoose.connection;

db.on('connected', () => {
    console.log('✅ Connected to MongoDB');
});

db.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});


const registrationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    branch: { type: String, required: true },
    yearOfStudy: { type: String, required: true },
    workshopAttendance: { type: String, required: true },
    githubUsername: { type: String },
    consent: { type: Boolean, default: true },
    registrationDate: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, default: 'active' },
    emailSent: { type: Boolean, default: false },
    emailSentDate: { type: Date },
    updatedAt: { type: Date, default: Date.now }
});

const adminUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'admin' },
    created_at: { type: Date, default: Date.now },
    last_login: { type: Date },
    is_active: { type: Boolean, default: true },
    two_factor_enabled: { type: Boolean, default: false },
    two_factor_secret: { type: String },
    backup_codes: { type: String }, // Stored as JSON string
    two_factor_last_used: { type: Date },
    temp_secret: { type: String },
    temp_secret_expires: { type: Date }
});

const seminarSettingsSchema = new mongoose.Schema({
    title: { type: String, required: true, default: 'Prompt Your Future: Learn Prompt Engineering & Build Your First Portfolio' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String },
    instructor_name: { type: String, default: 'Harshad Nikam' },
    instructor_email: { type: String, default: 'nikamharshadshivaji@gmail.com' },
    max_participants: { type: Number, default: 100 },
    registration_deadline: { type: String },
    whatsapp_number: { type: String },
    whatsapp_group_link: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true }
});

const registrationControlSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: true },
    maintenance_message: { type: String, default: 'Registration is temporarily closed.' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const emailControlSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const statisticsSchema = new mongoose.Schema({
    total_registrations: { type: Number, default: 0 },
    branch_stats: { type: String }, // Stored as JSON string
    year_stats: { type: String },   // Stored as JSON string
    workshop_stats: { type: String }, // Stored as JSON string
    daily_registrations: { type: String }, // Stored as JSON string
    last_updated: { type: Date, default: Date.now }
});

// Mongoose Models
const Registration = mongoose.model('Registration', registrationSchema);
const AdminUser = mongoose.model('AdminUser', adminUserSchema);
const SeminarSettings = mongoose.model('SeminarSettings', seminarSettingsSchema);
const RegistrationControl = mongoose.model('RegistrationControl', registrationControlSchema);
const EmailControl = mongoose.model('EmailControl', emailControlSchema);
const Statistics = mongoose.model('Statistics', statisticsSchema);

// Initialize database tables
async function initDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
        });

        // Ensure default admin user and seminar settings exist
        await insertDefaultAdmin();
        await insertDefaultSeminarSettings();
        await insertDefaultRegistrationControl();
        await insertDefaultEmailControl();
        await insertDefaultStatistics();

        console.log('✅ Database initialized successfully (MongoDB)');
    } catch (error) {
        console.error('❌ Failed to initialize database (MongoDB):', error);
        process.exit(1);
    }
}

// Insert default admin user
async function insertDefaultAdmin() {
    const bcrypt = require('bcryptjs');

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (process.env.NODE_ENV === 'production' && !adminPassword) {
        console.error('FATAL ERROR: ADMIN_PASSWORD environment variable is not set.');
        console.error('Application will not start without a secure admin password in production.');
        process.exit(1);
    }

    const defaultPassword = adminPassword || 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    try {
        const existingAdmin = await AdminUser.findOne({ username: adminUsername });
        if (!existingAdmin) {
            await AdminUser.create({
                username: adminUsername,
                password: hashedPassword,
                email: 'admin@seminar.com',
                role: 'admin'
            });
            console.log(`✅ Default admin user created (username: ${adminUsername})`);
        } else {
            console.log(`✅ Default admin user verified (username: ${adminUsername})`);
        }
    } catch (error) {
        console.error('Error inserting default admin:', error.message);
    }
}

// Insert default seminar settings
async function insertDefaultSeminarSettings() {
    try {
        const existingSettings = await SeminarSettings.findOne({});
        if (!existingSettings) {
            await SeminarSettings.create({
                title: 'Prompt Your Future: Learn Prompt Engineering & Build Your First Portfolio',
                date: process.env.SEMINAR_DATE || '2025-07-25',
                time: process.env.SEMINAR_TIME || '10:00 AM',
                location: process.env.SEMINAR_LOCATION || 'Seminar Hall, First Floor, IT building.',
                duration: process.env.SEMINAR_DURATION || '3 hours',
                description: 'Join us for an exciting seminar on Prompt Engineering and build your first AI portfolio. Learn the latest techniques and best practices in AI development.',
                instructor_name: 'Harshad Nikam',
                instructor_email: 'nikamharshadshivaji@gmail.com',
                max_participants: 100,
                whatsapp_number: process.env.WHATSAPP_NUMBER || '+919156633236',
                whatsapp_group_link: process.env.WHATSAPP_GROUP_LINK || 'https://chat.whatsapp.com/+919156633236'
            });
            console.log('✅ Default seminar settings created');
        } else {
            console.log('✅ Default seminar settings verified');
        }
    } catch (error) {
        console.error('Error inserting default seminar settings:', error.message);
    }
}

// Insert default registration control
async function insertDefaultRegistrationControl() {
    try {
        const existingControl = await RegistrationControl.findOne({});
        if (!existingControl) {
            await RegistrationControl.create({
                enabled: true,
                maintenance_message: 'Registration is temporarily closed.'
            });
            console.log('✅ Default registration control created');
        } else {
            console.log('✅ Default registration control verified');
        }
    } catch (error) {
        console.error('Error inserting default registration control:', error.message);
    }
}

// Insert default email control
async function insertDefaultEmailControl() {
    try {
        const existingControl = await EmailControl.findOne({});
        if (!existingControl) {
            await EmailControl.create({
                enabled: true
            });
            console.log('✅ Default email control created');
        } else {
            console.log('✅ Default email control verified');
        }
    } catch (error) {
        console.error('Error inserting default email control:', error.message);
    }
}

// Insert default statistics
async function insertDefaultStatistics() {
    try {
        const existingStats = await Statistics.findOne({});
        if (!existingStats) {
            await Statistics.create({
                total_registrations: 0,
                branch_stats: JSON.stringify([]),
                year_stats: JSON.stringify([]),
                workshop_stats: JSON.stringify([]),
                daily_registrations: JSON.stringify([])
            });
            console.log('✅ Default statistics created');
        } else {
            console.log('✅ Default statistics verified');
        }
    } catch (error) {
        console.error('Error inserting default statistics:', error.message);
    }
}

// Database operations
const dbOperations = {
    // Insert new registration
    insertRegistration: async (registrationData) => {
        const registration = new Registration(registrationData);
        return await registration.save();
    },

    // Get all registrations (with search, pagination, and sorting)
    getAllRegistrations: async (search = '', limit = 10, offset = 0, sortBy = 'registrationDate', sortOrder = 'desc') => {
        const query = { status: 'active' };
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { branch: { $regex: search, $options: 'i' } }
            ];
        }
        return await Registration.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(offset)
            .limit(limit);
    },

    // Get total count of registrations (with search)
    getRegistrationsCount: async (search = '') => {
        const query = { status: 'active' };
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { branch: { $regex: search, $options: 'i' } }
            ];
        }
        return await Registration.countDocuments(query);
    },

    // Get recent registrations (last 7 days)
    getRecentRegistrations: async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return await Registration.aggregate([
            { $match: { registrationDate: { $gte: sevenDaysAgo }, status: 'active' } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$registrationDate" } }, count: { $sum: 1 } } },
            { $project: { date: '$_id', count: 1, _id: 0 } },
            { $sort: { date: -1 } }
        ]);
    },

    // Get registration by ID
    getRegistrationById: async (id) => {
        return await Registration.findOne({ _id: id, status: 'active' });
    },

    // Get registration by email
    getRegistrationByEmail: async (email) => {
        return await Registration.findOne({ email, status: 'active' });
    },

    // Update registration
    updateRegistration: async (id, updateData) => {
        const result = await Registration.updateOne({ _id: id }, { $set: updateData });
        return { changes: result.modifiedCount };
    },

    // Mark email as sent
    markEmailSent: async (id) => {
        const result = await Registration.updateOne({ _id: id }, { $set: { emailSent: true, emailSentDate: Date.now() } });
        return { changes: result.modifiedCount };
    },

    // Get statistics
    getStatistics: async () => {
        const totalRegistrations = await Registration.countDocuments({ status: 'active' });
        const workshopYes = await Registration.countDocuments({ workshopAttendance: 'Yes', status: 'active' });
        const workshopNo = await Registration.countDocuments({ workshopAttendance: 'No', status: 'active' });
        const emailsSent = await Registration.countDocuments({ emailSent: true, status: 'active' });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayRegistrations = await Registration.countDocuments({
            registrationDate: {
                $gte: today,
                $lt: tomorrow
            },
            status: 'active'
        });

        return { totalRegistrations, workshopYes, workshopNo, emailsSent, todayRegistrations };
    },

    // Get branch statistics
    getBranchStats: async () => {
        return await Registration.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$branch', count: { $sum: 1 } } },
            { $project: { branch: '$_id', count: 1, _id: 0 } },
            { $sort: { count: -1 } }
        ]);
    },

    // Get year statistics
    getYearStats: async () => {
        return await Registration.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$yearOfStudy', count: { $sum: 1 } } },
            { $project: { yearOfStudy: '$_id', count: 1, _id: 0 } },
            { $sort: { yearOfStudy: 1 } }
        ]);
    },

    // Delete registration (hard delete)
    deleteRegistration: async (id) => {
        const result = await Registration.deleteOne({ _id: id });
        return { changes: result.deletedCount };
    },

    // ====== SEMINAR SETTINGS OPERATIONS ======

    // Get current seminar settings
    getSeminarSettings: async () => {
        return await SeminarSettings.findOne({ is_active: true }).sort({ created_at: -1 });
    },

    // Update seminar settings
    updateSeminarSettings: async (settingsData) => {
        const result = await SeminarSettings.updateOne({}, { $set: settingsData }, { upsert: true });
        return { changes: result.modifiedCount || result.upsertedCount };
    },

    // Create new seminar settings (handled by upsert in update)
    createSeminarSettings: async (settingsData) => {
        // This function is largely replaced by updateSeminarSettings with upsert: true
        // However, if you need to explicitly create a new one without updating an existing,
        // you would use:
        const newSettings = new SeminarSettings(settingsData);
        return await newSettings.save();
    },

    // ====== REGISTRATION CONTROL OPERATIONS ======

    // Get registration control status
    getRegistrationControl: async () => {
        return await RegistrationControl.findOne({});
    },

    // Update registration control
    updateRegistrationControl: async (controlData) => {
        const result = await RegistrationControl.updateOne({}, { $set: controlData }, { upsert: true });
        return { changes: result.modifiedCount || result.upsertedCount };
    },

    // ====== EMAIL CONTROL OPERATIONS ======

    // Get email control status
    getEmailControl: async () => {
        return await EmailControl.findOne({});
    },

    // Update email control
    updateEmailControl: async (controlData) => {
        const result = await EmailControl.updateOne({}, { $set: controlData }, { upsert: true });
        return { changes: result.modifiedCount || result.upsertedCount };
    },

    // ====== 2FA OPERATIONS ======

    // Get admin by ID
    getAdminById: async (id) => {
        return await AdminUser.findOne({ _id: id, is_active: true });
    },

    // Get admin by username
    getAdminByUsername: async (username) => {
        return await AdminUser.findOne({ username, is_active: true });
    },

    // Enable 2FA for user
    enable2FA: async (userId, secret, backupCodes) => {
        const result = await AdminUser.updateOne(
            { _id: userId },
            {
                $set: {
                    two_factor_enabled: true,
                    two_factor_secret: secret,
                    backup_codes: JSON.stringify(backupCodes),
                    temp_secret: null,
                    temp_secret_expires: null
                }
            }
        );
        return { changes: result.modifiedCount };
    },

    // Disable 2FA for user
    disable2FA: async (userId) => {
        const result = await AdminUser.updateOne(
            { _id: userId },
            {
                $set: {
                    two_factor_enabled: false,
                    two_factor_secret: null,
                    backup_codes: null,
                    two_factor_last_used: null,
                    temp_secret: null,
                    temp_secret_expires: null
                }
            }
        );
        return { changes: result.modifiedCount };
    },

    // Store temporary secret for 2FA setup
    storeTempSecret: async (userId, tempSecret) => {
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        const result = await AdminUser.updateOne(
            { _id: userId },
            { $set: { temp_secret: tempSecret, temp_secret_expires: expiresAt } }
        );
        return { changes: result.modifiedCount };
    },

    // Get temporary secret
    getTempSecret: async (userId) => {
        return await AdminUser.findOne(
            { _id: userId, temp_secret_expires: { $gt: Date.now() } },
            { temp_secret: 1, temp_secret_expires: 1 }
        );
    },

    // Update backup codes
    updateBackupCodes: async (userId, backupCodes) => {
        const result = await AdminUser.updateOne(
            { _id: userId },
            { $set: { backup_codes: JSON.stringify(backupCodes) } }
        );
        return { changes: result.modifiedCount };
    },

    // Record 2FA usage
    record2FAUsage: async (userId, method) => {
        const result = await AdminUser.updateOne(
            { _id: userId },
            { $set: { two_factor_last_used: Date.now(), last_login: Date.now() } }
        );
        return { changes: result.modifiedCount };
    }
};

module.exports = {
    db,
    initDatabase,
    dbOperations,
    Registration,
    AdminUser,
    SeminarSettings,
    RegistrationControl,
    EmailControl,
    Statistics
};
 