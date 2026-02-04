import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { prisma } from '../../../lib/prisma';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20' as any });

// Disable body parsing for raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  let event: Stripe.Event;

  try {
    if (!sig) throw new Error('No signature');
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err?.message);
    return res.status(400).send(`Webhook Error: ${err?.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed', session.id);

        const orgId = session.metadata?.orgId;
        const subscriptionId = session.subscription as string;

        if (orgId && subscriptionId) {
          // Fetch subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Create or update subscription in database
          await prisma.subscription.upsert({
            where: { orgId },
            create: {
              orgId,
              stripeSubscriptionId: subscriptionId,
              planId: subscription.items.data[0]?.price.id || 'unknown',
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              stripeSubscriptionId: subscriptionId,
              planId: subscription.items.data[0]?.price.id || 'unknown',
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });

          // Log audit
          await prisma.auditLog.create({
            data: {
              orgId,
              userId: session.metadata?.userId || null,
              action: 'SUBSCRIPTION_ACTIVATED',
              meta: {
                subscriptionId,
                planId: subscription.items.data[0]?.price.id || 'unknown',
              },
            },
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice paid', invoice.id);

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const orgSubscription = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (!orgSubscription) {
            console.error('Subscription not found for stripe subscription:', subscription.id);
            break;
          }

          await prisma.subscription.update({
            where: { id: orgSubscription.id },
            data: {
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });

          await prisma.auditLog.create({
            data: {
              orgId: orgSubscription.orgId,
              userId: null,
              action: 'INVOICE_PAID',
              meta: {
                invoiceId: invoice.id,
                amount: invoice.amount_paid / 100,
              },
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment failed', invoice.id);

        if (invoice.subscription) {
          const orgSubscription = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string },
          });

          if (orgSubscription) {
            await prisma.auditLog.create({
              data: {
                orgId: orgSubscription.orgId,
                userId: null,
                action: 'INVOICE_PAYMENT_FAILED',
                meta: {
                  invoiceId: invoice.id,
                  amount: invoice.amount_due / 100,
                },
              },
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated', subscription.id);

        const orgSubscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!orgSubscription) {
          console.error('Subscription not found for stripe subscription:', subscription.id);
          break;
        }

        await prisma.subscription.update({
          where: { id: orgSubscription.id },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            planId: subscription.items.data[0]?.price.id || orgSubscription.planId,
          },
        });

        await prisma.auditLog.create({
          data: {
            orgId: orgSubscription.orgId,
            userId: null,
            action: 'SUBSCRIPTION_UPDATED',
            meta: {
              subscriptionId: subscription.id,
              status: subscription.status,
            },
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted', subscription.id);

        const orgSubscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!orgSubscription) {
          console.error('Subscription not found for stripe subscription:', subscription.id);
          break;
        }

        await prisma.subscription.update({
          where: { id: orgSubscription.id },
          data: {
            status: 'canceled',
          },
        });

        await prisma.auditLog.create({
          data: {
            orgId: orgSubscription.orgId,
            userId: null,
            action: 'SUBSCRIPTION_CANCELED',
            meta: {
              subscriptionId: subscription.id,
            },
          },
        });
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
