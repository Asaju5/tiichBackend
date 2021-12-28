import express from "express";
import {
  currentUser,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  sendEmail,
} from "../Controllers/auth";
import { requireLogin } from "../middlewares";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/current-user", requireLogin, currentUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/send-email", sendEmail);

module.exports = router;
