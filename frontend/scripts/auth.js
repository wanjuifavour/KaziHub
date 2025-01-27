import showToast from './toast.js';

const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // Function to validate email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Function to validate password
    const isValidPassword = (password) => {
        return password.length >= 6;
    };

    // Login Form Submission
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        // Basic validation
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        const submitBtn = e.target.querySelector('button');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            // Check if user exists
            const response = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`);
            const users = await response.json();
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                showToast('Invalid credentials', 'error');
                return;
            }

            handleLoginSuccess(user);
        } catch (error) {
            showToast('Login failed', 'error');
            console.error('Login error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });

    // Register Form Submission
    const registerForm = document.getElementById('registerForm');
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const role = document.getElementById('role').value;

        // Validation
        if (!name || !email || !password || !role) {
            showToast('Please fill all fields', 'error');
            return;
        }

        const submitBtn = e.target.querySelector('button');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        try {
            // Check if email exists
            const checkResponse = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`);
            const existingUsers = await checkResponse.json();
            
            if (existingUsers.length > 0) {
                showToast('Email already registered', 'error');
                return;
            }

            // Create new user
            const newUser = {
                name,
                email,
                password, // Note: In real application, hash password
                role,
                createdAt: new Date().toISOString()
            };

            const createResponse = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            const createdUser = await createResponse.json();
            showToast('Registration successful!', 'success');
            document.getElementById('registerModal').classList.add('hidden');

            // Add employee creation logic after user registration
            await fetch(`${API_BASE}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    department: 'Unassigned',
                    position: 'New Hire',
                    phoneNumber: '',
                    salary: 0
                })
            });
        } catch (error) {
            showToast('Registration failed', 'error');
            console.error('Registration error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    });

    // Forgot Password Form Submission
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    forgotPasswordForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value.trim();

        if (!email || !isValidEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        fetch('http://localhost:5000/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        })
            .then(response => response.json())
            .then(data => {
                showToast(data.message, 'success');
                document.getElementById('forgotPasswordModal').classList.add('hidden');
            })
            .catch(() => showToast('Error sending reset link', 'error'));
    });

    // Reset Password Form Submission
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    resetPasswordForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const token = document.getElementById('resetToken').value;

        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (!isValidPassword(newPassword)) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        fetch('http://localhost:5000/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        })
            .then(response => response.json())
            .then(data => {
                showToast(data.message, 'success');
                document.getElementById('resetPasswordModal').classList.add('hidden');
            })
            .catch(() => showToast('Error resetting password', 'error'));
    });

    // Add event listener for forgot password link
    document.getElementById('showForgotPassword')?.addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('forgotPasswordModal').classList.remove('hidden');
    });

    // Add role-based UI handling
    function updateUI(user) {
        const headerNav = document.querySelector('header nav');
        
        if (user) {
            headerNav.innerHTML = `
                <span>Welcome, ${user.role}</span>
                <button type="button" id="logoutBtn">Logout</button>
            `;
        } else {
            headerNav.innerHTML = `
                <button type="button" id="loginBtn">Login</button>
                <button type="button" id="registerBtn">Register</button>
            `;
        }
        
        // Setup button listeners after DOM update
        setupButtonListeners();
    }

    function loadRoleSpecificContent(role) {
        const mainContent = document.getElementById('content');
        // Add role-specific content here
        mainContent.innerHTML = `
        <h2>${role} Dashboard</h2>
        <div class="dashboard-content">
            <!-- Add role-specific features here -->
        </div>
    `;
    }

    function logout() {
        localStorage.removeItem('user');
        showToast('Successfully logged out', 'success');
        window.location.href = 'index.html';
    }

    // Initialize UI based on auth state
    const user = JSON.parse(localStorage.getItem('user'));
    updateUI(user);
});

// New helper functions
function validateLoginInputs(email, password) {
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
    }
    if (!isValidPassword(password)) {
        showToast('Password must be at least 6 characters', 'error');
        return false;
    }
    return true;
}

function handleLoginResponse(response) {
    return response.json().then(data => {
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            showToast(`Logged in as ${data.email}`, 'success');
            document.getElementById('loginModal').classList.add('hidden');
            window.location.reload();
        } else {
            showToast(data.error || 'Login failed', 'error');
        }
    });
}

function resetButton(button, originalText) {
    button.disabled = false;
    button.textContent = originalText;
}

function validateRegistrationInputs(email, password, role) {
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
    }
    if (!isValidPassword(password)) {
        showToast('Password must be at least 6 characters', 'error');
        return false;
    }
    if (!role) {
        showToast('Please select a role', 'error');
        return false;
    }
    return true;
}

function handleRegistrationResponse(response) {
    return response.json().then(data => {
        showToast(data.message, 'success');
        document.getElementById('registerModal').classList.add('hidden');
    });
}

function handleRegistrationError(error) {
    showToast('Error registering user.', 'error');
}

function setupButtonListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Remove old listeners
    const cleanupListeners = () => {
        loginBtn?.replaceWith(loginBtn?.cloneNode(true));
        registerBtn?.replaceWith(registerBtn?.cloneNode(true));
        logoutBtn?.replaceWith(logoutBtn?.cloneNode(true));
    };

    // Clean up first
    cleanupListeners();

    // Setup new listeners
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        document.getElementById('loginModal').classList.remove('hidden');
    });

    document.getElementById('registerBtn')?.addEventListener('click', () => {
        document.getElementById('registerModal').classList.remove('hidden');
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        logout();
    });
}

function handleLoginSuccess(user) {
    localStorage.setItem('user', JSON.stringify(user));
    showToast(`Welcome ${user.name}!`, 'success');
    updateUI(user);
    
    // Role-based navigation
    const role = user.role.toLowerCase();
    if (role === 'admin') {
        window.location.href = 'admin.html';
    } else if (role === 'manager') {
        window.location.href = 'manager.html';
    } else {
        window.location.href = 'employee.html';
    }
}