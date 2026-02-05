import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/apiMiddleware';
import { prisma } from '@/lib/prisma';
import { createRoseOrderSchema } from '@/lib/validationSchemas';

/**
 * POST /api/v1/roses/order
 * Create a new rose order
 *
 * Requirements:
 * - User must be authenticated
 * - User must belong to a school
 * - If campaign is specified, it must be OPEN
 * - Recipient school must exist in the same organization
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validationResult = createRoseOrderSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.format(),
      });
    }

    const {
      recipientSchoolId,
      recipientName,
      recipientClass,
      roseCount,
      senderNote,
      isAnonymous,
      campaignId,
    } = validationResult.data;

    // Check if user belongs to a school
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { schoolId: true, orgId: true },
    });

    if (!user?.schoolId) {
      return res.status(400).json({
        error: 'Du musst einer Schule zugeordnet sein, um Rosen zu bestellen',
      });
    }

    // Verify recipient school exists and belongs to same organization
    const recipientSchool = await prisma.school.findUnique({
      where: { id: recipientSchoolId },
      select: { id: true, orgId: true, name: true },
    });

    if (!recipientSchool) {
      return res.status(404).json({
        error: 'Empfänger-Schule nicht gefunden',
      });
    }

    if (recipientSchool.orgId !== req.orgId) {
      return res.status(403).json({
        error: 'Empfänger-Schule gehört nicht zu deiner Organisation',
      });
    }

    // If campaign is specified, verify it exists and is OPEN
    if (campaignId) {
      const campaign = await prisma.roseCampaign.findUnique({
        where: { id: campaignId },
        select: { id: true, status: true, orgId: true },
      });

      if (!campaign) {
        return res.status(404).json({
          error: 'Kampagne nicht gefunden',
        });
      }

      if (campaign.orgId !== req.orgId) {
        return res.status(403).json({
          error: 'Kampagne gehört nicht zu deiner Organisation',
        });
      }

      if (campaign.status !== 'OPEN') {
        return res.status(400).json({
          error: 'Diese Kampagne ist nicht mehr aktiv',
        });
      }
    }

    // Create the rose order
    const order = await prisma.roseOrder.create({
      data: {
        orgId: req.orgId,
        campaignId: campaignId || null,
        senderSchoolId: user.schoolId,
        recipientSchoolId,
        recipientName: recipientName.trim(),
        recipientClass: recipientClass?.trim() || null,
        roseCount,
        senderNote: senderNote?.trim() || null,
        createdById: req.user.id,
        isAnonymous: isAnonymous || false,
      },
      include: {
        senderSchool: {
          select: { id: true, name: true },
        },
        recipientSchool: {
          select: { id: true, name: true },
        },
        campaign: {
          select: { id: true, name: true },
        },
      },
    });

    // Log the action (audit trail)
    await prisma.auditLog.create({
      data: {
        orgId: req.orgId,
        userId: req.user.id,
        action: 'ROSE_ORDER_CREATED',
        meta: {
          orderId: order.id,
          recipientSchool: recipientSchool.name,
          roseCount,
          isAnonymous,
        },
      },
    });

    return res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error creating rose order:', error);
    return res.status(500).json({
      error: 'Interner Server-Fehler beim Erstellen der Bestellung',
    });
  }
}

export default withAuth(handler, { requiredRole: 'MEMBER' });
