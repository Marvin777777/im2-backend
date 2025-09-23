import { Router } from "express";
import {
  changepassword,
  login,
  logout,
  onboarding,
  profilemanagement,
  register,
} from "../controllers/authcontroller.js";
import { verifyTheUser } from "../middleware/verifyuser.js";

const router = Router();

router.post("/api/auth/register", register);
router.post("/api/auth/login", login);
router.post("/api/auth/logout", verifyTheUser, logout);

router.put("/api/auth/onboarding", verifyTheUser, onboarding)

router.put("/api/auth/change_password", verifyTheUser, changepassword);
router.put("/api/auth/profile_management", verifyTheUser, profilemanagement);

export default router;
