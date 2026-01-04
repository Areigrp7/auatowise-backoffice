const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const Payment = require('../models/Payment');

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session) {
  try {
    // Find payment by session metadata or create/update order
    const payment = await Payment.findByPaymentIntentId(session.payment_intent);

    if (payment) {
      await Payment.updateStatus(session.payment_intent, 'succeeded');

      // TODO: Create order record and update inventory
      console.log('Payment succeeded for session:', session.id);
    }
  } catch (error) {
    console.error('Checkout session completed handler error:', error);
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    const payment = await Payment.updateStatus(paymentIntent.id, 'succeeded');

    if (payment) {
      // TODO: Create order record and update inventory
      console.log('Payment intent succeeded:', paymentIntent.id);
    }
  } catch (error) {
    console.error('Payment intent succeeded handler error:', error);
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    const payment = await Payment.updateStatus(paymentIntent.id, 'failed');

    if (payment) {
      console.log('Payment intent failed:', paymentIntent.id);
    }
  } catch (error) {
    console.error('Payment intent failed handler error:', error);
  }
}

// Handle successful invoice payment (for subscriptions)
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log('Invoice payment succeeded:', invoice.id);
    // TODO: Handle subscription renewals
  } catch (error) {
    console.error('Invoice payment succeeded handler error:', error);
  }
}

module.exports = router;
