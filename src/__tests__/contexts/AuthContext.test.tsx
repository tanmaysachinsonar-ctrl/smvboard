import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import React from 'react';
import { supabase } from '../../lib/supabaseClient';

// Mock the auth module
jest.mock('../../lib/auth', () => ({
  getSession: jest.fn(),
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Supabase client
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
}));

import { getSession, signIn, signOut } from '../../lib/auth';

// Test component that uses the hook
function TestComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <div>Logged in as: {user.email}</div>
      <div>Role: {user.role}</div>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide null user initially when not authenticated', async () => {
    // Mock Supabase auth to return no session
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should show loading first
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Then show not logged in
    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });

  it('should provide user data when authenticated', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
    };

    const mockPrismaUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'OWNER',
      orgId: 'org123',
    };

    // Mock Supabase auth to return a session with user
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
          access_token: 'mock-token',
        },
      },
      error: null,
    });

    // Mock fetch to return user data from /api/v1/me
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPrismaUser),
      })
    ) as jest.Mock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Logged in as: test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Role: OWNER')).toBeInTheDocument();
    });
  });

  it('should handle sign in', async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    (signIn as jest.Mock).mockResolvedValue(undefined);

    function SignInTestComponent() {
      const { signIn: signInFn } = useAuth();

      return <button onClick={() => signInFn('test@example.com', 'password')}>Sign In</button>;
    }

    render(
      <AuthProvider>
        <SignInTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  it('should handle sign out', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'OWNER',
        orgId: 'org123',
      },
      accessToken: 'mock-token',
    };

    (getSession as jest.Mock).mockResolvedValue(mockSession);
    (signOut as jest.Mock).mockResolvedValue(undefined);

    function SignOutTestComponent() {
      const { signOut: signOutFn } = useAuth();

      return <button onClick={() => signOutFn()}>Sign Out</button>;
    }

    render(
      <AuthProvider>
        <SignOutTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      function BadComponent() {
        useAuth();
        return null;
      }
      render(<BadComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
