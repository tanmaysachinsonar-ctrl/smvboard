import type { NextApiRequest, NextApiResponse } from 'next';
import { signIn as authSignIn } from '../../../lib/auth';
import { signInSchema } from '../../../lib/validationSchemas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const validatedData = signInSchema.parse(req.body);
    const result = await authSignIn(validatedData.email, validatedData.password);

    return res.status(200).json({
      user: result.user,
      session: result.session,
    });
  } catch (error: any) {
    console.error('Sign in error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(401).json({ error: error.message || 'Authentication failed' });
  }
}
