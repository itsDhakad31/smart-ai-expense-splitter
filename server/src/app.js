import express from "express";
import cors from "cors";
import groupRoutes from "./routes/groupRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import stateRoutes from "./routes/stateRoutes.js";
import settlementRoutes from "./routes/settlementRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api", stateRoutes);
app.use("/api", groupRoutes);
app.use("/api", expenseRoutes);
app.use("/api", settlementRoutes);
app.use("/api/ai", aiRoutes);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(error.statusCode || 500).json({
    message: error.message || "Something went wrong on the server."
  });
});

export default app;
