const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(
  "stripe-secert-key" //replace with your seceret key
); // Replace with your actual secret key
const bodyParser = require("body-parser");

const app = express(); // Initialize app
app.use(express.json());
app.use(
  cors({
    origin: "http://yourwebsite",
  })
);
// Endpoint to create a PaymentIntent
app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Webhook endpoint to listen to Stripe events
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        "your-webhook-signing-secret" // Replace with your webhook signing secret from Stripe Dashboard
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("PaymentIntent was successful:", paymentIntent);
        break;
      // Handle other event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

// Server listens on port 3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
