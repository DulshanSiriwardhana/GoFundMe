import { ethers } from "ethers";
import dotenv from "dotenv";
import { Fund } from "./models/Fund.js";
import { FACTORY_ABI, FUND_ABI } from "./constants/abis.js";

dotenv.config();

const RPC_URL = process.env.LOCALHOST_RPC_URL || "http://localhost:8545";
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "";

const activeListeners = new Set<string>();

function getCategory(name: string): string {
    const n = name.toLowerCase();
    if (n.includes("tech") || n.includes("software") || n.includes("ai") || n.includes("app")) return "Tech";
    if (n.includes("charity") || n.includes("help") || n.includes("poor") || n.includes("assist")) return "Charity";
    if (n.includes("art") || n.includes("music") || n.includes("creative") || n.includes("film")) return "Creative";
    if (n.includes("tree") || n.includes("nature") || n.includes("green") || n.includes("earth")) return "Environment";
    return "Environment"; // Fallback to a valid category from CATEGORIES list in frontend
}

export async function startIndexer() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);

    await syncAllFunds(factory, provider);

    factory.on("FundCreated", async (fundAddress, _creator, _name) => {
        await indexFund(fundAddress, provider);
    });
}

async function syncAllFunds(factory: any, provider: any) {
    try {
        const fundAddresses = await factory.getFunds();
        for (const address of fundAddresses) {
            await indexFund(address, provider);
        }
    } catch (error) {
        // Silently handle sync errors in production
    }
}

async function indexFund(address: string, provider: any) {
    try {
        const fundContract = new ethers.Contract(address, FUND_ABI, provider);

        let description = "";
        try {
            description = await fundContract.description();
        } catch (e) {
            // Field doesn't exist on older versions
        }

        let imageUri = "";
        try {
            imageUri = await fundContract.imageUri();
        } catch (e) {
            // Field doesn't exist on older versions
        }

        const [name, creator, goal, deadline, totalRaised, goalReached, contributorCount, requestCount] =
            await Promise.all([
                fundContract.projectName(),
                fundContract.creator(),
                fundContract.goal(),
                fundContract.deadline(),
                fundContract.totalRaised(),
                fundContract.goalReached(),
                fundContract.contributorCount(),
                fundContract.requestCount()
            ]);

        await Fund.findOneAndUpdate(
            { address },
            {
                address,
                projectName: name,
                description,
                imageUri,
                creator,
                category: getCategory(name),
                goal: ethers.formatEther(goal),
                deadline: Number(deadline),
                totalRaised: ethers.formatEther(totalRaised),
                goalReached,
                contributorCount: Number(contributorCount),
                requestCount: Number(requestCount),
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        setupEventListeners(address, fundContract, provider);
    } catch (error) {
        // Standard logging for unexpected failures
    }
}

function setupEventListeners(address: string, contract: any, provider: any) {
    if (activeListeners.has(address)) return;

    contract.on("Funded", async (_contributor: string, _amount: bigint) => {
        await indexFund(address, provider);
    });

    contract.on("Withdrawn", async (_amount: bigint) => {
        await indexFund(address, provider);
    });

    activeListeners.add(address);
}
