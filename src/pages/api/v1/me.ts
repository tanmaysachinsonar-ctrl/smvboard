import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../lib/apiMiddleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  return res.status(200).json(req.user);
}

export default withAuth(handler);
