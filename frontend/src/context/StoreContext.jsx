import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {

  const url = "https://food-del-backend-p3jv.onrender.com";

  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState(""); // ✅ ADDED
  const [food_list, setFoodList] = useState([]);

  // ---------- FETCH FOOD ----------
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
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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
  const loadCartData = async (savedToken) => {
    try {
      const response = await axios.get(`${url}/api/cart/get`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });
      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.error("Load cart failed:", error);
    }
  };

  // ---------- INIT ----------
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    const init = async () => {
      await fetchFoodList();

      if (storedToken && storedUserId) {
        setToken(storedToken);
        setUserId(storedUserId); // ✅ FIX
        await loadCartData(storedToken);
      }
    };

    init();
  }, []);

  // ---------- CONTEXT ----------
  const contextValue = {
    food_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    userId,       // ✅ EXPORT
    setUserId,    // ✅ EXPORT
    url,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
