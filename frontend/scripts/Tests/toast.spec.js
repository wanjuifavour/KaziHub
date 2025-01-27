import { jest } from '@jest/globals';
import showToast from './toast';

describe('showToast', () => {
    beforeEach(() => {
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
        
        jest.advanceTimersByTime(3000);
        expect(document.querySelector('.toast')).toBeNull();
    });

    test('creates toast container if not exists', () => {
        document.body.innerHTML = '';
        showToast('Test message');
        expect(document.getElementById('toastContainer')).toBeTruthy();
    });

    test('handles multiple toast messages', () => {
        showToast('First message');
        showToast('Second message');
        const toasts = document.querySelectorAll('.toast');
        expect(toasts.length).toBe(2);
    });
});