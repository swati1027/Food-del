import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { assets } from '../../assets/assets'

const MyOrders = () => {

  const [data, setData] = useState([])
  const { token, url } = useContext(StoreContext)

  // ---------- FETCH ORDERS ----------
  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}` // ✅ FIXED
          }
        }
      )

      console.log("Orders:", response.data) // debug

      setData(response.data.data || [])
    } catch (error) {
      console.error("Order fetch failed:", error)
    }
  }

  // ---------- LOAD ON TOKEN ----------
  useEffect(() => {
    if (token) {
      fetchOrders()
    }
  }, [token])

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>

      <div className='container'>

        {/* ✅ If no orders */}
        {data.length === 0 ? (
          <p>No orders found</p>
        ) : (
          data.map((order, index) => (
            <div key={index} className="my-orders-order">

              <img src={assets.parcel_icon} alt="" />

              <p>
                {order.items.map((item, i) =>
                  i === order.items.length - 1
                    ? `₹{item.name} x ₹{item.quantity}`
                    : `₹{item.name} x ₹{item.quantity}, `
                )}
              </p>

              <p>₹{order.amount}.00</p>

              <p>Items: {order.items.length}</p>

              <p>
                <span>&#x25cf;</span>
                <b> {order.status}</b>
              </p>

              <button onClick={fetchOrders}>
                Track Order
              </button>

            </div>
          ))
        )}

      </div>
    </div>
  )
}

export default MyOrders
