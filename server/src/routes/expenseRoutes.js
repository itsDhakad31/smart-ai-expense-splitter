import { Router } from "express";
import { createExpense } from "../controllers/expenseController.js";

const router = Router();

router.post("/expenses", createExpense);

export default router;

