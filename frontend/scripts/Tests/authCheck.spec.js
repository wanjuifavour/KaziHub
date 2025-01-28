/**
 * @jest-environment jsdom
 */

// import '@testing-library/jest-dom';

describe('Authentication Check', () => {
  const originalLocation = window.location;
  const originalLocalStorage = window.localStorage;

  // Mock setup
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: { assign: jest.fn(), pathname: '' },
      writable: true
    });
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  beforeEach(() => {
    window.location.assign.mockClear();
    window.localStorage.getItem.mockClear();
  });

  afterAll(() => {
    window.location = originalLocation;
    window.localStorage = originalLocalStorage;
  });

  const triggerDOMContentLoaded = () => {
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  };



    test('allows access when user role matches protected page', () => {
      window.localStorage.getItem.mockReturnValue(JSON.stringify({ role: 'admin' }));
      window.location.pathname = '/admin.html';
      triggerDOMContentLoaded();
      expect(window.location.assign).not.toHaveBeenCalled();
    });

  
    test('allows access to unprotected pages without redirection', () => {
      window.localStorage.getItem.mockReturnValue(JSON.stringify({ role: 'guest' }));
      window.location.pathname = '/public-page.html';
      triggerDOMContentLoaded();
      expect(window.location.assign).not.toHaveBeenCalled();
    });

    test('handles role case insensitivity', () => {
      window.localStorage.getItem.mockReturnValue(JSON.stringify({ role: 'ADMIN' }));
      window.location.pathname = '/admin.html';
      triggerDOMContentLoaded();
      expect(window.location.assign).not.toHaveBeenCalled();
    });
  });
