import "./MyOrders.css";
import { assets, url } from "../../assets/assets";
import { useContext, useEffect, useState, useCallback } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        { headers: { token } } // ✅ userId comes from token via middleware
      );
      if (response.data.success) {
        setData(response.data.data ?? []);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch orders.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      {error && <p className="my-orders-error">{error}</p>}
      <div className="container">
        {loading ? (
          <p>Loading orders...</p>
        ) : data.length === 0 && !error ? (
          <p>No orders found.</p>
        ) : (
          data.map((order) => (
            <div key={order._id} className="my-orders-order">
              <img src={assets.parcel_icon} alt="Parcel icon" />
              <p>{order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}</p>
              <p>${Number(order.amount).toFixed(2)}</p>
              <p>Items: {order.items.length}</p>
              <p><span>&#x25cf; </span><b>{order.status}</b></p>
              <button onClick={fetchOrders} disabled={loading}>Track Order</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;