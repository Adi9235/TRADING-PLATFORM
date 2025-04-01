import Broker from "../models/broker.model.js";

const createBrokerID = (name) => {
  return name?.toUpperCase().split(" ").join("_");
};

const areAllUnique = (arr) => {
  return new Set(arr).size === arr.length;
};

export const handleCreateBrokerController = async (req, res) => {
  try {
    const {
      name,
      logo,
      supportedExchanges,
      apiKey,
      apiSecret,
      connectionFields,
    } = req.body;

    const brokerId = createBrokerID(name);
    const isNameAvail = await Broker.countDocuments({ brokerId });

    if (isNameAvail > 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a unique broker name",
      });
    }

    if (!areAllUnique(connectionFields)) {
      return res.status(400).json({
        success: false,
        message: "All connection fields should be unique",
      });
    }

    const broker = await Broker.create({
      name,
      brokerId,
      logo,
      supportedExchanges,
      apiKey,
      apiSecret,
      connectionFields,
    });

    return res.status(201).json({
      success: true,
      message: "Broker created successfully",
      data: broker,
    });
  } catch (error) {
    console.log("Error in handleCreateBrokerController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const handleEditBrokerController = async (req, res) => {
  try {
    const {
      _id,
      apiUrl,
      logo,
      supportedExchanges,
      apiKey,
      apiSecret,
      connectionFields,
    } = req.body;

    if (!areAllUnique(connectionFields)) {
      return res.status(400).json({
        success: false,
        message: "All connection fields should be unique",
      });
    }

    const broker = await Broker.findById(_id);
    if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Broker not found",
      });
    }
    if (apiUrl) broker.apiUrl = apiUrl;
    if (logo) broker.logo = logo;
    if (supportedExchanges) broker.supportedExchanges = supportedExchanges;
    if (apiKey) broker.apiKey = apiKey;
    if (apiSecret) broker.apiSecret = apiSecret;
    broker.connectionFields = connectionFields;

    await broker.save();

    return res.status(200).json({
      success: true,
      message: "Broker updated successfully",
      data: broker,
    });
  } catch (error) {
    console.log("Error in handleEditBrokerController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllBrokers = async (req, res) => {
  try {
    const brokers = await Broker.find();
    return res.status(200).json({
      success: true,
      message: "All brokers fetched",
      data: brokers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getBrokerDetails = async (req, res) => {
  const { brokerId } = req.params;
  if (!brokerId) {
    return res.status(404).json({
      success: false,
      message: "Broker Id is missing",
    });
  }
  try {
    const broker = await Broker.findById(brokerId);

    return res.status(200).json({
      success: true,
      message: "Broker data fetched",
      data: broker,
    });
  } catch (error) {}
};
