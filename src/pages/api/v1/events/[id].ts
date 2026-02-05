import type { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest, logAudit } from '../../../../lib/apiMiddleware';
import { createEventSchema } from '../../../../lib/validationSchemas';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { orgId, user } = req;
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  // Verify event exists and belongs to org
  const event = await prisma.event.findFirst({
    where: { id, orgId },
  });

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (req.method === 'GET') {
    try {
      const eventWithDetails = await prisma.event.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          participants: true,
        },
      });

      return res.status(200).json(eventWithDetails);
    } catch (error) {
      console.error('GET /api/v1/events/[id] error:', error);
      return res.status(500).json({ error: 'Failed to fetch event' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const validatedData = createEventSchema.partial().parse(req.body);

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          ...validatedData,
          start: validatedData.start ? new Date(validatedData.start) : undefined,
          end: validatedData.end ? new Date(validatedData.end) : undefined,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          participants: true,
        },
      });

      await logAudit(orgId, user.id, 'EVENT_UPDATED', {
        eventId: id,
        title: updatedEvent.title,
      });

      return res.status(200).json(updatedEvent);
    } catch (error: any) {
      console.error('PUT /api/v1/events/[id] error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Failed to update event' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.event.delete({
        where: { id },
      });

      await logAudit(orgId, user.id, 'EVENT_DELETED', {
        eventId: id,
        title: event.title,
      });

      return res.status(204).end();
    } catch (error) {
      console.error('DELETE /api/v1/events/[id] error:', error);
      return res.status(500).json({ error: 'Failed to delete event' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withAuth(handler, { requiredRole: 'MEMBER' });
