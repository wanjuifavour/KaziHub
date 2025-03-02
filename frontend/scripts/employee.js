import showToast from './toast.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get logged in user first
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.replace('./index.html');
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    const profileCard = document.getElementById('updateProfileCard');
    const chatCard = document.getElementById('chatCard');
    const updateModal = document.getElementById('updateModal');
    
    logoutBtn.addEventListener('click', handleLogout);
    profileCard.addEventListener('click', handleProfileCardClick);
    chatCard.addEventListener('click', handleChatCardClick);
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('updateForm').addEventListener('submit', handleFormSubmit);

    let employee = await fetchEmployeeData(user.email);
    updateProfileStatus(employee);

    function handleLogout() {
        localStorage.removeItem('user');
        window.location.replace('./index.html');
    }

    function handleProfileCardClick() {
        updateModal.style.display = 'flex';
        if (employee) {
            document.getElementById('updateProfilePic').value = employee.profilePic || '';
            document.getElementById('updateDepartment').value = employee.department || 'Unassigned';
            document.getElementById('updatePosition').value = employee.position || '';
            document.getElementById('updatePhone').value = employee.phoneNumber || '';
        }
    }

    function handleChatCardClick() {
        window.location.href = './chat.html';
    }

    function closeModal() {
        updateModal.style.display = 'none';
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        if (!employee) {
            showToast('Employee profile not found. Please try logging in again.', 'error');
            return;
        }
        
        const formData = getFormData();
        
        try {
            showToast('Updating profile...', 'info');
            await updateEmployee(employee.id, formData);
            showToast('Profile updated successfully!', 'success');
            closeModal();
            setTimeout(() => window.location.reload(), 300000);
        } catch (error) {
            showToast(error.message || 'Update failed', 'error');
        }
    }

    async function fetchEmployeeData(email) {
        try {
            const response = await fetch(`http://localhost:8500/api/employees?email=${email}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            
            if (!data.length) {
                const newEmployee = {
                    email,
                    name: user.name,
                    department: 'Unassigned',
                    profilePic: '',
                    position: '',
                    phoneNumber: ''
                };
                const createRes = await fetch('http://localhost:8500/api/employees', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newEmployee)
                });
                if (!createRes.ok) throw new Error('Failed to create employee record');
                return await createRes.json();
            }
            
            return data[0];
        } catch (error) {
            showToast(error.message, 'error');
            return null;
        }
    }

    function updateProfileStatus(employee) {
        const isComplete = employee && 
            employee.profilePic &&
            employee.department !== 'Unassigned' &&
            employee.position &&
            employee.phoneNumber;

        profileCard.classList.toggle('profile-complete', isComplete);
        profileCard.classList.toggle('profile-incomplete', !isComplete);
        profileCard.querySelector('.status-text').textContent = isComplete 
            ? 'Profile complete' 
            : 'Profile incomplete - Click to complete';
    }

    function getFormData() {
        return {
            profilePic: document.getElementById('updateProfilePic').value.trim(),
            department: document.getElementById('updateDepartment').value,
            position: document.getElementById('updatePosition').value.trim(),
            phoneNumber: document.getElementById('updatePhone').value.trim()
        };
    }

    async function updateEmployee(id, data) {
        const response = await fetch(`http://localhost:8500/api/employees/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Update failed');
        return response.json();
    }
});