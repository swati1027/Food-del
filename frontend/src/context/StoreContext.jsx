// eslint-disable-next-line react-refresh/only-export-components
import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {

  const url = "https://food-del-backend-p3jv.onrender.com";
  const currency = "$";

  const getItem = (key) => {
    const val = localStorage.getItem(key);
    return val && val !== "undefined" ? val : "";
  };

  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(getItem("token"));
  const [userId, setUserId] = useState(getItem("userId"));
  const [food_list, setFoodList] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); // ✅ prevent render before data ready

  // ---------- FETCH FOOD ----------
  const fetchFoodList = async () => {
    try {
      await axios.get(`${url}/`);
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setFoodList(response.data.data);
      }
    } catch (error) {
      console.error("Food fetch failed:", error);
    }
  };

  // ---------- ADD TO CART ----------
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Add to cart failed:", error);
      }
    }
  };

  // ---------- REMOVE FROM CART ----------
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 1) - 1, 0),
    }));

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Remove from cart failed:", error);
      }
    }
  };

  // ---------- TOTAL ----------
  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const quantity = cartItems[itemId];
      if (quantity > 0) {
        const itemInfo = food_list.find((p) => p._id === itemId);
        if (itemInfo) {
          total += itemInfo.price * quantity;
        }
      }
    }
    return total;
  };

  // ---------- LOAD CART ----------
  const loadCartData = async (savedToken, retry = true) => {
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { token: savedToken } }
      );
      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.error("Load cart failed:", error);
      if (retry) {
        setTimeout(() => loadCartData(savedToken, false), 5000);
      }
    }
  };

  // ---------- INIT ----------
  useEffect(() => {
    const init = async () => {
      await fetchFoodList(); // ✅ food list first

      const storedToken = getItem("token");
      const storedUserId = getItem("userId");

      if (!storedToken || !storedUserId) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsLoaded(true);
        return;
      }

      setToken(storedToken);
      setUserId(storedUserId);
      await loadCartData(storedToken); // ✅ then cart
      setIsLoaded(true); // ✅ mark as ready
    };

    init();

    const keepAlive = setInterval(() => {
      axios.get(`${url}/`).catch(() => {});
    }, 14 * 60 * 1000);

    return () => clearInterval(keepAlive);
  }, []);

  // ✅ Don't render children until data is loaded
  if (!isLoaded) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>Loading...</div>;
  }

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    userId,
    setUserId,
    url,
    currency,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;