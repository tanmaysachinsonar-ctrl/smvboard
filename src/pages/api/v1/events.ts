import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest, logAudit } from '../../../lib/apiMiddleware';
import { createEventSchema } from '../../../lib/validationSchemas';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { orgId, user } = req;

  if (req.method === 'GET') {
    try {
      const { start, end } = req.query;
      
      const where: any = { orgId };
      
      if (start && typeof start === 'string') {
        where.start = { ...where.start, gte: new Date(start) };
      }
      
      if (end && typeof end === 'string') {
        where.end = { ...where.end, lte: new Date(end) };
      }

      const events = await prisma.event.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          participants: true,
        },
        orderBy: { start: 'asc' },
      });

      return res.status(200).json(events);
    } catch (error) {
      console.error('GET /api/v1/events error:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = createEventSchema.parse(req.body);

      const event = await prisma.event.create({
        data: {
          ...validatedData,
          start: new Date(validatedData.start),
          end: validatedData.end ? new Date(validatedData.end) : undefined,
          orgId,
          createdById: user.id,
        },
      });

      await logAudit(orgId, user.id, 'EVENT_CREATED', {
        eventId: event.id,
        title: event.title,
      });

      return res.status(201).json(event);
    } catch (error: any) {
      console.error('POST /api/v1/events error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Failed to create event' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withAuth(handler, { requiredRole: 'MEMBER' });
