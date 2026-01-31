import express from "express";
import { get } from "http";
import { getStreamToken } from "../controllers/chatController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router= express.Router();
router.get("/token", protectRoute ,getStreamToken);

export default router;