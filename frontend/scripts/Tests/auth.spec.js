import { jest } from "@jest/globals";

// Mock the toast module
jest.mock("../toast.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

// Mock DOM elements
document.getElementById = jest.fn();
document.querySelector = jest.fn();
document.addEventListener = jest.fn();

describe("Authentication System", () => {
  let mockLoginForm;
  let mockRegisterForm;
  let mockForgotPasswordForm;
  let mockResetPasswordForm;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock forms and elements
    mockLoginForm = {
      addEventListener: jest.fn(),
      querySelector: jest.fn().mockReturnValue({
        disabled: false,
        textContent: "Login",
      }),
    };

    mockRegisterForm = {
      addEventListener: jest.fn(),
      querySelector: jest.fn().mockReturnValue({
        disabled: false,
        textContent: "Register",
      }),
    };

    // Setup mock DOM elements
    document.getElementById.mockImplementation((id) => {
      const elements = {
        loginForm: mockLoginForm,
        registerForm: mockRegisterForm,
        loginEmail: { value: "test@example.com" },
        loginPassword: { value: "password123" },
        userName: { value: "Test User" },
        regEmail: { value: "newuser@example.com" },
        regPassword: { value: "newpass123" },
        role: { value: "employee" },
        loginModal: { classList: { add: jest.fn(), remove: jest.fn() } },
        registerModal: { classList: { add: jest.fn(), remove: jest.fn() } },
      };
      return elements[id];
    });
  });

  describe("Login Functionality", () => {
    test("should handle successful login", async () => {
      const mockUser = {
        email: "test@example.com",
        name: "Test User",
        role: "employee",
      };

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve([mockUser]),
        })
      );

      // Trigger login form submission
      const submitEvent = { preventDefault: jest.fn() };
      await mockLoginForm.addEventListener.mock.calls[0][1](submitEvent);

      expect(submitEvent.preventDefault).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockUser)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users?email=test%40example.com")
      );
    });

    test("should handle invalid credentials", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve([]),
        })
      );

      const submitEvent = { preventDefault: jest.fn() };
      await mockLoginForm.addEventListener.mock.calls[0][1](submitEvent);

      expect(submitEvent.preventDefault).toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });


});
