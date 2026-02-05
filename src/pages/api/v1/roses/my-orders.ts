import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/apiMiddleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  campaignId: z.string().cuid().optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
});

/**
 * GET /api/v1/roses/my-orders?campaignId=<id>&limit=<number>
 * Get all rose orders created by the current user
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate query parameters
    const validationResult = querySchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.format(),
      });
    }

    const { campaignId, limit } = validationResult.data;

    // Build where clause
    const whereClause: any = {
      createdById: req.user.id,
      orgId: req.orgId,
    };

    if (campaignId) {
      whereClause.campaignId = campaignId;
    }

    // Fetch user's orders
    const orders = await prisma.roseOrder.findMany({
      where: whereClause,
      take: limit || 100,
      select: {
        id: true,
        recipientName: true,
        recipientClass: true,
        roseCount: true,
        senderNote: true,
        isAnonymous: true,
        createdAt: true,
        senderSchool: {
          select: {
            id: true,
            name: true,
          },
        },
        recipientSchool: {
          select: {
            id: true,
            name: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate statistics
    const stats = {
      totalOrders: orders.length,
      totalRoses: orders.reduce((sum: number, order: any) => sum + order.roseCount, 0),
    };

    return res.status(200).json({
      orders,
      stats,
    });
  } catch (error) {
    console.error('Error fetching my orders:', error);
    return res.status(500).json({
      error: 'Interner Server-Fehler beim Abrufen der Bestellungen',
    });
  }
}

export default withAuth(handler);
