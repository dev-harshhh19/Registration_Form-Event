const nodemailer = require('nodemailer');
const { dbOperations } = require('../database/database');

// Helper function to format seminar date
const formatSeminarDate = (settings) => {
    const date = settings?.date || process.env.SEMINAR_DATE;
    const time = settings?.time || process.env.SEMINAR_TIME;
    
    if (!date || !time) {
        return 'TBD';
    }
    
    try {
        const seminarDate = new Date(date);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return `${seminarDate.toLocaleDateString('en-US', options)} at ${time}`;
    } catch (error) {
        return `${date} at ${time}`;
    }
};

// Get seminar settings with fallback
const getSeminarSettings = async () => {
    try {
        const settings = await dbOperations.getSeminarSettings();
        return settings || {
            title: process.env.SEMINAR_TITLE || 'Prompt Your Future: Learn Prompt Engineering & Build Your First Portfolio',
            date: process.env.SEMINAR_DATE || '2025-07-25',
            time: process.env.SEMINAR_TIME || '10:00 AM',
            location: process.env.SEMINAR_LOCATION || 'Seminar Hall, First Floor, IT building.',
            duration: process.env.SEMINAR_DURATION || '3 hours',
            instructor_name: 'Harshad Nikam',
            whatsapp_number: process.env.WHATSAPP_NUMBER || '+919156633238',
            whatsapp_group_link: process.env.WHATSAPP_GROUP_LINK || 'https://chat.whatsapp.com/+919156633238'
        };
    } catch (error) {
        console.error('Error fetching seminar settings:', error);
        return {
            title: 'Prompt Your Future: Learn Prompt Engineering & Build Your First Portfolio',
            date: '2025-07-25',
            time: '10:00 AM',
            location: 'Seminar Hall, First Floor, IT building.',
            duration: '3 hours',
            instructor_name: 'Harshad Nikam',
            whatsapp_number: '+919156633238',
            whatsapp_group_link: 'https://chat.whatsapp.com/+919156633238'
        };
    }
};

