import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// PLACE ORDER
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5174";

  try {
    const userId = req.body.userId;

    if (!userId || !req.body.items || !req.body.amount || !req.body.address) {
      return res.json({
        success: false,
        message: "Missing required fields: userId, items, amount, address"
      });
    }

    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: false,
      status: "Pending"
    });

    await newOrder.save();

    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => {
      if (!item.name || !item.price || !item.quantity) {
        throw new Error("Each item must have name, price, and quantity");
      }
      return {
        price_data: {
          currency: "usd",  // ✅ changed from "inr"
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      };
    });

    line_items.push({
      price_data: {
        currency: "usd",  // ✅ changed from "inr"
        product_data: { name: "Delivery Charges" },
        unit_amount: 2 * 100
      },
      quantity: 1
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.error("❌ PLACE ORDER ERROR:", error.message);
    res.json({ success: false, message: error.message || "Error placing order" });
  }
};

// VERIFY ORDER
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    if (!orderId) {
      return res.json({ success: false, message: "Order ID is required" });
    }

    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, {
        payment: true,
        status: "Food Processing"
      });
      res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error("❌ VERIFY ORDER ERROR:", error.message);
    res.json({ success: false, message: "Error verifying order" });
  }
};

// USER ORDERS
const userOrders = async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ USER ORDERS ERROR:", error.message);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// ADMIN - LIST ORDERS
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ LIST ORDERS ERROR:", error.message);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// UPDATE STATUS
const updateStatus = async (req, res) => {
  try {
    if (!req.body.orderId || !req.body.status) {
      return res.json({ success: false, message: "Order ID and status are required" });
    }

    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("❌ UPDATE STATUS ERROR:", error.message);
    res.json({ success: false, message: "Error updating status" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };