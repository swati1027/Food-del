import express from "express";
import authMiddleware from "../middleware/auth.js"; // ← your actual path
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/place", authMiddleware, placeOrder);
router.post("/verify", verifyOrder);         // no auth needed — Stripe calls this
router.post("/userorders", authMiddleware, userOrders);
router.get("/list", listOrders);             // admin only — add admin middleware later
router.post("/status", updateStatus);         // ← also fix: was POST, should be PUT

export default router;