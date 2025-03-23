import express from "express";
import validate from "../middlewares/validate.middleware.js";
import {
  userLoginSchema,
  userRegisterationSchema,
} from "../validators/auth.validator.js";
import {
  handleLoginController,
  handleRegisterController,
  handleVerifyToken,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post(
  "/register",
  validate(userRegisterationSchema),
  handleRegisterController
);
router.post("/login", validate(userLoginSchema), handleLoginController);
router.get("/verify-token", handleVerifyToken);

export default router;
