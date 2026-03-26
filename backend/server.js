import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import Stripe from "stripe";
import orderModel from "./models/orderModel.js";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 4000;

// ✅ Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ STRIPE WEBHOOK (MUST BE BEFORE express.json)
app.post(
  "/api/order/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET // ✅ FIXED
      );
    } catch (err) {
      console.log("❌ Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ HANDLE EVENT
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const orderId = session.metadata?.orderId;

      if (orderId) {
        await orderModel.findByIdAndUpdate(orderId, {
          payment: true,
          status: "Food Processing",
        });

        console.log("✅ Payment verified via webhook");
      } else {
        console.log("⚠️ Order ID missing in metadata");
      }
    }

    res.status(200).json({ received: true });
  }
);

// ✅ NORMAL MIDDLEWARE (AFTER webhook)
app.use(express.json());
app.use(cors());

// ✅ DB connection
connectDB();

// ✅ ROUTES
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ✅ STATIC FILES
app.use("/images", express.static("uploads"));

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("API Working");
});

// ✅ START SERVER
app.listen(port, () => {
  console.log(`🚀 Server Started on http://localhost:${port}`);
});
