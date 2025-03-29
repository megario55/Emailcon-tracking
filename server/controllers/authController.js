import jwt from "jsonwebtoken";
import User from '../models/User.js';
import { encryptPassword } from "../config/encryption.js";


const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true); // Start loading

  try {
    const response = await axios.post(`${apiConfig.baseURL}/api/auth/signup`, {
      email,
      username,
      password,
      smtppassword,
    });

    toast.success(response.data.message || "Account created successfully!");

    setTimeout(() => {
      navigate("/");
    }, 4000);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.message;
      if (errorMessage.includes("User already exists")) {
        toast.info("User already exists. Please use a different email or username.");
      } else {
        toast.error(errorMessage);
      }
    } else {
      toast.error(error.response ? error.response.data.message : "Error signing up");
    }
  } finally {
    setIsLoading(false);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found.");
    if (!user.isActive) return res.status(403).send("Account not activated.");

    if (password !== user.password) {
      return res.status(401).send("Invalid credentials.");
    }

    const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (err) {
    res.status(500).send("Login failed.");
  }
};
