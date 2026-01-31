import express from "express";
import {protectRoute} from "../middleware/protectRoute.js";
import { get } from "mongoose";
import { createSession, getActiveSessions, getMyRecentSessions, getSessionById, joinSession, endSession } from "../controllers/sessionController.js";
const router= express.Router();

router.post("/", protectRoute, createSession);
router.post("/active", protectRoute, getActiveSessions);
router.post("/my-recent", protectRoute, getMyRecentSessions);


router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);


export default router;