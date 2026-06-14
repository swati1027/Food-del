import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials." });
    }
    const token = createToken(user._id);
    res.json({ success: true, token, userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.json({ success: false, message: "Error logging in." });
  }
};

const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists." });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email." });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token, userId: user._id });
  } catch (error) {
    console.error("Register error:", error);
    res.json({ success: false, message: "Error registering user." });
  }
};

export { loginUser, registerUser };