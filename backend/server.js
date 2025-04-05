import express from "express";
import { SmartAPI } from "smartapi-javascript";
import authRoutes from "./src/routes/auth.route.js";
import userRoutes from "./src/routes/user.route.js";
import brokerRoutes from "./src/routes/broker.route.js";
import userBrokerRoutes from "./src/routes/user-broker.route.js";
import { connectDB } from "./src/config/database.js";
import cors from "cors";
import { config } from "dotenv";
config({
  path: "./.env",
});

const app = express();

let smartAPI = new SmartAPI({
  api_key: "smartapi_key",
});

connectDB();

const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));



app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.get("/", (req, res) => res.send("Trading App"));
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/brokers", brokerRoutes);
app.use("/api/v1/user-brokers", userBrokerRoutes);

app.listen(3000, () => {
  console.log("App is live on 3000 port");
});
