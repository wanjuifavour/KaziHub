document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
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

    // Show Login Modal
    loginBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));

    // Show Register Modal
    registerBtn.addEventListener('click', () => registerModal.classList.remove('hidden'));

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

    // Add logout functionality
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.reload();
    });
});
