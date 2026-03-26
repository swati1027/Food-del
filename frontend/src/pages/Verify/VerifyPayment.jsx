import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const VerifyPayment = () => {
  const { url } = useContext(StoreContext);
  const [status, setStatus] = useState("Verifying payment...");
  const location = useLocation();

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
          setStatus("✅ Payment successful! Order placed.");
        } else {
          setStatus("❌ Payment cancelled.");
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
