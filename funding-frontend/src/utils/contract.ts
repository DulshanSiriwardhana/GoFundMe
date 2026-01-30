// Contract addresses and ABIs for smartcontracts2.0
// Update these with actual deployed addresses

export const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with deployed address
export const FUND_ADDRESS = import.meta.env.VITE_FUND_ADDRESS || ""; // Individual fund addresses from factory

export const FACTORY_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "fund", type: "address" },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "FundCreated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "goal", type: "uint256" },
      { internalType: "uint256", name: "duration", type: "uint256" },
    ],
    name: "createFund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "deployedFunds",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFunds",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const FUND_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_creator", type: "address" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "uint256", name: "_goal", type: "uint256" },
      { internalType: "uint256", name: "_duration", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "contributor", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "Funded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "purpose", type: "string" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "RequestCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "amount", type: "uint256" }],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [],
    name: "creator",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "projectName",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "goal",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deadline",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRaised",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "goalReached",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "contributions",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "contributorCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "requestCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "requests",
    outputs: [
      { internalType: "string", name: "purpose", type: "string" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bool", name: "completed", type: "bool" },
      { internalType: "uint256", name: "approvals", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "refund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "purpose", type: "string" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "createRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "voteRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "finalizeRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Types for better TypeScript support
export interface FundData {
  address: string;
  creator: string;
  projectName: string;
  goal: string;
  deadline: number;
  totalRaised: string;
  goalReached: boolean;
  contributorCount: number;
  requestCount: number;
}

export interface Request {
  id: number;
  purpose: string;
  amount: string;
  completed: boolean;
  approvals: number;
}
