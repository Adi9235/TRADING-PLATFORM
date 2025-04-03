import UserBroker from "../models/user-broker.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    console.log(user);
    res.status(200).json({
      success: true,
      message: "User Info fetched",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getUser = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(404).json({
      success: false,
      message: "User ID not found",
    });
  }
  try {
    const user = await User.findById(userId).select("-password");
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getAllUserBrokerConnections = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const userBrokers = await UserBroker.find({ userId: id }).populate(
      "brokerId"
    );

    if (!userBrokers.length) {
      return res.status(404).json({
        success: false,
        message: "No broker connections found for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: userBrokers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
