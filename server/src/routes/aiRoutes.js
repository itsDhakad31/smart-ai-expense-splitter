import { Router } from "express";
import { categorizeExpense, getInsights } from "../controllers/aiController.js";

const router = Router();

router.post("/categorize", categorizeExpense);
router.post("/insights", getInsights);

export default router;

