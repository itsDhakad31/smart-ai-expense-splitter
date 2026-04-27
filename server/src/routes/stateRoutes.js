import { Router } from "express";
import { getState } from "../controllers/settlementController.js";

const router = Router();

router.get("/state", getState);

export default router;
