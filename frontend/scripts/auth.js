import showToast from './toast.js';

const API_BASE = 'http://localhost:8500/api';
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
            if (existingUsers.length > 0) {
                const existingUser = existingUsers[0];
                if (existingUser.isVerified) {
                    showToast('Email already registered', 'error');
                } else {
                    // Resend verification email
                    const emailRes = await fetch(`${NODE_SERVER}/send-verification-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, token: existingUser.verificationToken })
                    });
                    if (!emailRes.ok) throw new Error('Failed to resend verification email');
                    showToast('Verification email resent. Please check your inbox.', 'success');
                }
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

    // Login handler
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const submitBtn = e.target.querySelector('button');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            const res = await fetch(`${API_BASE}/users?email=${email}`);
            if (!res.ok) throw new Error('Login failed');

            const users = await res.json();
            if (users.length === 0) throw new Error('User not found');

            const user = users[0];
            if (user.password !== password) throw new Error('Incorrect password');

            if (!user.isVerified) {
                showToast('Please verify your email before logging in.', 'error');
                return;
            }

            localStorage.setItem('user', JSON.stringify(user));
            showToast('Login successful! Redirecting...', 'success');

            const role = user.role.toLowerCase();
            if (role === 'admin') {
                window.location.href = 'admin.html';
            } else if (role === 'manager') {
                window.location.href = 'manager.html';
            } else {
                window.location.href = 'employee.html';
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
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