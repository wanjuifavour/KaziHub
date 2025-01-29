document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) {
        if (user.role.toLowerCase() === 'admin') {
            window.location.href = 'admin.html';
        } else if (user.role.toLowerCase() === 'manager') {
            window.location.href = 'manager.html';
        } else {
            window.location.href = 'employee.html';
        }
    }

    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeButtons = document.querySelectorAll('.close');

    // Login Modal
    loginBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));

    // Register Modal
    registerBtn.addEventListener('click', () => registerModal.classList.remove('hidden'));

    const showForgotPasswordLink = document.getElementById('showForgotPassword');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');

    // Forgot Password Modal
    showForgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.add('hidden');
        forgotPasswordModal.classList.remove('hidden');
    });

    // Close Modals
    closeButtons.forEach((button) =>
        button.addEventListener('click', (e) => {
            const targetModal = document.getElementById(e.target.dataset.target);
            targetModal.classList.add('hidden');
        })
    );

    // Close modals on background click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
});
