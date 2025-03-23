import User from "../models/user.model.js";

import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    console.log("Incoming request headers:", req.headers);

    const token = req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      console.log("No token provided in headers.");
      return res.status(400).json({
        message: "Unauthorized Request",
      });
    }

    console.log("Extracted Token:", token);
    console.log("JWT Secret:", process.env.JWT_SECRET);

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decodedToken);

    const user = await User.findById(decodedToken.userId).select("-password");
    console.log("Fetched User from DB:", user);

    if (!user) {
      console.log("User not found for decoded token _id.");
      return res.status(400).json({
        success: false,
        message: "Invalid Token",
      });
    }

    req.user = user;
    console.log("User attached to request:", req.user);
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
