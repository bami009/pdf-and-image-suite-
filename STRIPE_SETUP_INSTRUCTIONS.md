# Integration Guide: Production-Ready Stripe Payments & Webhooks

This guide provides step-by-step instructions to take the Stripe subscription flow that has been implemented in your application and transition it to production. Since your workspace now has a secure backend Express server (`server.ts`) handling Stripe session creation and webhook signature validation, you can follow these precise steps to connect it to your live Stripe account.

---

## Table of Contents
1. [Registering a Stripe Merchant Account](#1-registering-a-stripe-merchant-account)
2. [Configuring Your Stripe Dashboard & Product Catalog](#2-configuring-your-stripe-dashboard--product-catalog)
3. [Acquiring API Keys & Webhook Secrets](#3-acquiring-api-keys--webhook-secrets)
4. [Injecting Secrets into Your Application Environments](#4-injecting-secrets-into-your-application-environments)
5. [Setting Up Webhooks (Local Dev vs. Live Production)](#5-setting-up-webhooks-local-dev-vs-live-production)
6. [Testing the Checkout & Webhook Pipeline](#6-testing-the-checkout--webhook-pipeline)

---

## 1. Registering a Stripe Merchant Account

To collect live credit card and payment information, you need a registered merchant account:

1. **Sign Up**: Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register) and create your account.
2. **Complete the Application**: Go to **Settings > Account Details** and follow Stripe’s checklist to activate your business. You will need to provide:
   - Business entity details (e.g., Sole Proprietor, LLC, or Corporation).
   - Bank routing and account numbers for payouts.
   - Support contact details and a statement descriptor for credit card statements.
3. **Toggle Test Mode**: Once inside the dashboard, locate the **Test Mode** toggle in the top-right corner. Keep this enabled while completing integration testing.

---

## 2. Configuring Your Stripe Dashboard & Product Catalog

Your application defines two price levels: **Monthly ($9.00/mo)** and **Yearly ($79.00/yr)**. You must configure these prices inside Stripe so Stripe Checkout displays the correct branding and prices.

1. Navigate to the **Product Catalog** in your Stripe Dashboard.
2. Click **Add Product** in the top right.
3. Configure the Product:
   - **Name**: `PDF & Image Suite Pro`
   - **Description**: `Unlimited file processing, premium tools, and priority processing queues.`
   - **Pricing**:
     - Create pricing option 1: `$9.00 USD` recurring **Monthly**.
     - Create pricing option 2: `$79.00 USD` recurring **Yearly**.
4. Click **Save Product**.

*Note: In our dynamic code integration, Stripe Checkout creates on-the-fly line items for maximum flexibility. If you prefer to lock down the exact Price IDs from Stripe, you can replace the dynamic pricing object in `/server.ts` with your specific Stripe Price ID (e.g., `price_1P...`).*

---

## 3. Acquiring API Keys & Webhook Secrets

You need secure tokens to authorize payments and listen to events.

### A. Secret API Key
1. Go to **Developers > API Keys** in your Stripe Dashboard.
2. Find the **Secret key** (starts with `sk_test_` in test mode or `sk_live_` in live production).
3. Click **Reveal live key** or **Reveal test key** and copy it securely.

### B. Webhook Secret Key
1. Go to **Developers > Webhooks**.
2. If testing locally: Use the Stripe CLI to listen to events (see Step 5).
3. If setting up production: Click **Add endpoint**.
   - **Endpoint URL**: `https://<YOUR_APP_URL>/api/stripe/webhook`
   - **Select events**: Choose `checkout.session.completed`
4. Save the endpoint and click **Reveal Signing Secret** (starts with `whsec_`).

---

## 4. Injecting Secrets into Your Application Environments

Never commit real keys or secrets into Git! Instead, manage them securely through your environment variables.

### A. For Local Development
Create or update your local `.env` file in the root directory:

```env
# Secret API Key from Developers > API Keys
STRIPE_SECRET_KEY=sk_test_51Px...

# Webhook Signing Secret from Developers > Webhooks
STRIPE_WEBHOOK_SECRET=whsec_...
```

### B. For Production Cloud Run / AI Studio
1. Navigate to your **Settings** menu in the AI Studio environment.
2. Find the **Environment Variables** panel.
3. Declare and save the values for:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

Once updated, the platform will securely inject these variables into the backend container, allowing the app server to authorize connection requests.

---

## 5. Setting Up Webhooks (Local Dev vs. Live Production)

Stripe webhooks are essential to update your Firestore database asynchronously when checkout succeeds.

### Option A: Local Webhook Testing (Highly Recommended)
Since Stripe cannot directly connect to a local port (like `localhost:3000`), you should use the **Stripe CLI** to forward events:

1. Install the Stripe CLI by following the official [Stripe CLI Installation Guide](https://stripe.com/docs/stripe-cli).
2. Authenticate the CLI with your account:
   ```bash
   stripe login
   ```
3. Run the webhook forwarding server targeting your local development environment:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. The terminal will print a **Webhook signing secret** (e.g., `whsec_...`). Copy this secret and place it as `STRIPE_WEBHOOK_SECRET` in your `.env` file, then restart your dev server.

### Option B: Production Setup
When your app is deployed to Cloud Run:
1. Copy your public container URL (found in the metadata: `https://ais-pre-hji562mgv4l6gn7t3kyq3w-428076052372.europe-west2.run.app`).
2. Register this URL as a webhook endpoint inside your Stripe Dashboard:
   `https://ais-pre-hji562mgv4l6gn7t3kyq3w-428076052372.europe-west2.run.app/api/stripe/webhook`
3. Select `checkout.session.completed` as the sole subscribed event.
4. Set the returned secret `whsec_...` inside the Settings environment variables under `STRIPE_WEBHOOK_SECRET`.

---

## 6. Testing the Checkout & Webhook Pipeline

Stripe provides dummy credit cards so you can test the entire pipeline without spending real money.

1. **Trigger Checkout**: Open the application, open the **Upgrade Modal**, select either **Monthly** or **Yearly**, and click **Upgrade to Pro**.
2. **Checkout Redirection**: You will be seamlessly redirected to Stripe's checkout portal.
3. **Use a Test Card**: Use any of Stripe’s mock test cards to complete the simulation:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/30`)
   - **CVC**: Any 3-digit combination (e.g., `123`)
   - **Name**: Any name (e.g., `Test User`)
4. **Processing & Callback**: After clicking Pay, Stripe will process the card and redirect you back to your application with the parameter `?stripe_success=true`.
5. **Verify Database Record**:
   - The webhook listener inside `server.ts` catches the secure payload.
   - It decodes the custom `uid` metadata and updates the Firestore user profile status to `premium`.
   - The user interface in your App updates dynamically, displaying the active subscription details!

---

*This guide was generated automatically for your reference. For more detailed API questions or advanced integration features, visit the official [Stripe Developer Documentation](https://docs.stripe.com).*
