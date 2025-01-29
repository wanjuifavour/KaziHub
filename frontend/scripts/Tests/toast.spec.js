import { jest } from '@jest/globals';
import showToast from '../toast.js';

describe('showToast', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        document.body.appendChild(toastContainer);
        jest.useFakeTimers();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.useRealTimers();
    });

    test('creates a toast with default type', () => {
        showToast('Test message');
        const toast = document.querySelector('.toast');
        expect(toast).toBeTruthy();
        expect(toast.textContent).toBe('Test message');
        expect(toast.classList.contains('info')).toBeTruthy();
    });

    test('creates a toast with specified type', () => {
        showToast('Success message', 'success');
        const toast = document.querySelector('.toast');
        expect(toast.classList.contains('success')).toBeTruthy();
    });

    test('removes toast after timeout', () => {
        showToast('Test message');
        const toast = document.querySelector('.toast');
        expect(toast).toBeTruthy();
        
        jest.advanceTimersByTime(10000);
        expect(document.querySelector('.toast')).toBeNull();
    });

    test('creates toast container if not exists', () => {
        const existingContainer = document.getElementById('toastContainer');
        if (existingContainer) {
            existingContainer.remove();
        }
    
        expect(document.getElementById('toastContainer')).toBeNull();
        
        showToast('Test message');
        
        const container = document.getElementById('toastContainer');
        expect(container).toBeTruthy();
        
        const toast = container.querySelector('.toast');
        expect(toast).toBeTruthy();
        expect(toast.textContent).toBe('Test message');
    });

    test('handles multiple toast messages', () => {
        showToast('First message');
        showToast('Second message');
        const toasts = document.querySelectorAll('.toast');
        expect(toasts.length).toBe(2);
    });
});