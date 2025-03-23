import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const createUserToken = (id) => {
  console.log(process.env.JWT_SECRET);
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

export const handleRegisterController = async (req, res) => {
  const { name, email, password } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!name || !email || !password) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const isEmailAvailable = await User.findOne({ email }).session(session);
    if (isEmailAvailable) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "User already registered with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create(
      [{ name, email, password: hashedPassword, role: "USER" }],
      { session }
    );

    const token = createUserToken(user[0]._id);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      data: {
        id: user[0]._id,
        name: user[0].name,
        email: user[0].email,
        role: user[0].role,
      },
    });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const handleLoginController = async (req, res) => {
  const { email, password } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Login Request:", email);

    if (!email || !password) {
      console.log("Validation failed: Missing fields.");
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email }).session(session);
    if (!user) {
      console.log("User not found:", email);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      console.log("Password mismatch for:", email);
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = createUserToken(user._id);
    await session.commitTransaction();
    session.endSession();

    console.log("User logged in successfully:", user._id);

    return res.status(200).json({
      success: true,
      message: "Successfully Logged In",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const handleVerifyToken = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const token = req.headers["authorization"]?.replace("Bearer ", "");
    if (!token) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized Request" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId)
      .select("-password")
      .session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json({ success: true, message: "User is logged in", data: user });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
