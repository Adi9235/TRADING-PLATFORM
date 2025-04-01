import Broker from "../models/broker.model.js";
import UserBroker from "../models/user-broker.model.js";
import { TOTP } from "totp-generator";
import { SmartAPI } from "smartapi-javascript";
import axios from "axios";
import mongoose from "mongoose";

export const getAllUserBrokers = async (req, res) => {
  const { _id } = req.user;

  try {
    const brokers = await Broker.find();
    const userBrokers = await UserBroker.find({ userId: _id });

    const cleanedData = brokers.map((broker) => {
      const userBroker = userBrokers.find((userBroker) =>
        userBroker.brokerId.equals(broker._id)
      );

      return userBroker
        ? { ...broker.toObject(), userBroker: { ...userBroker.toObject() } }
        : { ...broker.toObject(), isConnected: false };
    });

    res.status(200).json({ success: true, data: cleanedData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const handleConnectBrokerHandler = async (req, res) => {
  const { _id } = req.user;
  const { brokerId, ...rest } = req.body;

  console.log("Received request to connect broker");
  console.log("User ID:", _id);
  console.log("Broker ID:", brokerId);
  console.log("Request Body (excluding brokerId):", rest);

  if (!brokerId) {
    console.error("Broker ID is missing");
    return res.status(404).json({
      success: false,
      message: "Broker Id is missing",
    });
  }

  try {
    console.log("Fetching broker details from DB...");
    const broker = await Broker.findById(brokerId);

    if (!broker) {
      console.error("Broker not found in DB");
      return res
        .status(404)
        .json({ success: false, message: "Broker not found" });
    }

    console.log("Broker found:", broker.name);
    console.log("Required fields for connection:", broker.connectionFields);

    const requiredFields = broker.connectionFields;
    const missingFields = requiredFields.filter((field) => !(field in rest));

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields,
      });
    }

    console.log("All required fields are present. Proceeding to connect...");
    const result = await connectToBroker(_id, broker, rest);

    console.log("Broker connection successful:", result);

    return res.status(200).json({
      success: true,
      message: `Successfully connected to ${broker.name}`,
      data: result,
    });
  } catch (error) {
    console.error("Error connecting to broker:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const handleConnectBrokerCallbackHandler = async (req, res) => {
  const { _id: userId } = req.user;
  const { brokerId, authToken, refreshToken, feedToken } = req.body;

  if (!brokerId) {
    console.error("Broker ID is missing");
    return res.status(404).json({
      success: false,
      message: "Broker Id is missing",
    });
  }

  try {
    console.log("Fetching broker details from DB...");
    const broker = await Broker.findOne({
      brokerId: brokerId,
    });

    if (!broker) {
      console.error("Broker not found in DB");
      return res
        .status(404)
        .json({ success: false, message: "Broker not found" });
    }

    let userAngelOneBroker = await UserBroker.findOne({
      brokerId: broker?._id,
      userId,
    });

    if (userAngelOneBroker) {
      userAngelOneBroker.isConnected = true;
      userAngelOneBroker.jwtToken = authToken;
      userAngelOneBroker.refreshToken = refreshToken;
      userAngelOneBroker.feedToken = feedToken;
      await userAngelOneBroker.save();
    } else {
      userAngelOneBroker = new UserBroker({
        userId,
        brokerId: broker._id,
        isConnected: true,
        jwtToken: authToken,
        refreshToken: refreshToken,
        feedToken: feedToken,
      });
      await userAngelOneBroker.save();
    }

    return res.status(200).json({
      success: true,
      message: `Successfully connected to ${broker.name}`,
    });
  } catch (error) {
    console.error("Error connecting to broker:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const handleDisconnectBrokerHandler = async (req, res) => {
  try {
    const { brokerId } = req.body;
    const userId =
      req.query.userId && req.user.role === "ADMIN"
        ? new mongoose.Types.ObjectId(req.query.userId)
        : req.user._id;

    if (!brokerId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Broker ID and User ID are required.",
      });
    }

    const userBroker = await UserBroker.findOne({ brokerId, userId }).populate(
      "brokerId"
    );

    if (!userBroker || !userBroker.isConnected) {
      return res.status(404).json({
        success: false,
        message: "User-broker connection not established or expired.",
      });
    }

    let response;
    switch (userBroker.brokerId.brokerId) {
      case "ANGEL_ONE":
        if (!userBroker.jwtToken) {
          return res.status(401).json({
            success: false,
            message: "Missing JWT Token for Angel One.",
          });
        }

        try {
          response = await axios.post(
            "https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/logout",
            {
              client_code: userBroker?.connectionFields?.client_id,
            },
            {
              headers: {
                Authorization: `Bearer ${userBroker.jwtToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
                "X-PrivateKey": userBroker.brokerId.apiKey,
                "X-ClientLocalIP": "103.120.251.200",
                "X-ClientPublicIP": "103.120.251.200",
                "X-MACAddress": "00:00:00:00:00:00",
              },
            }
          );

          if (response?.data?.status === false) {
            return res.status(400).json({
              success: false,
              message:
                response?.data?.message || "Failed to disconnect broker.",
              error: response?.data,
            });
          }
        } catch (axiosError) {
          return res.status(502).json({
            success: false,
            message: "Failed to disconnect from Angel One.",
            error: axiosError?.response?.data || axiosError.message,
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported broker.",
        });
    }

    userBroker.isConnected = false;
    await userBroker.save();

    return res.status(200).json({
      success: true,
      message: "Broker disconnected successfully.",
      data: response?.data || {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

const connectToBroker = async (userId, broker, credentials) => {
  const brokerId = broker.brokerId;

  switch (brokerId) {
    case "ANGEL_ONE":
      return await connectToAngelOne(userId, broker, credentials);
  }
};

// EXG5ZWVP6C4ZIYAVEXCHVCOT7Y
// EXG5ZWVP6C4ZIYAVEXCHVCOT7Y;
const connectToAngelOne = async (userId, broker, credentials) => {
  try {
    console.log("Starting Angel One connection...");
    console.log("User ID:", userId);
    console.log("Broker Details:", broker);
    console.log("Received Credentials:", credentials);

    const smart_api = new SmartAPI({
      api_key: broker.apiKey,
    });

    const { client_id, password, totp: totpSecret } = credentials;
    console.log(
      "Extracted Credentials - Client ID:",
      client_id,
      "Password:",
      password,
      "TOTP Secret:",
      totpSecret
    );

    const { otp, expires } = TOTP.generate(totpSecret);
    console.log("Generated OTP:", otp, "Expires At:", expires);

    console.log("Sending login request to Angel One API...");
    const response = await smart_api.generateSession(client_id, password, otp);
    console.log("Angel One API Response:", response);

    if (!response.status) {
      console.error("Angel One connection failed.");
      return {
        success: false,
        message: "Connection failed",
      };
    }

    console.log("Checking if user-broker connection already exists in DB...");
    let userAngelOneBroker = await UserBroker.findOne({
      brokerId: broker?._id,
      userId,
    });

    if (userAngelOneBroker) {
      console.log("Existing user-broker connection found. Updating details...");
      userAngelOneBroker.connectionDetails = credentials;
      userAngelOneBroker.isConnected = true;
      userAngelOneBroker.jwtToken = response.data.jwtToken;
      userAngelOneBroker.refreshToken = response.data.refreshToken;
      await userAngelOneBroker.save();
    } else {
      console.log(
        "No existing user-broker connection found. Creating a new entry..."
      );
      userAngelOneBroker = new UserBroker({
        userId,
        brokerId: broker._id,
        connectionDetails: credentials,
        isConnected: true,
        jwtToken: response.data.jwtToken,
        refreshToken: response.data.refreshToken,
      });
      await userAngelOneBroker.save();
    }

    console.log("Angel One Connection Successful!");

    console.log("Fetching user profile from Angel One...");
    const profileResponse = await axios.get(
      "https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getRMS ",
      {
        headers: {
          Authorization: `Bearer ${response.data.jwtToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-UserType": "USER",
          "X-SourceID": "WEB",
          "X-PrivateKey": broker?.apiKey,
          "X-ClientLocalIP": "103.120.251.200",
          "X-ClientPublicIP": "103.120.251.200",
          "X-MACAddress": "00:00:00:00:00:00",
        },
      }
    );

    console.log("Profile response received:", profileResponse.data);
    const profileData = profileResponse.data;

    return {
      success: true,
      sessionToken: response.data.jwtToken,
      userId: response.data.clientId,
      profile: profileData,
    };
  } catch (error) {
    console.error("Angel One connection error:", error.message);
    return {
      success: false,
      message: "An error occurred while connecting.",
      error: error.message,
    };
  }
};
export const getUserBrokerProfile = async (req, res) => {
  const { brokerId } = req.params;
  console.log(req.params, "par");
  const userId =
    req.query.userId && req.user.role === "ADMIN"
      ? new mongoose.Types.ObjectId(req.query.userId)
      : req.user._id;

  console.log("Received request for broker profile.");
  console.log("Broker ID:", brokerId);
  console.log("User ID:", userId);

  //   Broker ID: 67dc75e6c7ef36bb5c48ec9e
  // User ID: new ObjectId('67deeba38afc39dedaa7d75b')

  try {
    if (!brokerId || !userId) {
      console.log("Missing required parameters: brokerId or userId.");
      return res.status(400).json({
        success: false,
        message: "Broker ID and User ID are required",
      });
    }

    console.log("Fetching UserBroker data...");
    const userBroker = await UserBroker.findOne({
      brokerId,
      userId,
    }).populate("brokerId");

    if (!userBroker) {
      console.log("UserBroker not found for the given brokerId and userId.");
      return res.status(404).json({
        success: false,
        message: "User broker connection not found",
      });
    }

    console.log("UserBroker found:", userBroker);
    if (!userBroker.isConnected) {
      console.log("User is not connected with the broker.");
      return res.status(404).json({
        success: false,
        message: "User broker connection not established or expired",
      });
    }

    console.log("Broker ID type:", userBroker?.brokerId?.brokerId);

    let response;
    switch (userBroker?.brokerId?.brokerId) {
      case "ANGEL_ONE":
        console.log("Fetching profile from Angel One...");
        try {
          response = await axios.get(
            "https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getProfile",
            {
              headers: {
                Authorization: `Bearer ${userBroker.jwtToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
                "X-PrivateKey": userBroker?.brokerId?.apiKey,
                "X-ClientLocalIP": "103.120.251.200",
                "X-ClientPublicIP": "103.120.251.200",
                "X-MACAddress": "00:00:00:00:00:00",
              },
            }
          );
          console.log("Angel One profile fetched successfully.");
        } catch (apiError) {
          console.error(
            "Error fetching Angel One profile:",
            apiError.response?.data || apiError.message
          );
          return res.status(500).json({
            success: false,
            message: "Failed to fetch Angel One profile",
            error: apiError.response?.data || apiError.message,
          });
        }
        break;

      default:
        console.log("Unsupported broker type.");
        return res.status(400).json({
          success: false,
          message: "Unsupported broker",
        });
    }

    console.log("Returning successful response.");
    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching broker profile:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.response?.data || error.message,
    });
  }
};

export const getUserAllHoldings = async (req, res) => {
  const { brokerId } = req.params;
  const userId =
    req.query.userId && req.user.role === "ADMIN"
      ? new mongoose.Types.ObjectId(req.query.userId)
      : req.user._id;

  console.log(userId, "hold");

  try {
    if (!brokerId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Broker ID and User ID are required",
      });
    }

    const userBroker = await UserBroker.findOne({ brokerId, userId }).populate(
      "brokerId"
    );

    if (!userBroker || !userBroker.isConnected) {
      return res.status(404).json({
        success: false,
        message: "User broker connection not established or expired",
      });
    }

    if (!userBroker?.brokerId?.brokerId) {
      return res.status(400).json({
        success: false,
        message: "Invalid broker details",
      });
    }

    console.log(
      "Fetching holdings for broker:",
      userBroker?.brokerId?.brokerId
    );

    let response;
    switch (userBroker?.brokerId?.brokerId) {
      case "ANGEL_ONE":
        if (!userBroker.jwtToken) {
          return res.status(401).json({
            success: false,
            message: "Authentication failed: Missing JWT Token",
          });
        }

        response = await axios.get(
          "https://apiconnect.angelone.in/rest/secure/angelbroking/portfolio/v1/getAllHolding",
          {
            headers: {
              Authorization: `Bearer ${userBroker.jwtToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-UserType": "USER",
              "X-SourceID": "WEB",
              "X-PrivateKey": userBroker?.brokerId?.apiKey,
              "X-ClientLocalIP": "103.120.251.200",
              "X-ClientPublicIP": "103.120.251.200",
              "X-MACAddress": "00:00:00:00:00:00",
            },
          }
        );
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported broker",
        });
    }

    console.log("Holdings API Response:", response?.data);

    return res.status(200).json({
      success: true,
      data: response?.data || {},
    });
  } catch (error) {
    console.error("Error fetching broker profile:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.response?.data || error.message,
    });
  }
};

export const getUserTradeBook = async (req, res) => {
  try {
    const { brokerId } = req.params;
    const userId =
      req.query.userId && req.user.role === "ADMIN"
        ? new mongoose.Types.ObjectId(req.query.userId)
        : req.user._id;

    if (!brokerId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Broker ID and User ID are required.",
      });
    }

    const userBroker = await UserBroker.findOne({ brokerId, userId }).populate(
      "brokerId"
    );

    if (!userBroker || !userBroker.isConnected) {
      return res.status(404).json({
        success: false,
        message: "User-broker connection not established or expired.",
      });
    }

    const brokerDetails = userBroker?.brokerId;
    if (!brokerDetails?.brokerId) {
      return res.status(400).json({
        success: false,
        message: "Invalid broker details.",
      });
    }

    console.log("Fetching trade book for broker:", brokerDetails.brokerId);

    let response; // Declare response outside switch

    switch (brokerDetails.brokerId) {
      case "ANGEL_ONE":
        if (!userBroker.jwtToken) {
          return res.status(401).json({
            success: false,
            message: "Authentication failed: Missing JWT Token.",
          });
        }

        try {
          response = await axios.get(
            "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getTradeBook",
            {
              headers: {
                Authorization: `Bearer ${userBroker.jwtToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
                "X-PrivateKey": brokerDetails.apiKey,
                "X-ClientLocalIP": "103.120.251.200",
                "X-ClientPublicIP": "103.120.251.200",
                "X-MACAddress": "00:00:00:00:00:00",
              },
            }
          );
        } catch (axiosError) {
          console.error(
            "Error fetching trade book from Angel One:",
            axiosError?.response?.data || axiosError.message
          );
          return res.status(502).json({
            success: false,
            message: "Failed to fetch trade book from Angel One.",
            error: axiosError?.response?.data || axiosError.message,
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported broker.",
        });
    }

    if (!response || !response.data) {
      return res.status(500).json({
        success: false,
        message: "Invalid response from broker API.",
      });
    }

    return res.status(200).json({
      success: true,
      data: response.data, // Now response is correctly assigned
    });
  } catch (error) {
    console.error("Error in getUserTradeBook:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

export const getUserOrderBook = async (req, res) => {
  try {
    const { brokerId } = req.params;
    const userId =
      req.query.userId && req.user.role === "ADMIN"
        ? new mongoose.Types.ObjectId(req.query.userId)
        : req.user._id;

    if (!brokerId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Broker ID and User ID are required.",
      });
    }

    const userBroker = await UserBroker.findOne({ brokerId, userId }).populate(
      "brokerId"
    );

    if (!userBroker || !userBroker.isConnected) {
      return res.status(404).json({
        success: false,
        message: "User-broker connection not established or expired.",
      });
    }

    const brokerDetails = userBroker?.brokerId;
    if (!brokerDetails?.brokerId) {
      return res.status(400).json({
        success: false,
        message: "Invalid broker details.",
      });
    }

    console.log("Fetching order book for broker:", brokerDetails.brokerId);

    let response;
    switch (brokerDetails.brokerId) {
      case "ANGEL_ONE":
        if (!userBroker.jwtToken) {
          return res.status(401).json({
            success: false,
            message: "Authentication failed: Missing JWT Token.",
          });
        }

        try {
          response = await axios.get(
            "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getOrderBook",
            {
              headers: {
                Authorization: `Bearer ${userBroker.jwtToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
                "X-PrivateKey": brokerDetails.apiKey,
                "X-ClientLocalIP": "103.120.251.200",
                "X-ClientPublicIP": "103.120.251.200",
                "X-MACAddress": "00:00:00:00:00:00",
              },
            }
          );
        } catch (axiosError) {
          console.error(
            "Error fetching order book from Angel One:",
            axiosError?.response?.data || axiosError.message
          );
          return res.status(502).json({
            success: false,
            message: "Failed to fetch order book from Angel One.",
            error: axiosError?.response?.data || axiosError.message,
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported broker.",
        });
    }

    console.log("Order Book API Response:", response?.data);

    return res.status(200).json({
      success: true,
      data: response?.data || {},
    });
  } catch (error) {
    console.error("Error in getUserOrderBook:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

export const getUserPositions = async (req, res) => {
  try {
    const { brokerId } = req.params;
    const userId =
      req.query.userId && req.user.role === "ADMIN"
        ? new mongoose.Types.ObjectId(req.query.userId)
        : req.user._id;

    if (!brokerId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Broker ID and User ID are required.",
      });
    }

    const userBroker = await UserBroker.findOne({ brokerId, userId }).populate(
      "brokerId"
    );

    if (!userBroker || !userBroker.isConnected) {
      return res.status(404).json({
        success: false,
        message: "User-broker connection not established or expired.",
      });
    }

    const brokerDetails = userBroker?.brokerId;
    if (!brokerDetails?.brokerId) {
      return res.status(400).json({
        success: false,
        message: "Invalid broker details.",
      });
    }

    console.log("Fetching user positions for broker:", brokerDetails.brokerId);

    let response;
    switch (brokerDetails.brokerId) {
      case "ANGEL_ONE":
        if (!userBroker.jwtToken) {
          return res.status(401).json({
            success: false,
            message: "Authentication failed: Missing JWT Token.",
          });
        }

        try {
          response = await axios.get(
            "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getPosition",
            {
              headers: {
                Authorization: `Bearer ${userBroker.jwtToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
                "X-PrivateKey": brokerDetails.apiKey,
                "X-ClientLocalIP": "103.120.251.200",
                "X-ClientPublicIP": "103.120.251.200",
                "X-MACAddress": "00:00:00:00:00:00",
              },
            }
          );
        } catch (axiosError) {
          console.error(
            "Error fetching positions from Angel One:",
            axiosError?.response?.data || axiosError.message
          );
          return res.status(502).json({
            success: false,
            message: "Failed to fetch user positions from Angel One.",
            error: axiosError?.response?.data || axiosError.message,
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported broker.",
        });
    }

    console.log("User Positions API Response:", response?.data);

    return res.status(200).json({
      success: true,
      data: response?.data || {},
    });
  } catch (error) {
    console.error("Error in getUserPositions:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

export const getUserRMS = async (req, res) => {
  console.log("Received request to fetch user RMS.");

  try {
    const { brokerId } = req.params;
    const userId =
      req.query.userId && req.user.role === "ADMIN"
        ? new mongoose.Types.ObjectId(req.query.userId)
        : req.user._id;

    console.log("Broker ID:", brokerId);
    console.log("User ID:", userId);

    if (!brokerId || !userId) {
      console.error("Broker ID and User ID are required.");
      return res.status(400).json({
        success: false,
        message: "Broker ID and User ID are required.",
      });
    }

    console.log("Fetching UserBroker data...");
    const userBroker = await UserBroker.findOne({ brokerId, userId }).populate(
      "brokerId"
    );

    if (!userBroker || !userBroker.isConnected) {
      console.error("User-broker connection not found or expired.");
      return res.status(404).json({
        success: false,
        message: "User-broker connection not established or expired.",
      });
    }

    const brokerDetails = userBroker?.brokerId;
    if (!brokerDetails?.brokerId) {
      console.error("Invalid broker details.");
      return res.status(400).json({
        success: false,
        message: "Invalid broker details.",
      });
    }

    console.log("Fetching RMS for broker:", brokerDetails.brokerId);

    let response;
    switch (brokerDetails.brokerId) {
      case "ANGEL_ONE":
        if (!userBroker.jwtToken) {
          console.error("Missing JWT Token for Angel One.");
          return res.status(401).json({
            success: false,
            message: "Authentication failed: Missing JWT Token.",
          });
        }

        console.log("Sending request to Angel One API...");
        try {
          response = await axios.get(
            "https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getRMS",
            {
              headers: {
                Authorization: `Bearer ${userBroker.jwtToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
                "X-PrivateKey": brokerDetails.apiKey,
                "X-ClientLocalIP": "103.120.251.200",
                "X-ClientPublicIP": "103.120.251.200",
                "X-MACAddress": "00:00:00:00:00:00",
              },
            }
          );
          console.log("Angel One API Response:", response?.data);
        } catch (axiosError) {
          console.error(
            "Error fetching RMS from Angel One:",
            axiosError?.response?.data || axiosError.message
          );
          return res.status(502).json({
            success: false,
            message: "Failed to fetch RMS from Angel One.",
            error: axiosError?.response?.data || axiosError.message,
          });
        }
        break;

      default:
        console.error("Unsupported broker:", brokerDetails.brokerId);
        return res.status(400).json({
          success: false,
          message: "Unsupported broker.",
        });
    }

    console.log("Successfully fetched user RMS.");
    return res.status(200).json({
      success: true,
      data: response?.data || {},
    });
  } catch (error) {
    console.error("Error in getUserRMS:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

export const handlePlaceOrderHandler = async (req, res) => {
  const {
    brokerId,
    variety,
    tradingsymbol,
    symboltoken,
    transactiontype,
    exchange,
    ordertype,
    producttype,
    duration,
    disclosedquantity,
    quantity,
  } = req.body;

  const requiredFields = [
    brokerId,
    variety,
    tradingsymbol,
    symboltoken,
    transactiontype,
    exchange,
    ordertype,
    producttype,
    duration,
    disclosedquantity,
    quantity,
  ];

  if (requiredFields.some((field) => !field)) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const broker = await Broker.findById(brokerId);
    if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Broker not found",
      });
    }

    const userBroker = await UserBroker.findOne({
      brokerId: broker._id,
      userId: req.user._id,
    });

    if (!userBroker || !userBroker.isConnected) {
      return res.status(404).json({
        success: false,
        message: "User broker connection not established or expired",
      });
    }

    switch (broker.brokerId) {
      case "ANGEL_ONE":
        if (!userBroker.jwtToken) {
          return res.status(401).json({
            success: false,
            message: "Authentication failed: Missing JWT Token.",
          });
        }

        const response = await placeOrderAngelOne(broker, userBroker, req.body);
        if (response?.data?.status === false) {
          return res.status(400).json({
            success: false,
            message: response?.data?.message || "Failed to place order.",
            error: response?.data,
          });
        }
        return res.status(200).json({
          success: true,
          message: response?.data?.message || "Order placed successfully",
          data: response.data,
        });

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported broker",
        });
    }
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const placeOrderAngelOne = async (broker, userBroker, orderDetails) => {
  try {
    const response = await axios.post(
      "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/placeOrder",
      {
        exchange: orderDetails.exchange,
        tradingsymbol: orderDetails.tradingsymbol,
        symboltoken: orderDetails.symboltoken,
        quantity: Number(orderDetails.quantity),
        disclosedquantity: Number(orderDetails.disclosedquantity),
        transactiontype: orderDetails.transactiontype,
        ordertype: orderDetails.ordertype,
        variety: orderDetails.variety,
        producttype: orderDetails.producttype,
        duration: orderDetails.duration,
      },
      {
        headers: {
          Authorization: `Bearer ${userBroker.jwtToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-UserType": "USER",
          "X-SourceID": "WEB",
          "X-PrivateKey": broker.apiKey,
          "X-ClientLocalIP": "103.120.251.200",
          "X-ClientPublicIP": "103.120.251.200",
          "X-MACAddress": "00:00:00:00:00:00",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error placing order with Angel One:", error);
    throw new Error("Failed to place order with Angel One");
  }
};
