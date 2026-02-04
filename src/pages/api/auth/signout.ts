import type { NextApiRequest, NextApiResponse } from 'next';
import { signOut as authSignOut } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await authSignOut();
    return res.status(200).json({ message: 'Signed out successfully' });
  } catch (error: any) {
    console.error('Sign out error:', error);
    return res.status(500).json({ error: error.message || 'Sign out failed' });
  }
}
