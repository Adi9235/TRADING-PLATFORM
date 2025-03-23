import mongoose from "mongoose";

const userBrokerSchema = mongoose.Schema({
  brokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Broker",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  connectionDetails: {
    type: Map,
    of: String,
    required: true,
  },
  isConnected: {
    type: Boolean,
    default: false,
  },
  lastConnected: Date,
  jwtToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

export default mongoose.model("UserBroker", userBrokerSchema);
