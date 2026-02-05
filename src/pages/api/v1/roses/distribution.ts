import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/apiMiddleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  schoolId: z.string().cuid(),
  campaignId: z.string().cuid().optional(),
});

interface AggregatedRecipient {
  recipientName: string;
  recipientClass: string | null;
  totalRoses: number;
  orderCount: number;
}

/**
 * GET /api/v1/roses/distribution?schoolId=<id>&campaignId=<id>
 * Get aggregated distribution list for a school
 *
 * Requirements:
 * - User must be authenticated
 * - User can only view distribution for their own school, unless they are OWNER
 * - Results are aggregated by recipientName and recipientClass
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

    const { schoolId, campaignId } = validationResult.data;

    // Verify school exists and belongs to user's organization
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, orgId: true, name: true },
    });

    if (!school) {
      return res.status(404).json({
        error: 'Schule nicht gefunden',
      });
    }

    if (school.orgId !== req.orgId) {
      return res.status(403).json({
        error: 'Keine Berechtigung für diese Schule',
      });
    }

    // Check access rights: User can only view their own school unless they are OWNER
    if (req.user.role !== 'OWNER') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { schoolId: true },
      });

      if (user?.schoolId !== schoolId) {
        return res.status(403).json({
          error: 'Du kannst nur die Verteilung deiner eigenen Schule einsehen',
        });
      }
    }

    // Build where clause
    const whereClause: any = {
      recipientSchoolId: schoolId,
      orgId: req.orgId,
    };

    if (campaignId) {
      whereClause.campaignId = campaignId;
    }

    // Fetch all orders for this school
    const orders = await prisma.roseOrder.findMany({
      where: whereClause,
      select: {
        recipientName: true,
        recipientClass: true,
        roseCount: true,
      },
      orderBy: [{ recipientClass: 'asc' }, { recipientName: 'asc' }],
    });

    // Aggregate by recipient name and class
    const aggregationMap = new Map<string, AggregatedRecipient>();

    orders.forEach((order: any) => {
      const key = `${order.recipientName}|${order.recipientClass || ''}`;

      if (aggregationMap.has(key)) {
        const existing = aggregationMap.get(key)!;
        existing.totalRoses += order.roseCount;
        existing.orderCount += 1;
      } else {
        aggregationMap.set(key, {
          recipientName: order.recipientName,
          recipientClass: order.recipientClass,
          totalRoses: order.roseCount,
          orderCount: 1,
        });
      }
    });

    // Convert map to array and sort
    const distribution = Array.from(aggregationMap.values()).sort((a, b) => {
      // Sort by class first, then by name
      if (a.recipientClass && b.recipientClass) {
        const classCompare = a.recipientClass.localeCompare(b.recipientClass);
        if (classCompare !== 0) return classCompare;
      } else if (a.recipientClass) {
        return -1;
      } else if (b.recipientClass) {
        return 1;
      }
      return a.recipientName.localeCompare(b.recipientName);
    });

    // Calculate statistics
    const stats = {
      totalRecipients: distribution.length,
      totalRoses: distribution.reduce((sum, item) => sum + item.totalRoses, 0),
      totalOrders: distribution.reduce((sum, item) => sum + item.orderCount, 0),
      averageRosesPerRecipient:
        distribution.length > 0
          ? Math.round(
              (distribution.reduce((sum, item) => sum + item.totalRoses, 0) / distribution.length) *
                10
            ) / 10
          : 0,
    };

    return res.status(200).json({
      school: {
        id: school.id,
        name: school.name,
      },
      distribution,
      stats,
    });
  } catch (error) {
    console.error('Error fetching distribution:', error);
    return res.status(500).json({
      error: 'Interner Server-Fehler beim Abrufen der Verteilungsliste',
    });
  }
}

export default withAuth(handler, { requiredRole: 'MEMBER' });
