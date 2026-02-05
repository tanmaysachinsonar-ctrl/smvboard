import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest, logAudit } from '../../../lib/apiMiddleware';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return res.status(200).json(req.user);
  }

  if (req.method === 'PUT') {
    try {
      const validatedData = updateUserSchema.parse(req.body);
      const { user, orgId } = req;

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: validatedData,
      });

      await logAudit(orgId, user.id, 'USER_UPDATED', {
        userId: user.id,
        changes: validatedData,
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      console.error('PUT /api/v1/me error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default withAuth(handler);
