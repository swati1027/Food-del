import { assets, url } from "../../assets/assets";
import "./Orders.css";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const STATUS_OPTIONS = ["Food Processing", "Out for Delivery", "Delivered"];

const Orders = () => {
  const [data, setData] = useState([]);

  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        setData(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    }
  }, []);

  const updateStatus = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      const response = await axios.put(`${url}/api/order/status`, {
        orderId,
        status: newStatus,
      });
      if (response.data.success) {
        await fetchAllOrders();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {data.map((order) => (
          <div key={order._id} className="order-item">
            <img src={assets.parcel_icon} alt="Parcel icon" />
            <div>
              <p className="order-item-food">
                {order.items
                  .map((item) => `${item.name} x ${item.quantity}`)
                  .join(", ")}
              </p>
              <p className="order-item-name">
                {order.address.firstName} {order.address.lastName}
              </p>
              <div className="order-item-address">
                <p>{order.address.street},</p>
                <p>
                  {order.address.city}, {order.address.state},{" "}
                  {order.address.country}, {order.address.zipCode}
                </p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p>${Number(order.amount).toFixed(2)}</p>
            <select
              onChange={(event) => updateStatus(event, order._id)}
              value={STATUS_OPTIONS.includes(order.status)
                ? order.status
                : "Food Processing"}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;