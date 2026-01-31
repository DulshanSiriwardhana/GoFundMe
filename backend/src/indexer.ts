import { ethers } from "ethers";
import dotenv from "dotenv";
import { Fund } from "./models/Fund.js";
import { FACTORY_ABI, FUND_ABI } from "./constants/abis.js";

dotenv.config();

const RPC_URL = process.env.LOCALHOST_RPC_URL || "http://localhost:8545";
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "";

export async function startIndexer() {
    console.log("Starting GoFundChain Indexer...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);

    // Initial Sync
    await syncAllFunds(factory, provider);

    // Listen for new funds
    factory.on("FundCreated", async (fundAddress, _creator, name) => {
        console.log(`New Fund Created: ${name} at ${fundAddress}`);
        await indexFund(fundAddress, provider);
    });
}

async function syncAllFunds(factory: any, provider: any) {
    try {
        const fundAddresses = await factory.getFunds();
        console.log(`Syncing ${fundAddresses.length} funds...`);
        for (const address of fundAddresses) {
            await indexFund(address, provider);
        }
        console.log("Initial sync complete.");
    } catch (error) {
        console.error("Sync failed:", error);
    }
}

async function indexFund(address: string, provider: any) {
    try {
        const fundContract = new ethers.Contract(address, FUND_ABI, provider);
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
                creator,
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
        console.log(`Indexed fund: ${name}`);
    } catch (error) {
        console.error(`Failed to index fund ${address}:`, error);
    }
}
