import type { NextApiResponse } from 'next';
import Stripe from 'stripe';
import { withAuth, AuthenticatedRequest } from '../../../lib/apiMiddleware';
import { prisma } from '../../../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { 
  apiVersion: '2024-11-20' as any 
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { orgId } = req;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { returnUrl } = req.body;

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org?.stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: returnUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Create portal session error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create portal session' });
  }
}

export default withAuth(handler, { requiredRole: 'OWNER' });
