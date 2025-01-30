const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const jsonServer = require('json-server');
const path = require('path');
require('dotenv').config();

// Create combined server
const app = express();
const jsonServerRouter = jsonServer.router('db.json');
const jsonServerMiddlewares = jsonServer.defaults();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Apply CORS to all routes
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount JSON Server under /api
app.use(
    '/api',
    cors(),
    jsonServerMiddlewares,
    jsonServerRouter
);

console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Password:', process.env.EMAIL_PASSWORD ? '***' : 'MISSING');

// Email Verification Endpoint
app.post('/send-verification-email', async (req, res) => {
    try {
        const { email, token } = req.body;
        console.log('Attempting to send email to:', email);

        const mailOptions = {
            from: `"KAZIHUB" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email Address',
            html: `<p>Verify: <a href="http://127.0.0.1:5500/frontend/pages/auth/verify-email.html?token=${token}">Link</a></p>`
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', email);
        res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Email Error Details:', error);
        res.status(500).json({
            error: 'Failed to send verification email',
            details: error.message
        });
    }
});

// Password Reset Endpoint
app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const resetToken = Math.random().toString(36).slice(2);

        // Save reset token through JSON Server API
        const response = await fetch(`http://localhost:${process.env.PORT || 8500}/api/users?email=${email}`);
        const users = await response.json();

        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        await fetch(`http://localhost:${process.env.PORT || 8500}/api/users/${users[0].id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resetToken,
                resetTokenExpiry: Date.now() + 3600000
            })
        });

        // Send email
        const mailOptions = {
            from: `"KAZIHUB" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Reset password: <a href="http://127.0.0.1:5500/frontend/pages/auth/reset-password.html?token=${resetToken}">Reset Link</a></p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Reset email sent' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Start combined server
const PORT = process.env.PORT || 8500;
app.listen(PORT, () => {
    console.log(`Combined server running on port ${PORT}`);
    console.log(`JSON Server available at http://localhost:${PORT}/api`);
});