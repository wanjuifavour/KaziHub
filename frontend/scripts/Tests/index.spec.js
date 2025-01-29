/**
 * @jest-environment jsdom
 */

import '../index.js';

describe('Authentication Flow', () => {
    let originalLocation;

    beforeAll(() => {
        // Mock window.location
        delete window.location;
        window.location = {
            href: '',
            assign: jest.fn(),
            replace: jest.fn()
        };

        // Mock localStorage
        global.localStorage = {
            store: {},
            getItem(key) { return this.store[key] || null },
            setItem(key, value) { this.store[key] = value },
            removeItem(key) { delete this.store[key] },
            clear() { this.store = {} }
        };
    });

    beforeEach(() => {
        window.location.href = '';
        localStorage.clear();
        document.body.innerHTML = `
    <button id="loginBtn"></button>
    <button id="registerBtn"></button>
    <div id="loginModal" class="hidden"></div>
    <div id="registerModal" class="hidden"></div>
    <div id="forgotPasswordModal" class="hidden"></div>
    <a id="showForgotPassword"></a>
    <div class="close" data-target="loginModal"></div>
    `;
        require('../index');
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    describe('Redirect based on user role', () => {
        test('redirects admin to admin.html', () => {
            localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
            document.dispatchEvent(new Event('DOMContentLoaded'));
            expect(window.location.href).toBe('admin.html');
        });

        test('redirects manager to manager.html', () => {
            localStorage.setItem('user', JSON.stringify({ role: 'Manager' }));
            document.dispatchEvent(new Event('DOMContentLoaded'));
            expect(window.location.href).toBe('manager.html');
        });

        test('redirects employee to employee.html', () => {
            localStorage.setItem('user', JSON.stringify({ role: 'employee' }));
            document.dispatchEvent(new Event('DOMContentLoaded'));
            expect(window.location.href).toBe('employee.html');
        });

        test('does not redirect when no user is logged in', () => {
            localStorage.clear();
            document.dispatchEvent(new Event('DOMContentLoaded'));
            expect(localStorage.getItem('user')).toBe(null);
            expect(window.location.href).toBe('');
        });
    });

    describe('Modal interactions', () => {
        test('shows login modal when login button is clicked', () => {
            const loginBtn = document.getElementById('loginBtn');
            const loginModal = document.getElementById('loginModal');

            loginBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(loginModal.classList.contains('hidden')).toBe(false);
        });

        test('shows register modal when register button is clicked', () => {
            const registerBtn = document.getElementById('registerBtn');
            const registerModal = document.getElementById('registerModal');

            registerBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(registerModal.classList.contains('hidden')).toBe(false);
        });

        test('shows forgot password modal when link is clicked', () => {
            // Open login modal first
            document.getElementById('loginBtn').dispatchEvent(new MouseEvent('click'));

            const forgotPasswordLink = document.getElementById('showForgotPassword');
            forgotPasswordLink.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(document.getElementById('loginModal').classList.contains('hidden')).toBe(true);
            expect(document.getElementById('forgotPasswordModal').classList.contains('hidden')).toBe(false);
        });
    });

    describe('Event listeners', () => {
        test('registers all required event listeners', () => {
            const loginBtn = document.getElementById('loginBtn');
            const registerBtn = document.getElementById('registerBtn');

            // Verify clicks
            expect(() => {
                loginBtn.dispatchEvent(new MouseEvent('click'));
            }).not.toThrow();

            expect(() => {
                registerBtn.dispatchEvent(new MouseEvent('click'));
            }).not.toThrow();
        });
    });
});