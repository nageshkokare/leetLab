import express from "express";

import {
    createComment,
    showTheCommments,
} from "../controllers/comment.controller.js";

import {
    isLogin,
    isValid
} from "../middlewares/auth.middleware.js";



const router = express.Router();




router.post("/createComment", isLogin, createComment);
router.get("/showTheCommments", isLogin, showTheCommments);



export default router;


