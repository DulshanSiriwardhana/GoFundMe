import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Types
// Interface Fund is used as a type definition for documentation purposes

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
 * API Info
 */
app.get("/api/info", (_req: Request, res: Response) => {
  res.json({
    name: "GoFundMe Backend API",
    version: "1.0.0",
    description: "Decentralized Crowdfunding Platform API",
    endpoints: {
      health: "/health",
      chains: "/api/chains",
      funds: "/api/funds",
      fund: "/api/funds/:address",
      validate: "/api/validate/address",
    },
  });
});

/**
 * Get Supported Chains
 */
app.get("/api/chains", (_req: Request, res: Response) => {
  res.json({
    chains: [
      {
        id: 1,
        name: "Ethereum Mainnet",
        rpcUrl: process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com",
        blockExplorer: "https://etherscan.io",
      },
      {
        id: 11155111,
        name: "Sepolia Testnet",
        rpcUrl: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
        blockExplorer: "https://sepolia.etherscan.io",
      },
      {
        id: 31337,
        name: "Localhost",
        rpcUrl: "http://localhost:8545",
        blockExplorer: "N/A",
      },
    ],
  });
});

/**
 * Validate Ethereum Address
 */
app.post("/api/validate/address", (req: Request, res: Response) => {
  try {
    const { address } = req.body;

    if (!address) {
      res.status(400).json({ error: "Address is required" });
      return;
    }

    const isValid = ethers.isAddress(address);
    const checksumAddress = isValid ? ethers.getAddress(address) : null;

    res.json({
      address,
      isValid,
      checksumAddress,
      isContract: null, // Would need RPC call to determine
    });
  } catch (error) {
    res.status(500).json({ error: "Invalid request" });
    return;
  }
});

/**
 * Get All Funds (Cached from contract events)
 */
app.get("/api/funds", (_req: Request, res: Response) => {
  // This would typically fetch from MongoDB cache
  // which is populated by indexing contract events
  res.json({
    funds: [],
    total: 0,
    message: "Fund data should be indexed from blockchain events",
  });
});

/**
 * Get Fund Details
 */
app.get("/api/funds/:address", (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      res.status(400).json({ error: "Invalid address" });
      return;
    }

    // This would fetch from MongoDB or call contract directly
    res.json({
      address,
      message: "Fund details would be fetched from contract",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fund details" });
    return;
  }
});

/**
 * Convert ETH to USD (Optional price feed)
 */
app.get("/api/price/eth-usd", async (_req: Request, res: Response) => {
  try {
    // This could call a price oracle API
    res.json({
      eth: {
        usd: 2345.67, // Placeholder
        change24h: 5.23,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch price" });
    return;
  }
});

/**
 * Get Fund Activity/History
 */
app.get("/api/funds/:address/activity", (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      res.status(400).json({ error: "Invalid address" });
      return;
    }

    res.json({
      address,
      activity: [],
      message: "Activity would be indexed from blockchain events",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity" });
    return;
  }
});

/**
 * Get Contribution History
 */
app.get("/api/funds/:address/contributors/:contributor", (req: Request, res: Response) => {
  try {
    const { address, contributor } = req.params;

    if (!ethers.isAddress(address) || !ethers.isAddress(contributor)) {
      res.status(400).json({ error: "Invalid address" });
      return;
    }

    res.json({
      address,
      contributor,
      contributions: [],
      totalContributed: "0",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contributions" });
    return;
  }
});

/**
 * Get Withdrawal Requests
 */
app.get("/api/funds/:address/requests", (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      res.status(400).json({ error: "Invalid address" });
      return;
    }

    res.json({
      address,
      requests: [],
      message: "Requests would be fetched from contract",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch requests" });
    return;
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
║   GoFundMe Backend API                ║
║   Running on http://localhost:${PORT}      ║
║   Environment: ${process.env.NODE_ENV || "development"}              ║
╚═══════════════════════════════════════╝
  `);
});
