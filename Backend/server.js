const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const jsonServerUrl = 'http://localhost:3000';

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Enhanced CORS configuration
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email Verification Endpoint
app.post('/send-verification-email', async (req, res) => {
    try {
        const { email, token } = req.body;
        
        // Save verification token to JSON Server
        const { data: users } = await axios.get(`${jsonServerUrl}/users?email=${email}`);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        
        await axios.patch(`${jsonServerUrl}/users/${users[0].id}`, {
            verificationToken: token,
            isVerified: false
        });

        // Send email
        const mailOptions = {
            from: `"KaziHub" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email Address',
            html: `<p>Welcome to KaziHub. We are happy to have you on board. Click here to verify: <a href="http://localhost:3001/verify-email.html?token=${token}">Verify Email</a></p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Failed to send verification email' });
    }
});

// Password Reset Endpoint
app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const resetToken = Math.random().toString(36).slice(2);
        
        // Save reset token to JSON Server
        const { data: users } = await axios.get(`${jsonServerUrl}/users?email=${email}`);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        
        await axios.patch(`${jsonServerUrl}/users/${users[0].id}`, {
            resetToken,
            resetTokenExpiry: Date.now() + 3600000 // 1 hour
        });

        // Send email
        const mailOptions = {
            from: `"KaziHub" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Reset password: <a href="http://localhost:3001/reset-password.html?token=${resetToken}">Reset Link</a></p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Reset email sent' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Start server
const PORT = process.env.PORT || 8500;
app.listen(PORT, () => console.log(`Node server running on port ${PORT}`));