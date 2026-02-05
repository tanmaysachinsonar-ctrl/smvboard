import { supabase } from './supabaseClient';
import { prisma } from './prisma';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
    orgId: string;
  };
  accessToken: string;
}

/**
 * Get current session from Supabase
 */
export async function getSession(): Promise<AuthSession | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  // Fetch user from our database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { org: true },
  });

  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
      orgId: user.orgId,
    },
    accessToken: session.access_token,
  };
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, name: string, orgName: string) {
  // Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to create user');
  }

  // Normalize organization name (trim whitespace)
  const normalizedOrgName = orgName.trim();

  // Find or create organization (case-insensitive)
  let org = await prisma.organization.findFirst({
    where: {
      name: {
        equals: normalizedOrgName,
        mode: 'insensitive',
      },
    },
  });

  if (!org) {
    // Create new organization if it doesn't exist
    org = await prisma.organization.create({
      data: { name: normalizedOrgName },
    });
  }

  // Create user in our database
  const user = await prisma.user.create({
    data: {
      id: authData.user.id,
      email,
      name,
      role: 'OWNER',
      orgId: org.id,
      provider: 'email',
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      orgId: org.id,
      userId: user.id,
      action: 'USER_REGISTERED',
      meta: { email, orgName: normalizedOrgName },
    },
  });

  return { user, org };
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
}
