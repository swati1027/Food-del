import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const PlaceOrder = () => {
  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    url,
    userId // ✅ make sure this exists in context
  } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

 const placeOrder = async (event) => {
  event.preventDefault();

  // ✅ login check
  if (!token || !userId) {
    alert("Please login first");
    return;
  }

  // ✅ empty cart check
  if (getTotalCartAmount() === 0) {
    alert("Cart is empty");
    return;
  }

  try {
    const orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: cartItems[item._id]
      }));

    const orderData = {
      userId,
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
    };

    const response = await axios.post(
      `${url}/api/order/place`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.data.success) {
      window.location.replace(response.data.session_url);
    } else {
      alert(response.data.message);
    }

  } catch (error) {
    console.error("Order Error:", error);
    alert("Something went wrong!");
  }
};


  return (
    <form className="place-order" onSubmit={placeOrder}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>

        <div className="multi-fields">
          <input required name="firstName" onChange={handleChange} value={data.firstName} type="text" placeholder="First Name" />
          <input required name="lastName" onChange={handleChange} value={data.lastName} type="text" placeholder="Last Name" />
        </div>

        <input required name="email" onChange={handleChange} value={data.email} type="email" placeholder="Email address" />
        <input required name="street" onChange={handleChange} value={data.street} type="text" placeholder="Street" />

        <div className="multi-fields">
          <input required name="city" onChange={handleChange} value={data.city} type="text" placeholder="City" />
          <input required name="state" onChange={handleChange} value={data.state} type="text" placeholder="State" />
        </div>

        <div className="multi-fields">
          <input required name="zipCode" onChange={handleChange} value={data.zipCode} type="text" placeholder="Zip code" />
          <input required name="country" onChange={handleChange} value={data.country} type="text" placeholder="Country" />
        </div>

        <input required name="phone" onChange={handleChange} value={data.phone} type="text" placeholder="Phone" />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <b>Total</b>
            <b>
              ₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
            </b>
          </div>

          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
