import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { createRoseOrderSchema } from '../../../../lib/validationSchemas';
import { withAuth, AuthenticatedRequest } from '../../../../lib/apiMiddleware';
import { isValidSchool } from '../../../../lib/schools';

// POST Handler (Public - kein Auth erforderlich)
async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate request body
    const validatedData = createRoseOrderSchema.parse({
      recipientName: req.body.recipientName,
      recipientSchool: req.body.recipientSchool,
      quantity: Number(req.body.quantity),
    });

    // Validate school
    if (!isValidSchool(validatedData.recipientSchool)) {
      return res.status(400).json({
        error: 'Ungültige Schule ausgewählt',
      });
    }

    // Insert into database
    const order = await prisma.roseOrder.create({
      data: {
        recipientName: validatedData.recipientName,
        recipientSchool: validatedData.recipientSchool,
        quantity: validatedData.quantity,
      },
    });

    return res.status(201).json({
      success: true,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error('Error creating rose order:', error);

    // Zod validation error
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Ungültige Eingabedaten',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Interner Serverfehler',
    });
  }
}

// GET Handler (Protected - mit Auth)
async function getHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { user } = req;

    if (!user || !user.orgId) {
      return res.status(401).json({ error: 'Nicht authentifiziert' });
    }

    // Find organization name
    const organization = await prisma.organization.findUnique({
      where: { id: user.orgId },
      select: { name: true },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organisation nicht gefunden' });
    }

    // Get orders for this school
    const orders = await prisma.roseOrder.findMany({
      where: {
        recipientSchool: organization.name,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching rose orders:', error);
    return res.status(500).json({
      error: 'Interner Serverfehler',
    });
  }
}

// Main handler
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Public endpoint - kein Auth
    return postHandler(req, res);
  } else if (req.method === 'GET') {
    // Protected endpoint - mit Auth
    return withAuth(getHandler as any)(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
