import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest, logAudit } from '../../../lib/apiMiddleware';
import { createAccountSchema } from '../../../lib/validationSchemas';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { orgId, user } = req;

  if (req.method === 'GET') {
    try {
      const accounts = await prisma.account.findMany({
        where: { orgId },
        include: {
          _count: {
            select: { transactions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(accounts);
    } catch (error) {
      console.error('GET /api/v1/accounts error:', error);
      return res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = createAccountSchema.parse(req.body);

      const account = await prisma.account.create({
        data: {
          ...validatedData,
          orgId,
        },
      });

      await logAudit(orgId, user.id, 'ACCOUNT_CREATED', {
        accountId: account.id,
        name: account.name,
      });

      return res.status(201).json(account);
    } catch (error: any) {
      console.error('POST /api/v1/accounts error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Failed to create account' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withAuth(handler, { requiredRole: 'MEMBER' });
