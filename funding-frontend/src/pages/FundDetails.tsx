import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { FUND_ABI, type FundData } from "../utils/contract";
import { Card } from "../components/ui/Card";
import { Copy, Share2, AlertCircle } from "lucide-react";

export default function FundDetails() {
    const { address } = useParams();
    const { provider, signer, account } = useWeb3();
    const [fund, setFund] = useState<FundData | null>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [donating, setDonating] = useState(false);

    useEffect(() => {
        if (address && provider) {
            loadFundData();
        }
    }, [address, provider]);

    const loadFundData = async () => {
        if (!address || !provider) return;
        try {
            const contract = new ethers.Contract(address, FUND_ABI, provider);

            const creator = await contract.creator();
            const projectName = await contract.projectName();
            const goal = await contract.goal();
            const deadline = await contract.deadline();
            const totalRaised = await contract.totalRaised();
            const goalReached = await contract.goalReached();
            const contributorCount = await contract.contributorCount();
            const requestCount = await contract.requestCount();

            setFund({
                address,
                creator,
                projectName,
                goal: ethers.formatEther(goal),
                deadline: Number(deadline),
                totalRaised: ethers.formatEther(totalRaised),
                goalReached,
                contributorCount: Number(contributorCount),
                requestCount: Number(requestCount),
            });
        } catch (error) {
            console.error("Error loading fund:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDonate = async () => {
        if (!fund || !signer || !amount) return;
        setDonating(true);
        try {
            const contract = new ethers.Contract(fund.address, FUND_ABI, signer);
            const tx = await contract.deposit({ value: ethers.parseEther(amount) });
            await tx.wait();
            alert("Donation successful!");
            loadFundData();
            setAmount("");
        } catch (error: any) {
            console.error("Donation failed:", error);
            alert("Donation failed: " + (error.reason || error.message));
        } finally {
            setDonating(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading campaign details...</div>;
    if (!fund) return <div className="text-center py-20">Campaign not found.</div>;

    const progress = Math.min((Number(fund.totalRaised) / Number(fund.goal)) * 100, 100);
    const timeLeft = Math.max(0, Math.ceil((fund.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide">
                        Active Campaign
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">{fund.projectName}</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                            <span className="font-semibold text-slate-900">Created by:</span>
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{fund.creator.slice(0, 6)}...{fund.creator.slice(-4)}</span>
                        </span>
                        <span>•</span>
                        <span>{new Date(fund.deadline * 1000).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="aspect-video bg-slate-100 flex items-center justify-center text-slate-400">
                        {/* Placeholders for image */}
                        <span className="text-lg font-medium">Campaign Image Placeholder</span>
                    </Card>

                    <Card>
                        <h3 className="text-xl font-bold mb-4">About this campaign</h3>
                        <p className="text-slate-600 leading-relaxed">
                            This campaign is raising funds on the blockchain. Transparency and accountability are guaranteed by smart contracts.
                            Contributors can vote on how funds are spent.
                        </p>
                    </Card>
                </div>

                {/* Sidebar / Donation actions */}
                <div className="space-y-6">
                    <Card className="p-8 sticky top-24 border-indigo-100 shadow-indigo-100/50">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-3xl font-extrabold text-slate-900">{fund.totalRaised} ETH</span>
                                    <span className="text-sm font-medium text-slate-500">raised of {fund.goal} ETH goal</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-2 text-sm text-slate-500">
                                    <span>{fund.contributorCount} contributors</span>
                                    <span>{timeLeft} days left</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Amount to donate (ETH)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.1"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    />
                                    <div className="absolute right-4 top-3 text-slate-400 font-medium">ETH</div>
                                </div>
                                <button
                                    onClick={handleDonate}
                                    disabled={donating || !account}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                                >
                                    {donating ? "Processing..." : "Donate Now"}
                                </button>
                                {!account && (
                                    <p className="text-xs text-center text-amber-600 bg-amber-50 py-2 rounded">
                                        <AlertCircle className="w-3 h-3 inline mr-1" />
                                        Connect wallet to donate
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
