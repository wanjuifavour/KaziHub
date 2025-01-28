document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const protectedPages = {
      'admin.html': ['admin'],
      'manager.html': ['manager'],
      'employee.html': ['employee', 'manager']
    };
  
    const currentPage = window.location.pathname.split('/').pop();
  
    // No user?  redirect
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
  
    if (protectedPages[currentPage]) {
      const allowedRoles = protectedPages[currentPage];
      const userRole = user.role.toLowerCase();
      
      if (!allowedRoles.includes(userRole)) {
        window.location.href = 'index.html';
      }
    }
  });