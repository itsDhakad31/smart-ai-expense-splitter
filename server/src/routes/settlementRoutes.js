import { Router } from "express";
import { updateSettlementStatus } from "../controllers/settlementController.js";

const router = Router();

router.patch("/settlements/:settlementId", updateSettlementStatus);

export default router;

