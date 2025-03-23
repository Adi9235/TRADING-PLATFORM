import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createBrokerSchema,
  editBrokerSchema,
} from "../validators/broker.validator.js";
import {
  getAllBrokers,
  getBrokerDetails,
  handleCreateBrokerController,
  handleEditBrokerController,
} from "../controllers/broker.controller.js";

const router = express.Router();

router.get("/all", verifyToken, getAllBrokers);
router.get("/broker/:brokerId", verifyToken, getBrokerDetails);
router.post(
  "/create",
  verifyToken,
  validate(createBrokerSchema),
  handleCreateBrokerController
);
router.put(
  "/update",
  verifyToken,
  validate(editBrokerSchema),
  handleEditBrokerController
);

export default router;
