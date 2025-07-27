import express from "express";

import {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblems,
} from "../controllers/problem.controller.js";
import {
    isLogin,
    isValid
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/createProblem", isLogin, createProblem);
router.post("/updateProblem", isLogin, updateProblem);
router.get("/deleteProblem", isLogin, deleteProblem);
router.get("/getProblemById", isLogin, getProblemById);
router.get("/getAllProblems", isLogin, getAllProblems);




export default router;