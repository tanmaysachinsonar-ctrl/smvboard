import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { prisma } from './prisma';

// Define types locally instead of importing from Prisma
type Role = 'OWNER' | 'MEMBER' | 'VIEWER';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  orgId: string;
  createdAt: Date;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export interface AuthenticatedRequest extends NextApiRequest {
  user: User;
  orgId: string;
}

/**
 * Middleware to verify authentication and attach user/org context
 */
export async function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void | NextApiResponse<any>>,
  options: { requiredRole?: Role } = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get token from Authorization header
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
      }

      // Verify token with Supabase
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

      if (error || !authUser) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }

      // Fetch user from database
      let user = await prisma.user.findUnique({
        where: { email: authUser.email! },
        include: { org: true },
      });

      // Auto-create user if doesn't exist in DB (Supabase-only user)
      if (!user) {
        console.log(`User ${authUser.email} exists in Supabase but not in DB - creating...`);
        
        // Create default organization for this user
        const org = await prisma.organization.create({
          data: {
            name: authUser.user_metadata?.orgName || `${authUser.email}'s Organization`,
          },
        });

        // Create user in database
        user = await prisma.user.create({
          data: {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
            role: 'OWNER',
            orgId: org.id,
            provider: 'email',
          },
          include: { org: true },
        });

        console.log(`Auto-created user ${user.email} with org ${org.name}`);
      }

      // Check role if required
      if (options.requiredRole) {
        const roleHierarchy: Record<Role, number> = {
          OWNER: 3,
          MEMBER: 2,
          VIEWER: 1,
        };

        if (roleHierarchy[user.role as Role] < roleHierarchy[options.requiredRole]) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      // Attach user and orgId to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        orgId: user.orgId,
        createdAt: user.createdAt,
      };
      authenticatedReq.orgId = user.orgId;

      return await handler(authenticatedReq, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Validate request body against Zod schema
 */
export function withValidation<T>(
  schema: { parse: (data: unknown) => T },
  handler: (req: NextApiRequest & { validatedBody: T }, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const validatedBody = schema.parse(req.body);
      const extendedReq = req as NextApiRequest & { validatedBody: T };
      extendedReq.validatedBody = validatedBody;
      return await handler(extendedReq, res);
    } catch (error: any) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors || error.message 
      });
    }
  };
}

/**
 * Log action to audit log
 */
export async function logAudit(
  orgId: string,
  userId: string | null,
  action: string,
  meta?: Record<string, any>
) {
  await prisma.auditLog.create({
    data: {
      orgId,
      userId,
      action,
      meta: meta || {},
    },
  });
}

/**
 * Rate limiting helper (simple in-memory store - use Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const identifier = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const key = `${identifier}:${req.url}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    record.count++;
    return next();
  };
}
