# 🚀 Production-Ready Seminar Registration System

This is a full-stack, production-ready registration system designed for seminars, workshops, and events. It features a secure Node.js/Express.js backend and a modern, responsive React frontend. The system is optimized for performance, security, and a smooth user experience with the integration of Lenis.js for elegant scrolling animations.

## ✨ Core Features

### Frontend (React & Tailwind CSS)
- **Modern & Responsive UI**: Built with Tailwind CSS for a mobile-first, responsive design that looks great on all devices.
- **Smooth Scrolling**: Integrated with **Lenis.js** to provide a fluid and smooth scrolling experience.
- **Real-time Form Validation**: Interactive and user-friendly registration form with instant validation feedback.
- **Admin Dashboard**: A secure, feature-rich dashboard for managing registrations, viewing statistics, and exporting data.
- **Component-Based Architecture**: Organized and maintainable code structure using React components.

### Backend (Node.js & Express.js)
- **Secure REST API**: A robust API built with Express.js to handle all registration and admin functionalities.
- **JWT Authentication**: Secure admin endpoints using JSON Web Tokens (JWT) for authentication and authorization.
- **Data Persistence**: Uses SQLite for a lightweight, file-based database solution, complete with migration scripts.
- **Automated Email Service**: Sends confirmation emails to new registrants using an integrated email service.
- **Data Export**: Allows administrators to export registration data to a CSV file directly from the dashboard.
- **Production-Grade Security**: Implements `helmet`, `cors`, and `express-rate-limit` to protect against common web vulnerabilities.

## 🛠️ Tech Stack

| Category      | Technology                                       |
|---------------|--------------------------------------------------|
| **Frontend**  | React, Tailwind CSS, Lenis.js, Axios             |
| **Backend**   | Node.js, Express.js                              |
| **Database**  | SQLite3                                          |
| **Security**  | JWT, bcryptjs, Helmet, CORS, Express Rate Limit  |
| **Deployment**| GitHub Actions, Node.js Server                   |
| **Utilities** | Nodemailer (for emails), Compression, Morgan (for logging) |

## 🚀 Getting Started (Production)

Follow these steps to set up and run the application in a production environment.

### 1. Prerequisites
- Node.js (v16 or higher)
- npm

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd seminar-registration
```

### 3. Configure Environment Variables
Create a `.env` file in the root of the project and add the following variables.

```env
# Server Configuration
PORT=3000
NODE_ENV=production
JWT_SECRET=your_super_secret_and_strong_jwt_key

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password

# Email Service (Optional)
EMAIL_ENABLED=true
FRONTEND_URL=https://your-production-frontend-url.com
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### 4. Install Dependencies
Install the necessary dependencies for both the backend and the frontend.

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 5. Build the Frontend
Create a production-ready build of the React application.

```bash
cd frontend
npm run build
cd ..
```
This will generate a `build` folder inside the `frontend` directory, which will be served by the Node.js server.

### 6. Start the Production Server
Start the server, which will serve the frontend and handle all API requests.

```bash
npm start
```
The application will be available at `http://localhost:3000`.

## 📁 Project Structure

```
/
├── data/                   # SQLite database file
├── database/               # Database initialization and migrations
├── frontend/
│   ├── build/              # Production build of the React app
│   ├── public/             # Public assets and index.html
│   └── src/                # React application source code
├── models/                 # Data models (if any)
├── routes/                 # API route definitions
├── services/               # Business logic (email, 2FA)
├── .gitignore              # Files and folders ignored by Git
├── package.json            # Backend dependencies and scripts
├── server.js               # Main Express.js server file
└── README.md               # This file
```

## 🔒 Security Features

This application is built with security in mind and includes the following features:
- **Helmet**: Sets various HTTP headers to protect against common vulnerabilities like XSS and clickjacking.
- **CORS**: Enforces a strict Cross-Origin Resource Sharing policy to prevent unauthorized domains from accessing the API.
- **Rate Limiting**: Protects against brute-force attacks by limiting the number of requests from a single IP.
- **JWT Authentication**: Ensures that only authenticated administrators can access sensitive routes and data.
- **Parameterized Queries**: The database integration uses parameterized queries to prevent SQL injection attacks.

## 📝 License

This project is licensed under the MIT License.

---
Developed by HARSHAD NIKAM