import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../lib/apiMiddleware';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  eventReminders: z.boolean().optional(),
  financeUpdates: z.boolean().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  profileVisibility: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
});

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { user } = req;

  if (req.method === 'GET') {
    try {
      let settings = await prisma.userSettings.findUnique({
        where: { userId: user.id },
      });

      // Create default settings if not exists
      if (!settings) {
        settings = await prisma.userSettings.create({
          data: { userId: user.id },
        });
      }

      return res.status(200).json(settings);
    } catch (error) {
      console.error('GET /api/v1/settings error:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const validatedData = updateSettingsSchema.parse(req.body);

      const settings = await prisma.userSettings.upsert({
        where: { userId: user.id },
        update: validatedData,
        create: {
          userId: user.id,
          ...validatedData,
        },
      });

      return res.status(200).json(settings);
    } catch (error: any) {
      console.error('PUT /api/v1/settings error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default withAuth(handler);
