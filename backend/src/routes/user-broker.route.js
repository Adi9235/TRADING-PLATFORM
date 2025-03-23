import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getAllUserBrokers,
  handleConnectBrokerHandler,
  getUserAllHoldings,
  getUserBrokerProfile,
  getUserOrderBook,
  getUserTradeBook,
  getUserPositions,
  getUserRMS,
  handleDisconnectBrokerHandler,
} from "../controllers/user-broker.controller.js";

const router = express.Router();

router.get("/all", verifyToken, getAllUserBrokers);
router.post("/connect", verifyToken, handleConnectBrokerHandler);
router.post("/disconnect", verifyToken, handleDisconnectBrokerHandler);
router.get("/:brokerId/profile", verifyToken, getUserBrokerProfile);
router.get("/:brokerId/all-holdings", verifyToken, getUserAllHoldings);
router.get("/:brokerId/order-book", verifyToken, getUserOrderBook);
router.get("/:brokerId/trade-book", verifyToken, getUserTradeBook);
router.get("/:brokerId/positions", verifyToken, getUserPositions);
router.get("/:brokerId/rms", verifyToken, getUserRMS);
export default router;
