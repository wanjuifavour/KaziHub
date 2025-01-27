// document.addEventListener('DOMContentLoaded', () => {
//     const user = JSON.parse(localStorage.getItem('user'));
//     const protectedPages = {
//         'admin.html': ['admin'],
//         'manager.html': ['manager'],
//         'employee.html': ['employee', 'manager']
//     };

//     const currentPage = window.location.pathname.split('/').pop();

//     if (!user) {
//         window.location.href = 'index.html';
//         return;
//     }

//     if (!protectedPages[currentPage]?.includes(user.role.toLowerCase())) {
//         window.location.href = 'index.html';
//     }

// });