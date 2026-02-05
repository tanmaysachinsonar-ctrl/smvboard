import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/apiMiddleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/v1/roses/schools
 * Get all schools in the user's organization
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const schools = await prisma.school.findMany({
      where: {
        orgId: req.orgId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            receivedOrders: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({
      schools,
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return res.status(500).json({
      error: 'Interner Server-Fehler beim Abrufen der Schulen',
    });
  }
}

export default withAuth(handler);
