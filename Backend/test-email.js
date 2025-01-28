require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'test@example.com',
    subject: 'Test Email',
    text: 'This is a test'
}, (err) => {
    if (err) console.error('Test failed:', err);
    else console.log('Test email sent successfully');
});