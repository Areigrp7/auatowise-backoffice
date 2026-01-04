# Environment Variables Setup

Add these environment variables to your `.env` file for Stripe integration:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Other required variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autowise
DB_USER=postgres
DB_PASSWORD=admin
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_ORIGIN=http://localhost:5173,https://autowise.club
PORT=5001
NODE_ENV=development
```

## Stripe Setup Steps:

1. **Create Stripe Account**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get API Keys**:
   - Go to Dashboard → Developers → API Keys
   - Copy your "Secret key" (starts with `sk_test_`) for `STRIPE_SECRET_KEY`
3. **Setup Webhooks**:
   - Go to Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the "Signing secret" for `STRIPE_WEBHOOK_SECRET`
4. **Test Mode**: Make sure you're using test keys for development

## API Endpoints Created:

### Checkout Session (One-time payments)
```
POST /api/checkout/create-checkout-session
Content-Type: application/json

{
  "items": [
    {
      "name": "Brake Pads",
      "price": 89.99,
      "quantity": 1,
      "description": "Front brake pads"
    }
  ],
  "successUrl": "http://localhost:5173/checkout/success",
  "cancelUrl": "http://localhost:5173/checkout/cancel",
  "shippingAddress": {
    "name": "John Doe",
    "line1": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "postalCode": "12345"
  }
}
```

### Payment Intent (Custom payment flow)
```
POST /api/checkout/create-payment-intent
Content-Type: application/json

{
  "amount": 89.99,
  "currency": "usd",
  "items": [...],
  "shippingAddress": {...}
}
```

### Confirm Payment
```
POST /api/checkout/confirm-payment
Content-Type: application/json

{
  "paymentIntentId": "pi_1234567890"
}
```

## Frontend Integration:

You'll need to integrate Stripe Elements in your frontend:

```javascript
// For Payment Intents
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: 'http://localhost:5173/checkout/success',
  },
});
```

## Webhook Testing:

Test webhooks locally using Stripe CLI:
```bash
stripe listen --forward-to localhost:5001/api/webhooks/stripe
```
