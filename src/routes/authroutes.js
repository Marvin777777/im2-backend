import { Router } from "express";
import {
  changepassword,
  login,
  logout,
  register,
} from "../controllers/authcontroller.js";

const router = Router();

router.post("/api/auth/register", register);
router.post("/api/auth/login", login);
router.post("/api/auth/logout", logout);

router.put("/api/auth/change-password", changepassword);

export default router;
