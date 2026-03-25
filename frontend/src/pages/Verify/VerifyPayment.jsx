import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const VerifyPayment = () => {
  const { url, token } = useContext(StoreContext);
  const [status, setStatus] = useState("Verifying payment...");
  const location = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      const query = new URLSearchParams(location.search);

      const success = query.get("success");
      const sessionId =
        query.get("session_id") || query.get("orderId");

      if (success !== "true" || !sessionId) {
        setStatus("❌ Payment was cancelled or failed.");
        return;
      }

      try {
        const response = await axios.post(
          `${url}/api/order/capture`,
          { sessionId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setStatus("✅ Payment successful! Thank you for your order.");
        } else {
          setStatus("❌ Payment capture failed.");
        }
      } catch (error) {
        console.error("Payment verify error:", error.response?.data || error);
        setStatus("❌ Error verifying payment.");
      }
    };

    verifyPayment();
  }, [location.search, token, url]);

  return (
    <div style={{ padding: "30px", fontSize: "18px", textAlign: "center" }}>
      {status}
    </div>
  );
};

export default VerifyPayment;
