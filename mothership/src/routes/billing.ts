// This test secret API key is a placeholder. Don't include personal details in requests with this key.
// To see your test secret API key embedded in code samples, sign in to your Stripe account.

import { Router, Request } from "express";
import express from 'express';
import axios from 'axios';
import { requireAuth, getUserId } from '../middleware/auth';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';

// Stripe configuration via environment
const { STRIPE_SECRET_KEY = '', STRIPE_PRICE_ID = '', STRIPE_WEBHOOK_SECRET = '' } = process.env as any;
// Fall back to test key in dev only if not provided
const stripe = require('stripe')(STRIPE_SECRET_KEY || 'sk_test_51Rv0aaD1ydfl2frEW6KmxXrD55iRrzZU0DrBu9OUXqkFDkPYKWPXPF6A7r7IuAVXonfLoZRpFWraK12L8kxIpgpm00UYFRAtGA');

export const billingRouter = Router();

// Helper to log Axios/HTTP errors with more context
function logAxiosError(prefix: string, err: any, extra?: Record<string, any>) {
  try {
    const status = err?.response?.status;
    const statusText = err?.response?.statusText;
    const data = err?.response?.data;
    const method = err?.config?.method;
    const url = err?.config?.url;
    const params = err?.config?.params;
    logger.error(prefix, { status, statusText, method, url, params, data, message: err?.message, ...(extra || {}) });
  } catch (_) {
    // last-resort
    logger.error(prefix, { message: (err && err.message) || String(err) });
  }
}

billingRouter.post('/create-checkout-session', requireAuth(), async (req, res) => {
  const reqId = (req as any)?.id || undefined;
  try {
    const { success_url, cancel_url } = req.body || {};
    if (!success_url) {
      console.warn('[billing][create-checkout-session] missing success_url', { reqId });
      return res.status(400).send({ error: 'Missing success_url' });
    }

    const userId = getUserId(req as Request);
    if (!userId) {
      console.warn('[billing][create-checkout-session] unauthorized (no user)', { reqId });
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // Ensure we have a Stripe customer for this user
    let mapping = await prisma.user_billing.findUnique({ where: { user_id: userId } });
    if (!mapping) {
      const email = (req as any).user?.email || undefined;
      const customer = await stripe.customers.create({ email, metadata: { user_id: userId } });
      mapping = await prisma.user_billing.create({ data: { user_id: userId, stripe_customer_id: customer.id, email: email || null } });
      console.info('[billing][create-checkout-session] customer created', { reqId, customer: customer.id });
    }

    console.info('[billing][create-checkout-session] creating session', { reqId, customer: mapping.stripe_customer_id });

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          // Provide the exact Price ID (for example, price_1234) of the product you want to sell
          price: STRIPE_PRICE_ID || 'price_1Rv0qjD1ydfl2frEjG0gFfDG',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer: mapping.stripe_customer_id,
      return_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      metadata: { user_id: userId },
    });

    console.info('[billing][create-checkout-session] session created', {
      reqId,
      id: session?.id,
      status: session?.status,
    });
    // Persist minimal session record (best effort)
    try {
      await prisma.checkout_sessions.create({
        data: {
          stripe_session_id: session.id,
          user_id: userId,
          stripe_customer_id: mapping.stripe_customer_id,
          mode: 'subscription',
          price_id: STRIPE_PRICE_ID || 'price_1Rv0qjD1ydfl2frEjG0gFfDG',
          status: session.status || null,
          payment_status: session.payment_status || null,
          success_url: success_url || null,
          cancel_url: cancel_url || null,
        },
      });
    } catch (e) {
      console.warn('[billing][create-checkout-session] persist failed', { reqId, message: (e as any)?.message });
    }
    res.send({ clientSecret: session.client_secret });
  } catch (err: any) {
    logAxiosError('[billing][create-checkout-session] error', err, { reqId });
    res.status(502).send({ error: 'Failed to create checkout session' });
  }
});

