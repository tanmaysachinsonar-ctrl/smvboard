import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest, logAudit } from '../../../lib/apiMiddleware';
import { createMemberSchema } from '../../../lib/validationSchemas';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { orgId, user } = req;

  if (req.method === 'GET') {
    try {
      const members = await prisma.member.findMany({
        where: { orgId },
        orderBy: { name: 'asc' },
      });

      return res.status(200).json(members);
    } catch (error) {
      console.error('GET /api/v1/members error:', error);
      return res.status(500).json({ error: 'Failed to fetch members' });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = createMemberSchema.parse(req.body);

      const member = await prisma.member.create({
        data: {
          ...validatedData,
          orgId,
        },
      });

      await logAudit(orgId, user.id, 'MEMBER_CREATED', {
        memberId: member.id,
        name: member.name,
      });

      return res.status(201).json(member);
    } catch (error: any) {
      console.error('POST /api/v1/members error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Failed to create member' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withAuth(handler, { requiredRole: 'MEMBER' });
