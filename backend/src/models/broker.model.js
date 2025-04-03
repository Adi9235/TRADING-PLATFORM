import mongoose from "mongoose";

const brokerSchema = new mongoose.Schema(
  {
    brokerId: { type: String, unique: true, required: true },
    name: { type: String, required: true, unique: true },
    description: {
      type: String,
    },
    logo: { type: String, required: true },
    apiUrl: { type: String },
    supportedExchanges: [
      {
        type: String,
        enum: [
          "NSE",
          "BSE",
          "MCX",
          "NCDEX",
          "ICEX",
          "NSE FX",
          "BSE FX",
          "MSEI",
          "IEX",
          "PXIL",
        ],
      },
    ],
    connectionFields: [
      {
        type: String,
      },
    ],
    apiKey: {
      type: String,
    },
    apiSecret: {
      type: String,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Broker", brokerSchema);
