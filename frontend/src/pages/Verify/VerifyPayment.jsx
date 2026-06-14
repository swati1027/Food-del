import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect } from "react"; // ← add useContext
import { StoreContext } from "../../context/StoreContext"; // ← import context
import axios from "axios";
import "./Verify.css";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();
  const { url } = useContext(StoreContext); // ← get url from context

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.post(`${url}/api/order/verify`, {
          success,
          orderId,
        });
        navigate(response.data.success ? "/myorders" : "/");
      } catch (error) {
        console.error("Payment verification failed:", error);
        navigate("/");
      }
    };

    verifyPayment();
  }, [success, orderId, navigate]);

  return (
    <div className="verify">
      <div className="spinner"></div>
    </div>
  );
};

export default Verify;