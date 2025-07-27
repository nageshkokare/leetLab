import express from "express";


import {
    createPlaylist,
    deletePlaylist,
    getAllPlaylists,
    getSinglePlaylist,
    addProblem,
    removeProblem,
    problemsAddInList,
    problemsRemoveInList,
} from "../controllers/playlist.controller.js";

import {
    isLogin,
    isValid
} from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post("/createPlaylist", isLogin, createPlaylist);
router.get("/getSinglePlaylist", isLogin, getSinglePlaylist);
router.post("/addProblem", isLogin, addProblem)
router.post("/removeProblem", isLogin, removeProblem)

export default router;