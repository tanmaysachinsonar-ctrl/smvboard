import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/apiMiddleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/v1/roses/campaigns
 * Get all campaigns in the user's organization
 *
 * Query params:
 * - status: Filter by campaign status (optional)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status } = req.query;

    // Build where clause
    const whereClause: any = {
      orgId: req.orgId,
    };

    if (status && typeof status === 'string') {
      whereClause.status = status.toUpperCase();
    }

    const campaigns = await prisma.roseCampaign.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        pricePerRose: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // OPEN first
        { startDate: 'desc' },
      ],
    });

    // Find the current active campaign (if any)
    const now = new Date();
    const activeCampaign = campaigns.find(
      (c: any) => c.status === 'OPEN' && new Date(c.startDate) <= now && new Date(c.endDate) >= now
    );

    return res.status(200).json({
      campaigns,
      activeCampaign: activeCampaign || null,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({
      error: 'Interner Server-Fehler beim Abrufen der Kampagnen',
    });
  }
}

export default withAuth(handler);
