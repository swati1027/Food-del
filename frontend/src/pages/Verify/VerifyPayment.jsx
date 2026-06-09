import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const VerifyPayment = () => {
  const { url, setCartItems } = useContext(StoreContext);
  const [status, setStatus] = useState("Verifying payment...");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const query = new URLSearchParams(location.search);
      const success = query.get("success");
      const orderId = query.get("orderId");

      if (!orderId) {
        setStatus("❌ Invalid request.");
        return;
      }

      try {
        await axios.post(`${url}/api/order/verify`, {
          success,
          orderId
        });

        if (success === "true") {
          setStatus("✅ Payment successful! Redirecting...");
          setCartItems({});                              // ✅ clear cart
          setTimeout(() => navigate("/myorders"), 2000); // ✅ go to my orders
        } else {
          setStatus("❌ Payment cancelled. Redirecting...");
          setTimeout(() => navigate("/"), 2000);         // ✅ go home on cancel
        }
      } catch (error) {
        console.error(error);
        setStatus("❌ Error verifying payment.");
      }
    };

    verifyPayment();
  }, [location.search, url]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>{status}</h2>
    </div>
  );
};

export default VerifyPayment;