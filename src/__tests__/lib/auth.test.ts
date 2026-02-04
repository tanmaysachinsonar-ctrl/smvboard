// Mock modules before imports
const mockGetSession = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockUserFindUnique = jest.fn();
const mockUserCreate = jest.fn();
const mockOrganizationCreate = jest.fn();

jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      signInWithPassword: (creds: any) => mockSignInWithPassword(creds),
      signUp: (creds: any) => mockSignUp(creds),
      signOut: () => mockSignOut(),
    },
  },
}));

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (args: any) => mockUserFindUnique(args),
      create: (args: any) => mockUserCreate(args),
    },
    organization: {
      create: (args: any) => mockOrganizationCreate(args),
    },
  },
}));

import { signIn, signUp, signOut, getSession } from '../../lib/auth';

describe('auth.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSession', () => {
    it('should return null if no session exists', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const session = await getSession();
      expect(session).toBeNull();
    });

    it('should return session with user data when authenticated', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'OWNER',
        orgId: 'org123',
      };

      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { email: 'test@example.com' },
            access_token: 'mock-token',
          },
        },
        error: null,
      });

      mockUserFindUnique.mockResolvedValue({
        ...mockUser,
        org: { id: 'org123', name: 'Test Org' },
      });

      const session = await getSession();

      expect(session).not.toBeNull();
      expect(session?.user.email).toBe('test@example.com');
      expect(session?.user.orgId).toBe('org123');
    });
  });

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { email: 'test@example.com' }, session: {} },
        error: null,
      });

      await signIn('test@example.com', 'password123');

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error with invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(signIn('wrong@example.com', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should create user and organization', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: 'user123', email: 'new@example.com' }, session: null },
        error: null,
      });

      mockOrganizationCreate.mockResolvedValue({
        id: 'org123',
        name: 'New Org',
      });

      mockUserCreate.mockResolvedValue({
        id: 'user123',
        email: 'new@example.com',
        name: 'New User',
        role: 'OWNER',
        orgId: 'org123',
      });

      await signUp('new@example.com', 'password123', 'New User', 'New Org');

      expect(mockSignUp).toHaveBeenCalled();
      expect(mockOrganizationCreate).toHaveBeenCalled();
      expect(mockUserCreate).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      });

      await expect(signUp('existing@example.com', 'password123', 'User', 'Org')).rejects.toThrow(
        'User already registered'
      );
    });
  });

  describe('signOut', () => {
    it('should call supabase signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      await signOut();

      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