billingRouter.post('/create-portal-session', requireAuth(), async (req, res) => {
  const reqId = (req as any)?.id || undefined;
  try {
    const { return_url } = req.body || {};
    if (!return_url) {
      console.warn('[billing][create-portal-session] missing return_url', { reqId });
      return res.status(400).send({ error: 'Missing return_url' });
    }
    const userId = getUserId(req as Request);
    if (!userId) {
      console.warn('[billing][create-portal-session] unauthorized (no user)', { reqId });
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const mapping = await prisma.user_billing.findUnique({ where: { user_id: userId } });
    if (!mapping) {
      console.warn('[billing][create-portal-session] no customer mapping', { reqId, userId });
      return res.status(404).send({ error: 'No customer found' });
    }
    console.info('[billing][create-portal-session] creating session', { reqId, userId, customer: mapping.stripe_customer_id });

    const session = await stripe.billingPortal.sessions.create({
      customer: mapping.stripe_customer_id,
      return_url,
    });
    res.send({ url: session.url });
  } catch (err: any) {
    console.error('[billing][create-portal-session] error', {
      reqId,
      message: err?.message,
      statusCode: err?.statusCode,
      stripeType: err?.type,
      requestId: err?.requestId,
    });
    res.status(502).send({ error: 'Failed to create portal session' });
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

    // Best-effort: persist status on our checkout_sessions row
    try {
      await prisma.checkout_sessions.update({
        where: { stripe_session_id: normalized },
        data: {
          status: session?.status || null,
          payment_status: session?.payment_status || null,
          completed_at: isComplete ? new Date() : null,
        },
      });
    } catch (e) {
      console.warn('[billing][session-status] persist failed', { reqId, message: (e as any)?.message });
    }

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

// ------- Stripe webhook handler (exported for mounting with raw body) -------
export const stripeWebhookHandler = async (req: any, res: express.Response) => {
  const reqId = req?.id || undefined;
  let event: any = null;
  try {
    try {
      logger.info('[billing][webhook] received', {
        reqId,
        hasSignature: Boolean(req.headers?.['stripe-signature']),
        isRawBody: Buffer.isBuffer(req.body),
        rawLength: Buffer.isBuffer(req.body) ? (req.body as Buffer).length : undefined,
      });
    } catch {}
    if (STRIPE_WEBHOOK_SECRET && Buffer.isBuffer(req.body)) {
      const sig = req.headers['stripe-signature'] as string;
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      // Fallback (dev): accept parsed JSON without verification
      event = req.body;
      console.warn('[billing][webhook] using unverified body (dev mode). Configure STRIPE_WEBHOOK_SECRET and raw body for production.');
    }
    try {
      logger.info('[billing][webhook] event parsed', { reqId, id: event?.id, type: event?.type });
    } catch {}
  } catch (err: any) {
    console.error('[billing][webhook] signature verification failed', { message: err?.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency: record event (best effort)
  try {
    await prisma.webhook_events.upsert({
      where: { stripe_event_id: event.id },
      create: { stripe_event_id: event.id, type: event.type, payload: event, status: 'received' },
      update: { type: event.type, payload: event, status: 'received' },
    });
  } catch (e: any) {
    console.warn('[billing][webhook] failed to upsert event', { id: event?.id, message: e?.message });
  }

  const finish = async (ok = true) => {
    try {
      await prisma.webhook_events.update({ where: { stripe_event_id: event.id }, data: { status: ok ? 'processed' : 'failed', processed_at: new Date() } });
    } catch {}
    try { logger.info('[billing][webhook] finished', { reqId, id: event?.id, type: event?.type, ok }); } catch {}
    return res.json({ received: true });
  };

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const sessionId = session.id as string;
        const customerId = session.customer as string;
        const userId = session.metadata?.user_id as string | undefined;
        try { logger.info('[billing][webhook] checkout.session.completed', { reqId, sessionId, customerId, userId }); } catch {}
        if (userId && customerId) {
          // Ensure mapping
          try {
            await prisma.user_billing.upsert({
              where: { user_id: userId },
              create: { user_id: userId, stripe_customer_id: customerId, email: session.customer_details?.email || null },
              update: { stripe_customer_id: customerId, email: session.customer_details?.email || null },
            });
          } catch (e: any) {
            logger.error('[billing][webhook] user_billing upsert failed', { reqId, userId, customerId, message: e?.message });
          }
        }
        // Update checkout session
        try {
          await prisma.checkout_sessions.update({
            where: { stripe_session_id: sessionId },
            data: { status: session.status || null, payment_status: session.payment_status || null, completed_at: new Date() },
          });
        } catch (e: any) {
          logger.warn('[billing][webhook] checkout_sessions update failed', { reqId, sessionId, message: e?.message });
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const customerId = sub.customer as string;
        const stripeSubId = sub.id as string;
        const status = sub.status as string;
        const priceId = sub.items?.data?.[0]?.price?.id as string | undefined;
        const qty = sub.items?.data?.[0]?.quantity as number | undefined;
        const currentStart = sub.current_period_start ? new Date(sub.current_period_start * 1000) : null;
        const currentEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
        const canceledAt = sub.canceled_at ? new Date(sub.canceled_at * 1000) : null;
        const isActive = status === 'active' || status === 'trialing';

        // Map customer -> user
        const mapping = await prisma.user_billing.findFirst({ where: { stripe_customer_id: customerId } });
        const userId = mapping?.user_id || null;
        try { logger.info('[billing][webhook] subscription change', { reqId, type: event.type, stripeSubId, status, isActive, customerId, userId, priceId, qty }); } catch {}

        if (userId) {
          try {
            await prisma.subscriptions.upsert({
              where: { stripe_subscription_id: stripeSubId },
              create: {
                stripe_subscription_id: stripeSubId,
                user_id: userId,
                stripe_customer_id: customerId,
                status,
                price_id: priceId || '',
                quantity: qty || 1,
                current_period_start: currentStart,
                current_period_end: currentEnd,
                canceled_at: canceledAt,
                is_active: isActive,
              },
              update: {
                status,
                price_id: priceId || undefined,
                quantity: qty || undefined,
                current_period_start: currentStart,
                current_period_end: currentEnd,
                canceled_at: canceledAt,
                is_active: isActive,
                updated_at: new Date(),
              },
            });
          } catch (e: any) {
            logger.error('[billing][webhook] subscriptions upsert failed', { reqId, stripeSubId, userId, message: e?.message });
          }
        }

        // Keycloak role sync
        try {
          const admin = await getAdminAccessToken();
          const role = await getRealmRole(admin, 'premium');
          if (userId) {
            const has = await userHasRealmRole(admin, userId, 'premium');
            logger.info('[billing][webhook] keycloak role check', { reqId, userId, isActive, hasPremium: has });
            if (isActive && !has) {
              await assignRealmRole(admin, userId, role);
              logger.info('[billing][webhook] premium role assigned', { reqId, userId });
              try {
                await prisma.role_assignments_log.create({
                  data: {
                    user_id: userId,
                    action: 'grant_premium',
                    reason: 'webhook',
                    context: {
                      event_id: event?.id,
                      stripe_subscription_id: stripeSubId,
                      stripe_customer_id: customerId,
                      status,
                    } as any,
                  },
                });
              } catch {}
            }
            if (!isActive && has) {
              // remove role when inactive
              try {
                const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${encodeURIComponent(userId)}/role-mappings/realm`;
                await axios.delete(url, { headers: { Authorization: `Bearer ${admin}` }, data: [role] });
                logger.info('[billing][webhook] premium role removed', { reqId, userId });
                try {
                  await prisma.role_assignments_log.create({
                    data: {
                      user_id: userId,
                      action: 'revoke_premium',
                      reason: 'webhook',
                      context: {
                        event_id: event?.id,
                        stripe_subscription_id: stripeSubId,
                        stripe_customer_id: customerId,
                        status,
                      } as any,
                    },
                  });
                } catch {}
              } catch {}
            }
          }
        } catch (e: any) {
          logger.warn('[billing][webhook] keycloak sync failed', { reqId, message: e?.message });
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const inv = event.data.object as any;
        try { logger.info('[billing][webhook] invoice.payment_succeeded', { reqId, invoiceId: inv?.id, customer: inv?.customer }); } catch {}
        try {
          await prisma.invoices.upsert({
            where: { stripe_invoice_id: inv.id },
            create: {
              stripe_invoice_id: inv.id,
              stripe_customer_id: inv.customer as string,
              stripe_subscription_id: inv.subscription as string,
              status: inv.status,
              amount_due: inv.amount_due || 0,
              amount_paid: inv.amount_paid || 0,
              currency: inv.currency || null,
              hosted_invoice_url: inv.hosted_invoice_url || null,
              pdf: inv.invoice_pdf || null,
              period_start: inv.period_start ? new Date(inv.period_start * 1000) : null,
              period_end: inv.period_end ? new Date(inv.period_end * 1000) : null,
            },
            update: {
              status: inv.status,
              amount_due: inv.amount_due || 0,
              amount_paid: inv.amount_paid || 0,
              currency: inv.currency || null,
              hosted_invoice_url: inv.hosted_invoice_url || null,
              pdf: inv.invoice_pdf || null,
              period_start: inv.period_start ? new Date(inv.period_start * 1000) : null,
              period_end: inv.period_end ? new Date(inv.period_end * 1000) : null,
            },
          });
        } catch (e: any) {
          logger.warn('[billing][webhook] invoices upsert failed', { reqId, invoiceId: inv?.id, message: e?.message });
        }
        break;
      }
      default:
        try { logger.info('[billing][webhook] ignored event', { reqId, type: event?.type, id: event?.id }); } catch {}
        break;
    }
    return finish(true);
  } catch (e: any) {
    console.error('[billing][webhook] handler error', { id: event?.id, type: event?.type, message: e?.message });
    return finish(false);
  }
};

// Keep router route for dev/non-raw mounting (will be shadowed by app-level raw route if present)
billingRouter.post('/stripe/webhook', (req, res) => stripeWebhookHandler(req as any, res));

// ---- Revoke premium role manually (testing/admin) ----
async function removeRealmRole(token: string, userId: string, roleRep: any) {
  const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${encodeURIComponent(userId)}/role-mappings/realm`;
  try {
    await axios.delete(url, { headers: { Authorization: `Bearer ${token}` }, data: [roleRep] });
  } catch (e: any) {
    logAxiosError('[billing][kc] removeRealmRole failed', e, { userId, role: roleRep?.name, url });
    throw e;
  }
}

billingRouter.post('/revoke-premium', requireAuth(), async (req, res) => {
  const reqId = (req as any)?.id;
  try {
    const userId = getUserId(req as Request);
    if (!userId) {
      logger.warn('[billing][revoke-premium] missing user id', { reqId });
      return res.status(401).json({ error: 'Unauthorized' });
    }
    logger.info('[billing][revoke-premium] start', { reqId, userId });
    const admin = await getAdminAccessToken();
    const role = await getRealmRole(admin, 'premium');
    const has = await userHasRealmRole(admin, userId, 'premium');
    if (has) {
      try { await removeRealmRole(admin, userId, role); } catch {}
    }
    // Best-effort: mark subscriptions inactive
    try {
      await prisma.subscriptions.updateMany({ where: { user_id: userId }, data: { is_active: false, updated_at: new Date() } });
    } catch {}
    // Audit log
    try {
      await prisma.role_assignments_log.create({ data: { user_id: userId, action: 'revoke_premium', reason: 'manual', context: {} as any } });
    } catch {}
    return res.json({ ok: true, premium: false });
  } catch (err: any) {
    logger.error('[billing][revoke-premium] error', { message: err?.message });
    return res.status(502).json({ error: 'Failed to revoke premium' });
  }
});

// ---- Assign premium role in Keycloak for the authenticated user ----
const { KEYCLOAK_URL = '', KEYCLOAK_REALM = '', KEYCLOAK_ADMIN_CLIENT_ID = '', KEYCLOAK_ADMIN_CLIENT_SECRET = '' } = process.env as any;

async function getAdminAccessToken() {
  if (!KEYCLOAK_URL || !KEYCLOAK_REALM || !KEYCLOAK_ADMIN_CLIENT_ID || !KEYCLOAK_ADMIN_CLIENT_SECRET) {
    throw new Error('Keycloak admin not configured');
  }
  const url = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: KEYCLOAK_ADMIN_CLIENT_ID,
    client_secret: KEYCLOAK_ADMIN_CLIENT_SECRET,
  });
  try {
    const { data } = await axios.post(url, params);
    return data.access_token as string;
  } catch (e: any) {
    logAxiosError('[billing][kc] getAdminAccessToken failed', e, { url });
    throw e;
  }
}

async function getRealmRole(token: string, roleName: string) {
  const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/roles/${encodeURIComponent(roleName)}`;
  try {
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return data; // { id, name, ... }
  } catch (e: any) {
    logAxiosError('[billing][kc] getRealmRole failed', e, { roleName, url });
    throw e;
  }
}

async function userHasRealmRole(token: string, userId: string, roleName: string) {
  const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${encodeURIComponent(userId)}/role-mappings/realm`;
  try {
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return Array.isArray(data) && data.some((r: any) => r?.name === roleName);
  } catch (e: any) {
    logAxiosError('[billing][kc] userHasRealmRole failed', e, { userId, roleName, url });
    throw e;
  }
}

async function assignRealmRole(token: string, userId: string, roleRep: any) {
  const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${encodeURIComponent(userId)}/role-mappings/realm`;
  try {
    await axios.post(url, [roleRep], { headers: { Authorization: `Bearer ${token}` } });
  } catch (e: any) {
    logAxiosError('[billing][kc] assignRealmRole failed', e, { userId, role: roleRep?.name, url });
    throw e;
  }
}

billingRouter.post('/assign-premium', requireAuth(), async (req, res) => {
  const reqId = (req as any)?.id;
  try {
    const userId = getUserId(req as Request);
    if (!userId) {
      logger.warn('[billing][assign-premium] missing user id', { reqId });
      return res.status(401).json({ error: 'Unauthorized' });
    }
    logger.info('[billing][assign-premium] start', { reqId, userId });
    const admin = await getAdminAccessToken();
    const has = await userHasRealmRole(admin, userId, 'premium');
    if (!has) {
      const role = await getRealmRole(admin, 'premium');
      await assignRealmRole(admin, userId, role);
      logger.info('[billing][assign-premium] role assigned', { reqId, userId });
      try {
        await prisma.role_assignments_log.create({ data: { user_id: userId, action: 'grant_premium', reason: 'manual', context: {} as any } });
      } catch {}
    } else {
      logger.info('[billing][assign-premium] role already present', { reqId, userId });
    }
    return res.json({ ok: true, premium: true });
  } catch (err: any) {
    logger.error('[billing][assign-premium] error', { message: err?.message });
    const code = /not configured/i.test(err?.message || '') ? 500 : 502;
    return res.status(code).json({ error: 'Failed to assign premium' });
  }
});
