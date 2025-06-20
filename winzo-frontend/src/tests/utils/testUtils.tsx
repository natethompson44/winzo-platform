import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Create a custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data generators
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  wallet_balance: 100.00,
  role: 'user',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockAdminUser = {
  ...mockUser,
  role: 'admin',
  username: 'adminuser',
};

export const mockSportsEvent = {
  id: '1',
  sport_key: 'americanfootball_nfl',
  sport_title: 'NFL',
  commence_time: '2024-01-15T20:00:00Z',
  home_team: 'Kansas City Chiefs',
  away_team: 'Buffalo Bills',
  bookmakers: [
    {
      key: 'draftkings',
      title: 'DraftKings',
      markets: [
        {
          key: 'h2h',
          outcomes: [
            { name: 'Kansas City Chiefs', price: -110 },
            { name: 'Buffalo Bills', price: -110 }
          ]
        },
        {
          key: 'spreads',
          outcomes: [
            { name: 'Kansas City Chiefs', price: -110, point: -3.5 },
            { name: 'Buffalo Bills', price: -110, point: 3.5 }
          ]
        },
        {
          key: 'totals',
          outcomes: [
            { name: 'Over', price: -110, point: 47.5 },
            { name: 'Under', price: -110, point: 47.5 }
          ]
        }
      ]
    }
  ]
};

export const mockBet = {
  id: 1,
  user_id: 1,
  event_id: '1',
  selected_team: 'Kansas City Chiefs',
  bet_type: 'h2h',
  odds: -110,
  stake: 10.00,
  potential_payout: 19.09,
  status: 'pending',
  placed_at: '2024-01-10T15:30:00Z',
};

export const mockTransaction = {
  id: 1,
  user_id: 1,
  type: 'deposit',
  amount: 50.00,
  status: 'completed',
  created_at: '2024-01-10T10:00:00Z',
};

// Utility functions for testing
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const mockFetch = (data: any, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
  });
};

export const mockAuthToken = 'mock-jwt-token';

export const mockApiResponse = (data: any, success = true) => ({
  success,
  data,
  message: success ? 'Operation successful' : 'Operation failed',
});

// Viewport utilities for responsive testing
export const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

export const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  large: { width: 1440, height: 900 },
};

// CSS Variables testing utilities
export const getCSSVariable = (element: HTMLElement, variable: string) => {
  return getComputedStyle(element).getPropertyValue(variable);
};

export const setCSSVariable = (variable: string, value: string) => {
  document.documentElement.style.setProperty(variable, value);
};

// Accessibility testing utilities
export const checkA11y = async (container: HTMLElement) => {
  // Basic accessibility checks
  const buttons = container.querySelectorAll('button');
  const links = container.querySelectorAll('a');
  const inputs = container.querySelectorAll('input');
  const images = container.querySelectorAll('img');

  // Check buttons have accessible names
  buttons.forEach(button => {
    const hasAccessibleName = 
      button.getAttribute('aria-label') ||
      button.getAttribute('aria-labelledby') ||
      button.textContent?.trim();
    if (!hasAccessibleName) {
      throw new Error('Button missing accessible name');
    }
  });

  // Check links have accessible names
  links.forEach(link => {
    const hasAccessibleName = 
      link.getAttribute('aria-label') ||
      link.getAttribute('aria-labelledby') ||
      link.textContent?.trim();
    if (!hasAccessibleName) {
      throw new Error('Link missing accessible name');
    }
  });

  // Check inputs have labels
  inputs.forEach(input => {
    const hasLabel = 
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      container.querySelector(`label[for="${input.id}"]`);
    if (!hasLabel) {
      throw new Error('Input missing label');
    }
  });

  // Check images have alt text
  images.forEach(img => {
    if (!img.getAttribute('alt')) {
      throw new Error('Image missing alt text');
    }
  });
};

// Performance testing utilities
export const measureRenderTime = (renderFunction: () => void) => {
  const start = performance.now();
  renderFunction();
  const end = performance.now();
  return end - start;
};

// Form testing utilities
export const fillForm = async (form: HTMLFormElement, data: Record<string, string>) => {
  const { fireEvent } = await import('@testing-library/react');
  
  Object.entries(data).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      fireEvent.change(input, { target: { value } });
    }
  });
};

// API mocking utilities
export const createApiMock = (baseUrl = 'http://localhost:5000') => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
});

// Error boundary testing utility
export const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Re-export everything from testing-library/react
export * from '@testing-library/react';

// Override render method
export { customRender as render }; 