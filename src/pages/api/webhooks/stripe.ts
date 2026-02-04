import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2022-11-15" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  let event: Stripe.Event;

  try {
    if (!sig) throw new Error("No signature");
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err?.message);
    return res.status(400).send(`Webhook Error: ${err?.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      // TODO: mark subscription active / create customer link in DB
      console.log('Checkout session completed', event.data.object);
      break;
    case 'invoice.payment_succeeded':
      console.log('Invoice paid', event.data.object);
      break;
    // add other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}
