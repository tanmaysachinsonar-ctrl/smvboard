import type { NextApiResponse } from 'next';
import Stripe from 'stripe';
import { withAuth, AuthenticatedRequest } from '../../../lib/apiMiddleware';
import { prisma } from '../../../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { 
  apiVersion: '2024-11-20' as any 
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { orgId, user } = req;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    // Get or create Stripe customer
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    let customerId = org.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          orgId,
          userId: user.id,
        },
      });

      customerId = customer.id;

      await prisma.organization.update({
        where: { id: orgId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        orgId,
        userId: user.id,
      },
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
}

export default withAuth(handler, { requiredRole: 'OWNER' });
