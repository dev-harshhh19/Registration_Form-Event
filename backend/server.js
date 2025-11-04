const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Import routes and database
const registrationRoutes = require('./routes/registration');
const adminRoutes = require('./routes/admin');
const { initDatabase, dbOperations } = require('./database/database');
const { sendWelcomeEmail } = require('./services/emailService');

// Security middleware
// Build CSP lists conditionally (more strict in production)
const defaultScriptSrc = process.env.NODE_ENV === 'production'
    ? ["'self'", "https://cdn.tailwindcss.com", "https://unpkg.com"]
    : ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com", "http://localhost:3001"];

const defaultStyleSrc = process.env.NODE_ENV === 'production'
    ? ["'self'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"]
    : ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"];

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: defaultStyleSrc,
            scriptSrc: defaultScriptSrc,
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = [];

if (process.env.NODE_ENV === 'production') {
    // In production, only allow the specified FRONTEND_URL
    if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
    }
} else {
    // In development, allow localhost origins
    allowedOrigins.push('http://localhost:3001'); // React dev server
    allowedOrigins.push('http://localhost:3000'); // Backend serving static files
    allowedOrigins.push(process.env.FRONTEND_URL || 'http://localhost:3001'); // Allow FRONTEND_URL if set, otherwise default to localhost
}

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// API Routes
app.use('/api/registration', registrationRoutes);
app.use('/api/admin', adminRoutes);

// New endpoint to fetch seminar information
app.get('/api/seminar-info', async (req, res) => {
    try {
        const seminarSettings = await dbOperations.getSeminarSettings();
        if (!seminarSettings) {
            return res.status(404).json({
                success: false,
                message: 'Seminar information not found'
            });
        }

        res.json({
            success: true,
            data: {
                title: seminarSettings.title,
                date: seminarSettings.date,
                time: seminarSettings.time,
                location: seminarSettings.location,
                duration: seminarSettings.duration,
                description: seminarSettings.description,
                instructor_name: seminarSettings.instructor_name,
                max_participants: seminarSettings.max_participants
            }
        });
    } catch (error) {
        console.error('Error fetching seminar info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seminar information'
        });
    }
});

// Add proxy for /api/registration/health to port 9999
// app.use('/api/registration/health', createProxyMiddleware({
//   target: 'http://localhost:9999',
//   changeOrigin: true,
// }));

// Error handling middleware (must come before static file serving)
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON format'
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler for API routes only
app.use('/api', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: 'API route not found'
        });
    }
    next();
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, '..', 'frontend', 'build');
    app.use(express.static(buildPath));
    
    // Serve React app for all non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

// Initialize database and start server
async function startServer() {
    try {
        await initDatabase();
        console.log('✅ MongoDB initialized successfully');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📧 Email service: ${process.env.EMAIL_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            if (process.env.NODE_ENV !== 'production') {
                console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
            }
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

startServer();