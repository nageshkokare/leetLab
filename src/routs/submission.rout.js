import express from "express";

import {
    submission,
    removeSubmission,
} from "../controllers/submission.controller.js";
import {isLogin, isValid} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.post("/submission", isLogin, submission);
router.post("/removeSubmission", isLogin, removeSubmission);

export default router;

