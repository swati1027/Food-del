import { useContext, useEffect, useState } from "react";
import "./Login.css";
import { assets, url } from "../../assets/assets";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";

const Login = ({ setShowLogin }) => {
  const { setToken } = useContext(StoreContext);

  const [currentState, setCurrentState] = useState("Login");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Reset form when switching Login / Signup
  useEffect(() => {
    setData({ name: "", email: "", password: "" });
  }, [currentState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint =
        currentState === "Login" ? "/api/user/login" : "/api/user/register";

      const response = await axios.post(url + endpoint, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // SUCCESS
      if (response.data.success) {
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("userId", response.data.userId); // ✅ ADD THIS

  setToken(response.data.token);
  // you also need setUserId (next step)

  toast.success(response.data.message || "Success");
  setShowLogin(false);
}
 else {
        // Backend sent success:false
        toast.error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      // 🔥 THIS IS THE REAL FIX
      if (error.response) {
        // Backend responded with error (400, 401, 500)
        toast.error(
          error.response.data?.message || `Error ${error.response.status}`,
        );
      } else if (error.request) {
        // Backend not reachable
        toast.error("Backend not responding. Start the server.");
      } else {
        // Unknown error
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currentState}</h2>
          <img
            src={assets.cross_icon}
            alt="close"
            onClick={() => setShowLogin(false)}
          />
        </div>

        <div className="login-popup-inputs">
          {currentState === "Sign Up" && (
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          )}

          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            placeholder="Your email"
            required
          />

          <input
            type="password"
            name="password"
            value={data.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : currentState === "Sign Up"
                ? "Create account"
                : "Login"}
          </button>

          <div className="login-popup-condition">
            <input type="checkbox" required />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>

          {currentState === "Sign Up" ? (
            <p>
              Already have an account?{" "}
              <span onClick={() => setCurrentState("Login")}>Login here</span>
            </p>
          ) : (
            <p>
              Create a new account?{" "}
              <span onClick={() => setCurrentState("Sign Up")}>Click here</span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
