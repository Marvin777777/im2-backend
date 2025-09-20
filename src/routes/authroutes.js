import { Router } from "express";
import { login, logout, register } from "../controllers/authcontroller.js";

const router = Router();


router.post("/api/auth/register", register)
router.post("/api/auth/login", login)
router.post("/api/auth/logout", logout)



export default router;