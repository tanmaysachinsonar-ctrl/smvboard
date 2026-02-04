import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest, logAudit } from '../../../lib/apiMiddleware';
import { createTransactionSchema } from '../../../lib/validationSchemas';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { orgId, user } = req;

  if (req.method === 'GET') {
    try {
      const { accountId, type, startDate, endDate, limit = '50' } = req.query;

      const where: any = { orgId };

      if (accountId && typeof accountId === 'string') {
        where.accountId = accountId;
      }

      if (type && typeof type === 'string') {
        where.type = type;
      }

      if (startDate && typeof startDate === 'string') {
        where.date = { ...where.date, gte: new Date(startDate) };
      }

      if (endDate && typeof endDate === 'string') {
        where.date = { ...where.date, lte: new Date(endDate) };
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          account: true,
          category: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { date: 'desc' },
        take: parseInt(limit as string),
      });

      return res.status(200).json(transactions);
    } catch (error) {
      console.error('GET /api/v1/transactions error:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = createTransactionSchema.parse(req.body);

      // Verify account belongs to org
      const account = await prisma.account.findFirst({
        where: { id: validatedData.accountId, orgId },
      });

      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          ...validatedData,
          date: new Date(validatedData.date),
          orgId,
          createdById: user.id,
        },
        include: {
          account: true,
          category: true,
        },
      });

      // Update account balance
      const amountChange =
        validatedData.type === 'INCOME' ? validatedData.amount : -validatedData.amount;
      await prisma.account.update({
        where: { id: validatedData.accountId },
        data: { balance: { increment: amountChange } },
      });

      // Log audit
      await logAudit(orgId, user.id, 'TRANSACTION_CREATED', {
        transactionId: transaction.id,
        amount: validatedData.amount,
        type: validatedData.type,
      });

      return res.status(201).json(transaction);
    } catch (error: any) {
      console.error('POST /api/v1/transactions error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withAuth(handler, { requiredRole: 'MEMBER' });
