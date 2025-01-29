import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
jest.mock('../employee.js');

// Mock the toast module
jest.mock('../toast.js', () => ({
    __esModule: true,
    default: jest.fn()
}));

describe('Employee Page Tests', () => {
    let mockStorage;
    let fetchSpy;

    beforeEach(() => {
        // Clear mocks between tests
        jest.clearAllMocks();
        
        document.body.innerHTML = `
            <div id="updateModal" style="display: none;">
                <form id="updateForm">
                    <input id="updateProfilePic" type="text" />
                    <select id="updateDepartment">
                        <option value="Unassigned">Unassigned</option>
                        <option value="HR">HR</option>
                    </select>
                    <input id="updatePosition" type="text" />
                    <input id="updatePhone" type="text" />
                    <button type="submit">Update</button>
                </form>
                <span class="close"></span>
            </div>
            <button id="logoutBtn">Logout</button>
            <div id="updateProfileCard">
                <span class="status-text"></span>
            </div>
            <div id="chatCard"></div>
        `;

        // Setup localStorage mock properly
        mockStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockStorage,
            writable: true
        });

        // Mock fetch properly
        fetchSpy = jest.fn();
        global.fetch = fetchSpy;

        // Mock location properly
        delete window.location;
        window.location = {
            replace: jest.fn(),
            href: '',
            reload: jest.fn()
        };

        // Set default user mock data
        mockStorage.getItem.mockImplementation((key) => {
            if (key === 'user') {
                return JSON.stringify({
                    email: 'test@example.com',
                    name: 'Test User'
                });
            }
            return null;
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
        document.body.innerHTML = '';
    });

    test('redirects to login if no user is logged in', () => {
        mockStorage.getItem.mockReturnValue(null);
        const fetchEmployeeData = require('../employee.js').fetchEmployeeData;
        document.addEventListener('DOMContentLoaded', fetchEmployeeData);
        document.dispatchEvent(new Event('DOMContentLoaded'));
        expect(window.location.replace).toHaveBeenCalledWith('./index.html');
    });

    test('fetches employee data on load', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([{
                id: 1,
                email: 'test@example.com',
                department: 'HR',
                position: 'Manager'
            }])
        });

        document.dispatchEvent(new Event('DOMContentLoaded'));

        await new Promise(process.nextTick);

        expect(fetchSpy).toHaveBeenCalledWith(
            'http://localhost:8500/api/employees?email=test@example.com'
        );
    });

    test('creates new employee if none exists', async () => {
        // Mock initial fetch returning empty array
        fetchSpy
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([])
            })
            // Mock create employee request
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 1, email: 'test@example.com' })
            });

        document.dispatchEvent(new Event('DOMContentLoaded'));

        await new Promise(process.nextTick);

        expect(fetchSpy).toHaveBeenCalledWith(
            'http://localhost:8500/api/employees',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
        );
    });

    test('opens update modal with employee data', async () => {
        // Mock the fetch response properly
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([{
                id: 1,
                profilePic: 'pic.jpg',
                department: 'HR',
                position: 'Manager',
                phoneNumber: '1234567890'
            }])
        });

        // Load the page
        document.dispatchEvent(new Event('DOMContentLoaded'));
        await new Promise(process.nextTick);

        // Trigger modal open
        const profileCard = document.getElementById('updateProfileCard');
        fireEvent.click(profileCard);

        // Verify modal state
        expect(document.getElementById('updateModal').style.display).toBe('flex');
        expect(document.getElementById('updateProfilePic').value).toBe('pic.jpg');
        expect(document.getElementById('updateDepartment').value).toBe('HR');
        expect(document.getElementById('updatePosition').value).toBe('Manager');
        expect(document.getElementById('updatePhone').value).toBe('1234567890');
    });

    test('submits profile update successfully', async () => {
        fetchSpy
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([{ id: 1 }])
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });
    
        document.dispatchEvent(new Event('DOMContentLoaded'));
        await new Promise(process.nextTick);
    
        const form = document.getElementById('updateForm');
        fireEvent.submit(form);
    
        // Wait for all asynchronous operations to complete
        await new Promise(resolve => setTimeout(resolve, 0));
    
        expect(fetchSpy).toHaveBeenCalledWith(
            'http://localhost:8500/api/employees/1',
            expect.objectContaining({
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            })
        );
    });

    test('handles logout correctly', () => {
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const logoutBtn = document.getElementById('logoutBtn');
        fireEvent.click(logoutBtn);

        expect(mockStorage.removeItem).toHaveBeenCalledWith('user');
        expect(window.location.replace).toHaveBeenCalledWith('./index.html');
    });

    test('navigates to chat page', () => {
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const chatCard = document.getElementById('chatCard');
        fireEvent.click(chatCard);

        expect(window.location.href).toBe('./chat.html');
    });

    test('updates profile status correctly', async () => {
        // Test incomplete profile
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([{
                id: 1,
                department: 'Unassigned',
                position: '',
                phoneNumber: ''
            }])
        });

        document.dispatchEvent(new Event('DOMContentLoaded'));
        await new Promise(process.nextTick);

        const profileCard = document.getElementById('updateProfileCard');
        expect(profileCard.classList.contains('profile-incomplete')).toBe(true);
        expect(profileCard.querySelector('.status-text').textContent)
            .toBe('Profile incomplete - Click to complete');

        // Test complete profile
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([{
                id: 1,
                profilePic: 'pic.jpg',
                department: 'HR',
                position: 'Manager',
                phoneNumber: '1234567890'
            }])
        });

        document.dispatchEvent(new Event('DOMContentLoaded'));
        await new Promise(process.nextTick);

        expect(profileCard.classList.contains('profile-complete')).toBe(true);
        expect(profileCard.querySelector('.status-text').textContent)
            .toBe('Profile complete');
    });
});