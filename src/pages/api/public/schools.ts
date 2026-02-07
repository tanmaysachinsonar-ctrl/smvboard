import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

/**
 * GET /api/public/schools
 * Public endpoint to get all schools (for signup dropdown)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        orgId: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Group schools by organization for better selection
    return res.status(200).json({ schools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return res.status(500).json({ error: 'Failed to fetch schools' });
  }
}
