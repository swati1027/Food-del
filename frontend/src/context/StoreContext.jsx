import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = "http://localhost:4000";
  const currency = "$";

  const getItem = (key) => {
    const val = localStorage.getItem(key);
    return val && val !== "undefined" ? val : "";
  };

  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(getItem("token"));
  const [food_list, setFoodList] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setFoodList(response.data.data);
      }
    } catch (error) {
      console.error("Food fetch failed:", error);
    }
  };

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (token) {
      try {
        await axios.post(`${url}/api/cart/add`, { itemId }, { headers: { token } });
      } catch (error) {
        console.error("Add to cart failed:", error);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] || 1) - 1, 0) }));
    if (token) {
      try {
        await axios.post(`${url}/api/cart/remove`, { itemId }, { headers: { token } });
      } catch (error) {
        console.error("Remove from cart failed:", error);
      }
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = food_list.find((p) => p._id === itemId);
        if (itemInfo) total += itemInfo.price * cartItems[itemId];
      }
    }
    return total;
  };

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
      if (retry) setTimeout(() => loadCartData(savedToken, false), 5000);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchFoodList();
      const storedToken = getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await loadCartData(storedToken);
      } else {
        localStorage.removeItem("token");
      }
      setIsLoaded(true);
    };

    init();

    const keepAlive = setInterval(() => {
      axios.get(`${url}/`).catch(() => {});
    }, 14 * 60 * 1000);

    return () => clearInterval(keepAlive);
  }, []);

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