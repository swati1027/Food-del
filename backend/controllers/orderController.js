import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// PLACE ORDER
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";

  try {
    console.log("📦 Place order request:", req.body);

    // ✅ Validate required fields
    if (!req.body.userId || !req.body.items || !req.body.amount || !req.body.address) {
      return res.json({
        success: false,
        message: "Missing required fields: userId, items, amount, address"
      });
    }

    if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.json({
        success: false,
        message: "Items must be a non-empty array"
      });
    }

    // ✅ Create order
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: false,
      status: "Pending"
    });

    await newOrder.save();
    console.log("✅ Order saved:", newOrder._id);

    // ✅ Clear cart
    await userModel.findByIdAndUpdate(req.body.userId, {
      cartData: {}
    });
    console.log("✅ Cart cleared for user:", req.body.userId);

    // ✅ Create Stripe line items
    const line_items = req.body.items.map((item) => {
      if (!item.name || !item.price || !item.quantity) {
        throw new Error("Each item must have name, price, and quantity");
      }
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name
          },
          unit_amount: Math.round(item.price * 100) // ✅ Ensure integer
        },
        quantity: item.quantity
      };
    });

    // ✅ Add delivery charges
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges"
        },
        unit_amount: 2 * 100
      },
      quantity: 1
    });

    console.log("📋 Line items:", line_items);

    // ✅ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
    });

    console.log("✅ Stripe session created:", session.id);

    res.json({
      success: true,
      session_url: session.url
    });

  } catch (error) {
    console.error("❌ PLACE ORDER ERROR:", error.message);
    console.error("Full error:", error);

    res.json({
      success: false,
      message: error.message || "Error placing order"
    });
  }
};

// VERIFY ORDER (after Stripe redirect)
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    console.log("🔍 Verify order:", { orderId, success });

    if (!orderId) {
      return res.json({
        success: false,
        message: "Order ID is required"
      });
    }

    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, {
        payment: true,
        status: "Food Processing"
      });

      console.log("✅ Order payment verified:", orderId);
      res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      console.log("❌ Payment failed, order deleted:", orderId);
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
      return res.json({
        success: false,
        message: "User ID is required"
      });
    }

    const orders = await orderModel.find({
      userId: req.body.userId
    });

    console.log(`📦 Found ${orders.length} orders for user:`, req.body.userId);
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
    console.log(`📦 Total orders in system: ${orders.length}`);
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
      return res.json({
        success: false,
        message: "Order ID and status are required"
      });
    }

    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status
    });

    console.log(`✅ Order status updated:`, req.body.orderId, "→", req.body.status);
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("❌ UPDATE STATUS ERROR:", error.message);
    res.json({ success: false, message: "Error updating status" });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus
};