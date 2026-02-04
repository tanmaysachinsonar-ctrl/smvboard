import type { NextApiRequest, NextApiResponse } from 'next';
import { signUp as authSignUp } from '../../../lib/auth';
import { signUpSchema } from '../../../lib/validationSchemas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const validatedData = signUpSchema.parse(req.body);
    const result = await authSignUp(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      validatedData.orgName
    );

    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Sign up error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(400).json({ error: error.message || 'Registration failed' });
  }
}
