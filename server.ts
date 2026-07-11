import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0965231025",
  appId: "1:732186751051:web:a8ef092a6253ab72565dce",
  apiKey: "AIzaSyCtMib2RAWT2nvmlczymHfQSoZNl11BpkQ",
  authDomain: "gen-lang-client-0965231025.firebaseapp.com",
  storageBucket: "gen-lang-client-0965231025.firebasestorage.app",
  messagingSenderId: "732186751051"
};

const databaseId = "ai-studio-2a8b1451-2db4-40b3-8230-7c03a4d20c7c";

// Initialize Firebase client on the server side to update Firestore securely on webhook events
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, databaseId);

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not defined in Settings.");
    }
    stripeClient = new Stripe(key, {
      apiVersion: "2023-10-16" as any,
    });
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook needs the raw body, so we set it up BEFORE any global JSON body parser
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log("Received Stripe Webhook event notification.");
    let event: Stripe.Event;

    try {
      const stripe = getStripe();
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
      } else {
        // Fallback parsing for sandbox / development / testing mode
        console.warn("STRIPE_WEBHOOK_SECRET or stripe-signature header is missing. Parsing request body directly as raw JSON.");
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error(`Webhook parsing or signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`Stripe Webhook parsed successfully. Event Type: ${event.type}`);

    // Handle payment completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = session.metadata?.uid;
      const plan = session.metadata?.plan as "monthly" | "yearly";

      if (uid && plan) {
        console.log(`Webhook Action: Upgrading user ${uid} to plan ${plan}`);
        try {
          const userRef = doc(db, "users", uid);
          const expiresAt = plan === "yearly"
            ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString()
            : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

          await setDoc(userRef, {
            role: "premium",
            subscriptionStatus: "active",
            subscriptionPlan: plan,
            expiresAt: expiresAt
          }, { merge: true });

          // Record payment transaction in billing history
          const billingRef = doc(db, "billing", `${uid}_${Date.now()}`);
          await setDoc(billingRef, {
            uid: uid,
            amount: plan === "yearly" ? 79.00 : 9.00,
            plan: plan,
            status: "completed",
            date: new Date().toISOString(),
            invoiceUrl: session.invoice || "",
            invoiceNumber: `INV-${Math.floor(Math.random() * 900000) + 100000}`
          });

          // Refresh and update global system billing stats
          const statsRef = doc(db, "system", "stats");
          const statsSnap = await getDoc(statsRef);
          if (statsSnap.exists()) {
            const stats = statsSnap.data();
            await setDoc(statsRef, {
              ...stats,
              premiumUsers: (stats.premiumUsers || 0) + 1,
              totalConversions: (stats.totalConversions || 0) + 1,
              totalRevenue: (stats.totalRevenue || 0) + (plan === "yearly" ? 79.00 : 9.00),
              conversionRate: Math.round((((stats.premiumUsers || 0) + 1) / (stats.totalUsers || 1)) * 100)
            }, { merge: true });
          }
          console.log(`Webhook Action Complete: User ${uid} upgraded successfully!`);
        } catch (dbErr: any) {
          console.error(`Database error during webhook processing: ${dbErr.message}`);
          return res.status(500).json({ error: "Database transaction failed" });
        }
      }
    }

    res.json({ received: true });
  });

  // Global JSON parser for other standard API routes
  app.use(express.json());

  // API Route: Create checkout session
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    try {
      const { plan, uid } = req.body;
      if (!plan || !uid) {
        return res.status(400).json({ error: "Missing subscription plan or user uid." });
      }

      // Check if Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        console.warn("STRIPE_SECRET_KEY is not set in project environment.");
        return res.status(400).json({
          error: "Stripe configuration is missing. Please define STRIPE_SECRET_KEY in Settings."
        });
      }

      const stripe = getStripe();
      const origin = req.headers.origin || process.env.APP_URL || "http://localhost:3000";

      console.log(`Initiating checkout: Plan=${plan}, UID=${uid}, Origin=${origin}`);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: plan === "yearly" ? "PDF & Image Suite Pro (Yearly)" : "PDF & Image Suite Pro (Monthly)",
                description: "Unlimited file processing, premium tools, and priority processing queues.",
              },
              unit_amount: plan === "yearly" ? 7900 : 900,
              recurring: {
                interval: plan === "yearly" ? "year" : "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}?stripe_success=true`,
        cancel_url: `${origin}?stripe_canceled=true`,
        metadata: {
          uid: uid,
          plan: plan,
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (err: any) {
      console.error(`Error creating checkout session: ${err.message}`);
      res.status(500).json({ error: err.message || "Failed to initiate Stripe Checkout Session." });
    }
  });

  // API Route: Download Stripe instructions guide
  app.get("/api/stripe/download-guide", (req, res) => {
    try {
      const format = req.query.format as string || "markdown";
      const filePath = path.join(process.cwd(), "STRIPE_SETUP_INSTRUCTIONS.md");
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Instruction file not found. Please contact support." });
      }

      const markdownContent = fs.readFileSync(filePath, "utf-8");

      if (format === "word") {
        // Simple and elegant HTML wrapper representing a Word Doc layout that MS Word natively converts
        const htmlDoc = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <title>Stripe Production Setup Guide</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; padding: 30px; max-width: 800px; margin: 0 auto; }
              h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px; font-size: 24pt; }
              h2 { color: #1e293b; margin-top: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; font-size: 18pt; }
              h3 { color: #334155; margin-top: 15px; font-size: 14pt; }
              p, li { font-size: 11pt; }
              code { font-family: 'Consolas', Courier, monospace; background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-size: 10pt; color: #d63384; }
              pre { font-family: 'Consolas', Courier, monospace; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; overflow-x: auto; margin: 15px 0; font-size: 10pt; }
              ul, ol { margin-bottom: 15px; padding-left: 20px; }
              li { margin-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 10pt; }
              th { background-color: #f1f5f9; font-weight: bold; }
            </style>
          </head>
          <body>
            ${markdownContent
              .replace(/# (.*)/g, '<h1>$1</h1>')
              .replace(/## (.*)/g, '<h2>$1</h2>')
              .replace(/### (.*)/g, '<h3>$1</h3>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/`(.*?)`/g, '<code>$1</code>')
              .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
              .replace(/- (.*)/g, '<li>$1</li>')
              .replace(/\n\n/g, '<p></p>')
            }
          </body>
          </html>
        `;
        res.setHeader("Content-disposition", "attachment; filename=STRIPE_SETUP_INSTRUCTIONS.doc");
        res.setHeader("Content-type", "application/msword");
        return res.send(htmlDoc);
      }

      // Default: Markdown file
      res.setHeader("Content-disposition", "attachment; filename=STRIPE_SETUP_INSTRUCTIONS.md");
      res.setHeader("Content-type", "text/markdown");
      return res.send(markdownContent);
    } catch (err: any) {
      console.error(`Error downloading guide: ${err.message}`);
      res.status(500).json({ error: "Failed to download the instructions guide." });
    }
  });

  // Serve static assets in development / production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on port ${PORT}`);
  });
}

startServer();
