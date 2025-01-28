import showToast from '../toast';
describe('showToast', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="toastContainer"></div>';
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
      expect(toast.classList.contains('info')).toBe(true);
    });
  
    test('removes toast after timeout', () => {
      showToast('Test message');
      jest.advanceTimersByTime(10000); // Match the 10000ms timeout
      expect(document.querySelector('.toast')).toBeNull();
    });
 
    test('handles multiple toast messages', () => {
        showToast('First message');
        showToast('Second message');
        const toasts = document.querySelectorAll('.toast');
        expect(toasts.length).toBe(2);
    });
});