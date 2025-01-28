import showToast from './toast.js';

const API_BASE = 'http://localhost:3000';
const NODE_SERVER = 'http://localhost:8500';

document.addEventListener('DOMContentLoaded', () => {
    // Registration handler
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const role = document.getElementById('role').value;
        const submitBtn = e.target.querySelector('button');

        try {
            // Check for existing user
            const checkRes = await fetch(`${API_BASE}/users?email=${email}`);
            if (!checkRes.ok) throw new Error('Failed to check existing users');
            
            const existingUsers = await checkRes.json();
            if (existingUsers.some(u => u.isVerified)) {
                showToast('Email already registered', 'error');
                return;
            }

            // Create new user
            const verificationToken = Math.random().toString(36).slice(2);
            const userRes = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                    isVerified: false,
                    verificationToken,
                    createdAt: new Date().toISOString()
                })
            });

            // Send verification email
            const emailRes = await fetch(`${NODE_SERVER}/send-verification-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: verificationToken })
            });

            if (!emailRes.ok) throw new Error('Failed to send verification email');

            showToast('Registration successful! Check your email for verification.', 'success');
            document.getElementById('registerModal').classList.add('hidden');
        } catch (error) {
            showToast(`Registration failed: ${error.message}`, 'error');
            console.error('Registration error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    });

    // Forgot password handler
    document.getElementById('forgotPasswordForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value.trim();
        const submitBtn = e.target.querySelector('button');

        try {
            const res = await fetch(`${NODE_SERVER}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!res.ok) throw new Error(await res.text());
            
            showToast('Password reset instructions sent to your email', 'success');
            document.getElementById('forgotPasswordModal').classList.add('hidden');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
        }
    });
});