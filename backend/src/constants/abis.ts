export const FACTORY_ABI = [
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: "address", name: "fund", type: "address" },
            { indexed: false, internalType: "address", name: "creator", type: "address" },
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
        inputs: [],
        name: "getFunds",
        outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
        stateMutability: "view",
        type: "function",
    },
] as const;

export const FUND_ABI = [
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
] as const;
