import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getAllUserBrokerConnections,
  getAllUsers,
  getUser,
  getUserProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", verifyToken, getUserProfile);
router.get("/all", verifyToken, getAllUsers);
router.get("/:userId", verifyToken, getUser);
router.get("/:id/broker-connections", verifyToken, getAllUserBrokerConnections);
export default router;
