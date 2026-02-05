import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../lib/apiMiddleware';

// Validation schema for id parameter
const idSchema = z.string().cuid();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { orgId } = req;

  if (req.method === 'GET') {
    try {
      // Parse and validate id parameter
      const { id } = req.query;

      let accountId: string;
      try {
        accountId = idSchema.parse(id);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid account ID format' });
      }

      // Check if includeTransactions query param is present
      const includeTransactions = req.query.includeTransactions === 'true';

      // Fetch account
      const account = await prisma.account.findUnique({
        where: { id: accountId },
        include: {
          _count: {
            select: { transactions: true },
          },
          transactions: includeTransactions
            ? {
                take: 50,
                orderBy: { date: 'desc' },
                include: {
                  category: true,
                  createdBy: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              }
            : false,
        },
      });

      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Check org ownership
      if (account.orgId !== orgId) {
        return res
          .status(403)
          .json({ error: 'Access denied - Account belongs to different organization' });
      }

      return res.status(200).json({
        account,
        transactions: includeTransactions ? account.transactions : undefined,
      });
    } catch (error) {
      console.error('GET /api/v1/accounts/[id] error:', error);
      return res.status(500).json({ error: 'Failed to fetch account' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withAuth(handler, { requiredRole: 'MEMBER' });
