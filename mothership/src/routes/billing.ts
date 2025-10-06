// This test secret API key is a placeholder. Don't include personal details in requests with this key.
// To see your test secret API key embedded in code samples, sign in to your Stripe account.

import { Router } from "express";

// You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
const stripe = require('stripe')('sk_test_51Rv0aaD1ydfl2frEW6KmxXrD55iRrzZU0DrBu9OUXqkFDkPYKWPXPF6A7r7IuAVXonfLoZRpFWraK12L8kxIpgpm00UYFRAtGA');

export const billingRouter = Router();

billingRouter.post('/create-checkout-session', async (req, res) => {
  const reqId = (req as any)?.id || undefined;
  try {
    const { success_url, cancel_url } = req.body || {};
    if (!success_url || !cancel_url) {
      console.warn('[billing][create-checkout-session] missing urls', { reqId });
      return res.status(400).send({ error: 'Missing success_url or cancel_url' });
    }
    console.info('[billing][create-checkout-session] creating session', { reqId });

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          // Provide the exact Price ID (for example, price_1234) of the product you want to sell
          price: 'price_1Rv0qjD1ydfl2frEjG0gFfDG',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      return_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
    });

    console.info('[billing][create-checkout-session] session created', {
      reqId,
      id: session?.id,
      status: session?.status,
    });
    res.send({ clientSecret: session.client_secret, id: session.id });
  } catch (err: any) {
    console.error('[billing][create-checkout-session] error', {
      reqId,
      message: err?.message,
      statusCode: err?.statusCode,
      stripeType: err?.type,
      requestId: err?.requestId,
    });
    res.status(502).send({ error: 'Failed to create checkout session' });
  }
});

billingRouter.get('/session-status', async (req, res) => {
  const reqId = (req as any)?.id || undefined;
  try {
    const raw = (req.query as any)?.session_id;
    if (!raw || typeof raw !== 'string') {
      console.warn('[billing][session-status] missing session_id', { reqId });
      return res.status(400).json({ error: 'Missing session_id' });
    }

    // Normalize ID: decode, trim, and strip trailing slashes
    const normalized = decodeURIComponent(raw).trim().replace(/\/+$/, '');

    // Basic validation to avoid Stripe invalid_request_error
    if (!normalized.startsWith('cs_') || normalized.length > 66) {
      console.warn('[billing][session-status] invalid session_id format', { reqId, session_id: normalized });
      return res.status(400).json({ error: 'Invalid session_id' });
    }

    console.info('[billing][session-status] retrieving session', { reqId, session_id: normalized });
    const session = await stripe.checkout.sessions.retrieve(normalized, {
      expand: ['subscription', 'customer']
    });

    const status: string = session?.status || 'open';
    const paid = session?.payment_status === 'paid';
    const isComplete = status === 'complete' || paid;
    const subscriptionStatus = (session?.subscription as any)?.status || null;

    console.info('[billing][session-status] session retrieved', {
      reqId,
      status,
      payment_status: session?.payment_status,
      subscription_status: subscriptionStatus,
      request_id: (session as any)?.last_response?.requestId,
    });

    return res.json({
      status: isComplete ? 'complete' : status,
      payment_status: session?.payment_status || null,
      subscription_status: subscriptionStatus,
      customer_email: session?.customer_details?.email || null,
    });
  } catch (err: any) {
    const stripeType = err?.type;
    const stripeParam = err?.param;
    const requestId = err?.requestId || err?.raw?.requestId;
    const statusCode = err?.statusCode || err?.raw?.statusCode;
    console.error('[billing][session-status] error', {
      reqId,
      stripeType,
      stripeParam,
      statusCode,
      message: err?.message,
      requestId,
    });

    if (stripeType === 'StripeInvalidRequestError' && stripeParam === 'session') {
      return res.status(400).json({ error: 'Invalid session_id' });
    }
    // Prefer 502 for upstream issues
    return res.status(502).json({ error: 'Failed to retrieve session status' });
  }
});
