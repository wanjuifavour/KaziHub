import { log } from 'console';
import showToast from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const isValidPassword = (password) => {
        return password.length >= 6;
    };
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        if (!email || !isValidEmail(email)) {
            showToast('Please enter a valid email address (e.g., user@example.com)', 'error');
            return;
        }
        if (!password || !isValidPassword(password)) {
            showToast('Password must be at least 6 characters long', 'error');
            return;
        }
        showToast(`Logged in as ${email}`, 'success');
        document.getElementById('loginModal').classList.add('hidden');
    });
    const registerForm = document.getElementById('registerForm');
    registerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const role = document.getElementById('role').value;

        // Validate inputs
        if (!email || !isValidEmail(email)) {
            showToast('Please enter a valid email address (e.g., user@example.com)', 'error');
            return;
        }

        if (!password || !isValidPassword(password)) {
            showToast('Password must be at least 6 characters long', 'error');
            return;
        }

        if (!role) {
            showToast('Please select a role', 'error');
            return;
        }

        // Send registration request
        fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, role })
        })
            .then(response => response.text())
            .then(message => {
                showToast(message, 'success');
                document.getElementById('registerModal').classList.add('hidden');
            })
            .catch(error => showToast('Error registering user.', 'error'));
    });
});
