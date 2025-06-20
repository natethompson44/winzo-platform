import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import { mockUser, mockApiResponse, mockAuthToken } from '../utils/testUtils';
import Login from '../../pages/Login';
import Register from '../../pages/Register';

// Mock the API client
const mockApiClient = {
  post: jest.fn(),
  get: jest.fn(),
  getUserProfile: jest.fn(),
  healthCheck: jest.fn(),
};

jest.mock('../../utils/apiClient', () => ({
  default: mockApiClient,
}));

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Login Flow', () => {
    test('successful login redirects to dashboard', async () => {
      mockApiClient.post.mockResolvedValueOnce(mockApiResponse({
        user: mockUser,
        token: mockAuthToken
      }));

      render(<Login />);

      // Fill in login form
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
          username: 'testuser',
          password: 'password123'
        });
      });

      // Check that auth token is stored
      expect(localStorage.getItem('authToken')).toBe(mockAuthToken);
    });

    test('login with invalid credentials shows error', async () => {
      const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
      mockPost.mockRejectedValueOnce({
        response: {
          data: mockApiResponse(null, false, 'Invalid credentials')
        }
      });

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      expect(localStorage.getItem('authToken')).toBeNull();
    });

    test('login form validation works', async () => {
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test('handles network errors gracefully', async () => {
      const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
      mockPost.mockRejectedValueOnce(new Error('Network error'));

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Registration Flow', () => {
    test('successful registration creates account and logs in', async () => {
      const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
      mockPost.mockResolvedValueOnce({
        data: mockApiResponse({
          user: mockUser,
          token: mockAuthToken
        })
      });

      render(<Register />);

      // Fill in registration form
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const inviteCodeInput = screen.getByLabelText(/invite code/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.change(inviteCodeInput, { target: { value: 'WINZO2024' } });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/auth/register', {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          invite_code: 'WINZO2024'
        });
      });

      expect(localStorage.getItem('authToken')).toBe(mockAuthToken);
    });

    test('registration with existing username shows error', async () => {
      const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
      mockPost.mockRejectedValueOnce({
        response: {
          data: mockApiResponse(null, false, 'Username already taken')
        }
      });

      render(<Register />);

      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username already taken/i)).toBeInTheDocument();
      });
    });

    test('password confirmation validation works', async () => {
      render(<Register />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test('email validation works', async () => {
      render(<Register />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    test('password strength validation works', async () => {
      render(<Register />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication State Management', () => {
    test('persists authentication state across page refreshes', async () => {
      // Set up existing auth token
      localStorage.setItem('authToken', mockAuthToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
      mockGet.mockResolvedValueOnce({
        data: mockApiResponse(mockUser)
      });

      render(<Login />);

      await waitFor(() => {
        // Should skip login form if already authenticated
        expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
      });
    });

    test('clears authentication state on logout', async () => {
      localStorage.setItem('authToken', mockAuthToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(<Login />);

      // Simulate logout
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      });
    });

    test('handles expired tokens', async () => {
      localStorage.setItem('authToken', 'expired-token');

      const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
      mockGet.mockRejectedValueOnce({
        response: { status: 401 }
      });

      render(<Login />);

      await waitFor(() => {
        // Should clear expired token and show login form
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Accessibility', () => {
    test('login form has proper ARIA labels', () => {
      render(<Login />);

      expect(screen.getByLabelText(/username/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-required', 'true');
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Login form');
    });

    test('registration form has proper ARIA labels', () => {
      render(<Register />);

      expect(screen.getByLabelText(/username/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('aria-required', 'true');
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Registration form');
    });

    test('error messages are announced to screen readers', async () => {
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/username is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading state during login', async () => {
      const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
      mockPost.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      fireEvent.click(submitButton);

      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('shows loading state during registration', async () => {
      const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
      mockPost.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<Register />);

      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      fireEvent.click(submitButton);

      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
}); 