import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { startIndexer } from "./indexer.js";
import { Fund } from "./models/Fund.js";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gofundme";

app.use(helmet());
app.use(cors());
app.use(express.json());

mongoose.connect(MONGODB_URI)
  .then(() => {
    startIndexer();
  })
  .catch(() => console.error("Database connection error"));

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/api/funds", async (req: Request, res: Response) => {
  try {
    const { search, sortBy = "createdAt", order = "desc" } = req.query;

    let query: any = {};
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } }
      ];
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = order === "desc" ? -1 : 1;

    const funds = await Fund.find(query).sort(sortOptions);

    res.json({
      funds,
      total: funds.length
    });
  } catch (_error) {
    res.status(500).json({ error: "Service Unavailable" });
  }
});

app.get("/api/funds/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const fund = await Fund.findOne({ address });

    if (!fund) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    res.json(fund);
  } catch (_error) {
    res.status(500).json({ error: "Service Unavailable" });
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((_err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`GoFundChain Protocol active on port ${PORT}`);
});
