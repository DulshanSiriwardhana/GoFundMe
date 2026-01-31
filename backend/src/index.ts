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

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database Connection & Indexer Startup
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    startIndexer();
  })
  .catch(err => console.error("MongoDB connection error:", err));

// Routes

/**
 * Health Check
 */
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Get All Funds with Search and Filtering
 */
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch funds" });
  }
});

/**
 * Get Fund Details
 */
app.get("/api/funds/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const fund = await Fund.findOne({ address });

    if (!fund) {
      res.status(404).json({ error: "Fund not found" });
      return;
    }

    res.json(fund);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fund details" });
  }
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
    method: req.method,
  });
});

// Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   GoFundChain Backend API             ║
║   Running on http://localhost:${PORT}      ║
║   Environment: ${process.env.NODE_ENV || "development"}              ║
╚═══════════════════════════════════════╝
  `);
});
