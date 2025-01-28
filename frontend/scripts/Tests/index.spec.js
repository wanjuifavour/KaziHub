/**
 * @jest-environment jsdom
 */

describe("Authentication Module", () => {
  const originalLocation = window.location;
  let mockHref = "";
  let mockReload = jest.fn();

  beforeAll(() => {
    // Mock localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key]),
        setItem: jest.fn((key, value) => {
          store[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        }),
      };
    })();

    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        get href() {
          return mockHref;
        },
        set href(value) {
          mockHref = value;
        },
        reload: mockReload,
      },
      writable: true,
    });
  });

  beforeEach(() => {
    // Reset mocks and DOM
    mockHref = "";
    mockReload.mockClear();
    window.localStorage.clear();
    document.body.innerHTML = `
        <button id="loginBtn">Login</button>
        <button id="registerBtn">Register</button>
        <button id="logoutBtn">Logout</button>
        
        <div id="loginModal" class="hidden">
          <span class="close" data-target="loginModal"></span>
        </div>
        
        <div id="registerModal" class="hidden">
          <span class="close" data-target="registerModal"></span>
        </div>
      `;
  });

  afterAll(() => {
    Object.defineProperty(window, "location", { value: originalLocation });
  });

  const triggerDOMContentLoaded = () => {
    document.dispatchEvent(new Event("DOMContentLoaded"));
  };

  describe("User Redirection", () => {
 
     test("does not redirect when no user is logged in", () => {
      triggerDOMContentLoaded();
      expect(window.location.href).toBe("");
    });
  });



  describe("Logout Functionality", () => {
 
    test("does not throw error when logout button is missing", () => {
      document.getElementById("logoutBtn").remove();
      expect(() => {
        triggerDOMContentLoaded();
      }).not.toThrow();
    });
  });
});
