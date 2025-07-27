import express from "express";

import {
    register,
    updateProfile,
    login,
    logOut
} from "../controllers/auth.controller.js";
import {
    isLogin,
    isValid
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.get("/login", login);
router.get("/logOut", isLogin, logOut);
router.post("/updateProfile", isLogin, updateProfile);

export default router;

