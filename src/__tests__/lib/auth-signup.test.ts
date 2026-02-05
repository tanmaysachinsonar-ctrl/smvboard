/**
 * Tests für auth.ts - signUp Funktion
 * Test ob Organisation wiederverwendet wird
 */

import { signUp } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabaseClient';

// Mock dependencies
jest.mock('../../lib/prisma', () => ({
  prisma: {
    organization: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}));

describe('signUp', () => {
  const mockAuthUser = {
    id: 'auth-user-1',
    email: 'test@example.com',
  };

  const mockOrg = {
    id: 'org-1',
    name: 'Test Organization',
    createdAt: new Date(),
  };

  const mockUser = {
    id: 'auth-user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'OWNER',
    orgId: 'org-1',
    provider: 'email',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sollte neue Organisation erstellen wenn sie nicht existiert', async () => {
    // Supabase signup erfolgreich
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    // Organisation existiert nicht
    (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);

    // Organisation wird erstellt
    (prisma.organization.create as jest.Mock).mockResolvedValue(mockOrg);

    // User wird erstellt
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    // Audit Log wird erstellt
    (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

    const result = await signUp(
      'test@example.com',
      'password123',
      'Test User',
      'Test Organization'
    );

    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          equals: 'Test Organization',
          mode: 'insensitive',
        },
      },
    });

    expect(prisma.organization.create).toHaveBeenCalledWith({
      data: { name: 'Test Organization' },
    });

    expect(result.org).toEqual(mockOrg);
    expect(result.user).toEqual(mockUser);
  });

  it('sollte existierende Organisation wiederverwenden', async () => {
    // Supabase signup erfolgreich
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    // Organisation existiert bereits
    (prisma.organization.findFirst as jest.Mock).mockResolvedValue(mockOrg);

    // User wird erstellt
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    // Audit Log wird erstellt
    (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

    const result = await signUp(
      'test@example.com',
      'password123',
      'Test User',
      'Test Organization'
    );

    // Organisation sollte NICHT erstellt werden
    expect(prisma.organization.create).not.toHaveBeenCalled();

    // Bestehende Organisation sollte verwendet werden
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        id: mockAuthUser.id,
        email: 'test@example.com',
        name: 'Test User',
        role: 'OWNER',
        orgId: mockOrg.id,
        provider: 'email',
      },
    });

    expect(result.org).toEqual(mockOrg);
  });

  it('sollte Organisation case-insensitive finden', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    (prisma.organization.findFirst as jest.Mock).mockResolvedValue(mockOrg);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
    (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

    await signUp('test@example.com', 'password123', 'Test User', 'test organization');

    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          equals: 'test organization',
          mode: 'insensitive',
        },
      },
    });
  });

  it('sollte Whitespace aus Organisation-Namen entfernen', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.organization.create as jest.Mock).mockResolvedValue(mockOrg);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
    (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

    await signUp('test@example.com', 'password123', 'Test User', '  Test Organization  ');

    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          equals: 'Test Organization',
          mode: 'insensitive',
        },
      },
    });
  });

  it('sollte Fehler werfen wenn Supabase signup fehlschlägt', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Email already exists' },
    });

    await expect(
      signUp('test@example.com', 'password123', 'Test User', 'Test Organization')
    ).rejects.toThrow('Email already exists');

    expect(prisma.organization.findFirst).not.toHaveBeenCalled();
    expect(prisma.organization.create).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('sollte Audit Log mit korrekten Daten erstellen', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    (prisma.organization.findFirst as jest.Mock).mockResolvedValue(mockOrg);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
    (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

    await signUp('test@example.com', 'password123', 'Test User', 'Test Organization');

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        orgId: mockOrg.id,
        userId: mockUser.id,
        action: 'USER_REGISTERED',
        meta: {
          email: 'test@example.com',
          orgName: 'Test Organization',
        },
      },
    });
  });
});
