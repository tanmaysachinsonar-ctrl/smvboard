import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../lib/apiMiddleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { orgId } = req;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const categories = await prisma.category.findMany({
      where: { orgId },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error('GET /api/v1/categories error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export default withAuth(handler);
