import { Router } from "express";
import {
  changepassword,
  login,
  logout,
  register,
} from "../controllers/authcontroller.js";
import { verifyTheUser } from "../middleware/verifyuser.js";

const router = Router();

router.post("/api/auth/register", register);
router.post("/api/auth/login", login);
router.post("/api/auth/logout", verifyTheUser, logout);

router.put("/api/auth/change-password", verifyTheUser, changepassword);

export default router;