// Create transporter
const createTransporter = () => {
    // For development, use Ethereal Email (fake SMTP)
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
        return nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: process.env.ETHEREAL_USER || 'test@ethereal.email',
                pass: process.env.ETHEREAL_PASS || 'test123'
            }
        });
    }

    // For production, use real SMTP
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Email templates
const emailTemplates = {
    welcome: (data) => ({
        subject: `🎓 Welcome to Prompt Your Future Seminar!`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Prompt Your Future</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container {
                        background: white;
                        border-radius: 15px;
                        padding: 40px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                        border-radius: 50%;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 20px;
                    }
                    .logo-icon {
                        color: white;
                        font-size: 2rem;
                    }
                    h1 {
                        color: #1f2937;
                        margin: 0;
                        font-size: 2rem;
                        background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    .welcome-text {
                        font-size: 1.1rem;
                        color: #4b5563;
                        margin-bottom: 30px;
                    }
                    .details {
                        background: #f8fafc;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 10px 0;
                        padding: 8px 0;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .label {
                        font-weight: 600;
                        color: #374151;
                    }
                    .value {
                        color: #6b7280;
                    }
                    .workshop-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 0.875rem;
                        font-weight: 600;
                    }
                    .workshop-yes {
                        background: #dcfce7;
                        color: #166534;
                    }
                    .workshop-no {
                        background: #fef3c7;
                        color: #92400e;
                    }
                    .next-steps {
                        background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                        color: white;
                        padding: 25px;
                        border-radius: 10px;
                        margin: 30px 0;
                    }
                    .next-steps h3 {
                        margin: 0 0 15px 0;
                        font-size: 1.25rem;
                    }
                    .next-steps ul {
                        margin: 0;
                        padding-left: 20px;
                    }
                    .next-steps li {
                        margin: 8px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        color: #6b7280;
                        font-size: 0.875rem;
                    }
                    .social-links {
                        margin: 20px 0;
                    }
                    .social-links a {
                        display: inline-block;
                        margin: 0 10px;
                        color: #3b82f6;
                        text-decoration: none;
                        padding: 8px 16px;
                        border-radius: 8px;
                        background: #f0f9ff;
                        border: 1px solid #3b82f6;
                        transition: all 0.3s ease;
                    }
                    .social-links a:hover {
                        background: #3b82f6;
                        color: white;
                        text-decoration: none;
                    }
                    .whatsapp-section {
                        background: #dcfce7;
                        border: 2px solid #22c55e;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .whatsapp-section h3 {
                        color: #166534;
                        margin: 0 0 15px 0;
                    }
                    .whatsapp-button {
                        display: inline-block;
                        background: #25d366;
                        color: white;
                        padding: 12px 24px;
                        border-radius: 25px;
                        text-decoration: none;
                        font-weight: 600;
                        margin: 10px;
                        transition: all 0.3s ease;
                    }
                    .whatsapp-button:hover {
                        background: #128c7e;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(37, 213, 102, 0.3);
                    }
                    .emergency-contact {
                        background: #fef3c7;
                        border: 2px solid #f59e0b;
                        border-radius: 10px;
                        padding: 15px;
                        margin: 15px 0;
                        text-align: center;
                    }
                    .emergency-contact h4 {
                        color: #92400e;
                        margin: 0 0 10px 0;
                    }
                    @media (max-width: 600px) {
                        .container {
                            padding: 20px;
                        }
                        h1 {
                            font-size: 1.5rem;
                        }
                        .detail-row {
                            flex-direction: column;
                        }
                        .value {
                            margin-top: 5px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">
                            <span class="logo-icon">🚀</span>
                        </div>
                        <h1>Welcome to Prompt Your Future!</h1>
                        <p class="welcome-text">
                            Hi ${data.fullName}, thank you for registering for our seminar on Prompt Engineering!
                        </p>
                        <p class="seminar-date" style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center; border-left: 4px solid #3b82f6;">
                            <strong>📅 Seminar Date:</strong> ${formatSeminarDate(data.settings)}<br>
                            <strong>📍 Location:</strong> ${data.settings?.location || 'TBD'}
                        </p>
                    </div>

                    <div class="details">
                        <h3 style="margin: 0 0 15px 0; color: #1f2937;">Registration Details</h3>
                        <div class="detail-row">
                            <span class="label">Name:</span>
                            <span class="value">${data.fullName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Email:</span>
                            <span class="value">${data.email}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Branch:</span>
                            <span class="value">${data.branch}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Year:</span>
                            <span class="value">${data.yearOfStudy}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Workshop:</span>
                            <span class="value">
                                <span class="workshop-badge workshop-${data.workshopAttendance.toLowerCase()}">
                                    ${data.workshopAttendance}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div class="next-steps">
                        <h3>🎯 What's Next?</h3>
                        <ul>
                            <li>We'll send you detailed seminar information within 24 hours</li>
                            <li>Join our WhatsApp community for updates and networking</li>
                            <li>Prepare your questions about AI and prompt engineering</li>
                            <li>Follow us on social media for daily AI tips</li>
                        </ul>
                    </div>

                    <div class="whatsapp-section">
                        <h3>📱 Join Our WhatsApp Community</h3>
                        <p>Connect with fellow participants, get real-time updates, and network with AI enthusiasts!</p>
                        <a href="${process.env.WHATSAPP_GROUP_LINK || 'https://chat.whatsapp.com/+919156633238'}" class="whatsapp-button" target="_blank">
                            💬 Join ${process.env.WHATSAPP_GROUP_NAME || 'Our Community'}
                        </a>
                    </div>

                    <div class="emergency-contact">
                        <h4>🚨 Need Help?</h4>
                        <p>Having trouble with registration or have urgent questions?</p>
                        <a href="https://wa.me/${process.env.WHATSAPP_NUMBER || '919156633238'}" class="whatsapp-button" target="_blank">
                            📞 Contact Us on WhatsApp
                        </a>
                    </div>

                    <div class="social-links">
                        <h3>Stay Connected</h3>
                        <a href="https://x.com/not_harshad_19">X (Twitter)</a>
                        <a href="https://www.linkedin.com/in/harshad-nikam-311734281/">LinkedIn</a>
                        <a href="https://chat.whatsapp.com/+919156633238">WhatsApp Community</a>
                    </div>

                    <div class="footer">
                        <p>This email was sent to ${data.email}</p>
                        <p>If you have any questions, please reply to this email</p>
                        <p>© 2025 Prompt Your Future. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Welcome to Prompt Your Future Seminar!

Hi ${data.fullName},

Thank you for registering for our seminar on Prompt Engineering & Portfolio Building!

Registration Details:
- Name: ${data.fullName}
- Email: ${data.email}
- Branch: ${data.branch}
- Year: ${data.yearOfStudy}
- Workshop Attendance: ${data.workshopAttendance}

What's Next?
1. We'll send you detailed seminar information within 24 hours
2. Join our WhatsApp community for updates and networking
3. Prepare your questions about AI and prompt engineering
4. Follow us on social media for daily AI tips

Links:
- WhatsApp: https://chat.whatsapp.com/+919156633238
- X: https://x.com/not_harshad_19
- LinkedIn: https://www.linkedin.com/in/harshad-nikam-311734281/

If you have any questions, please reply to this email.

Best regards,
The Prompt Your Future Team
        `
    }),

    reminder: (data) => ({
        subject: `⏰ Reminder: Prompt Your Future Seminar on ${process.env.SEMINAR_DATE || 'TBD'}!`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Seminar Reminder</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    }
                    .container {
                        background: white;
                        border-radius: 15px;
                        padding: 40px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .reminder-icon {
                        font-size: 3rem;
                        margin-bottom: 20px;
                    }
                    h1 {
                        color: #dc2626;
                        margin: 0;
                        font-size: 2rem;
                    }
                    .event-details {
                        background: #fef2f2;
                        border: 2px solid #fecaca;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .event-details h3 {
                        margin: 0 0 15px 0;
                        color: #dc2626;
                    }
                    .event-details p {
                        margin: 8px 0;
                        font-weight: 600;
                    }
                    .checklist {
                        background: #f0f9ff;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .checklist h3 {
                        margin: 0 0 15px 0;
                        color: #0369a1;
                    }
                    .checklist ul {
                        margin: 0;
                        padding-left: 20px;
                    }
                    .checklist li {
                        margin: 8px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="reminder-icon">⏰</div>
                        <h1>Seminar Reminder!</h1>
                        <p>Hi ${data.fullName}, don't forget about our seminar!</p>
                    </div>

                    <div class="event-details">
                        <h3>Event Details</h3>
                        <p><strong>Date:</strong> ${formatSeminarDate()}</p>
                        <p><strong>Location:</strong> ${process.env.SEMINAR_LOCATION || 'TBD'}</p>
                        <p><strong>Duration:</strong> ${process.env.SEMINAR_DURATION || 'TBD'}</p>
                        <p><strong>What to bring:</strong> Laptop, notebook, and enthusiasm!</p>
                    </div>

                    <div class="checklist">
                        <h3>Pre-Seminar Checklist</h3>
                        <ul>
                            <li>✅ Set your alarm for 9:30 AM</li>
                            <li>✅ Charge your laptop</li>
                            <li>✅ Prepare questions about AI</li>
                            <li>✅ Join our WhatsApp community for live updates</li>
                        </ul>
                    </div>

                    <p style="text-align: center; margin-top: 30px;">
                        <strong>We're excited to see you there! 🚀</strong>
                    </p>
                </div>
            </body>
            </html>
        `
    })
};

// Send welcome email
async function sendWelcomeEmail(data) {
    if (process.env.EMAIL_ENABLED !== 'true') {
        console.log('Email service disabled, skipping welcome email');
        return;
    }

    try {
        // Get seminar settings
        const settings = await getSeminarSettings();
        
        const transporter = createTransporter();
        const template = emailTemplates.welcome({ ...data, settings });
        
        const mailOptions = {
            from: process.env.FROM_EMAIL || 'noreply@promptfuture.com',
            to: data.email,
            subject: template.subject,
            html: template.html,
            text: template.text
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('Welcome email sent successfully:', {
            messageId: info.messageId,
            to: data.email,
            previewURL: nodemailer.getTestMessageUrl(info)
        });

        return info;
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        // Don't throw error - let registration continue
        console.log('Email service under process - registration will continue');
        return null;
    }
}

// Send reminder email
async function sendReminderEmail(data) {
    if (process.env.EMAIL_ENABLED !== 'true') {
        console.log('Email service disabled, skipping reminder email');
        return;
    }

    try {
        const transporter = createTransporter();
        const template = emailTemplates.reminder(data);
        
        const mailOptions = {
            from: process.env.FROM_EMAIL || 'noreply@promptfuture.com',
            to: data.email,
            subject: template.subject,
            html: template.html,
            text: template.text
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('Reminder email sent successfully:', {
            messageId: info.messageId,
            to: data.email
        });

        return info;
    } catch (error) {
        console.error('Failed to send reminder email:', error);
        throw error;
    }
}

// Test email service
async function testEmailService() {
    try {
        const transporter = createTransporter();
        const info = await transporter.verify();
        console.log('Email service is ready:', info);
        return true;
    } catch (error) {
        console.error('Email service test failed:', error);
        return false;
    }
}

async function scheduleReminderEmails() {
    const settings = await getSeminarSettings();

    const seminarDate = new Date(`${settings.date}T${settings.time}`);
    const now = new Date();

    // Calculate reminder times
    const oneDayBefore = new Date(seminarDate.getTime() - 24 * 60 * 60 * 1000);
    const twoHoursBefore = new Date(seminarDate.getTime() - 2 * 60 * 60 * 1000);

    if (now > seminarDate) {
        console.log('Seminar is already concluded. No reminders scheduled.');
        return;
    }

    // Send reminders if the current time has reached the scheduled reminder time
    if (now >= oneDayBefore) {
        console.log('Sending 24-hour reminder emails...');
        // Fetch all registered users
        const registrations = await dbOperations.getAllRegistrations();
        registrations.forEach(async (registration) => {
            if (!registration.emailSent) {
                await sendReminderEmail({ email: registration.email, fullName: registration.fullName });
            }
        });
    }

    if (now >= twoHoursBefore) {
        console.log('Sending 2-hour reminder emails...');
        // Fetch all registered users
        const registrations = await dbOperations.getAllRegistrations();
        registrations.forEach(async (registration) => {
            if (!registration.emailSent) {
                await sendReminderEmail({ email: registration.email, fullName: registration.fullName });
            }
        });
    }

    console.log('Reminder emails scheduled successfully.');
}

module.exports = {
    sendWelcomeEmail,
    sendReminderEmail,
    testEmailService,
    createTransporter,
    scheduleReminderEmails
};
