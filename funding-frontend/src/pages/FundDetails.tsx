import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { FUND_ABI, type FundData } from "../utils/contract";
import { Card } from "../components/ui/Card";
import { AlertCircle, Clock, Heart } from "lucide-react";

export default function FundDetails() {
    const { address } = useParams();
    const { provider, signer, account } = useWeb3();
    const [fund, setFund] = useState<FundData | null>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [donating, setDonating] = useState(false);

    const loadFundData = useCallback(async () => {
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
    }, [address, provider]);

    useEffect(() => {
        if (address && provider) {
            loadFundData();
        }
    }, [address, provider, loadFundData]);

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
        } catch (error: unknown) {
            console.error("Donation failed:", error);
            let message = "Donation failed";
            if (error instanceof Error) {
                message += ": " + (error.message);
            } else if (typeof error === 'object' && error !== null && 'reason' in error) {
                message += ": " + (error as { reason: string }).reason;
            }
            alert(message);
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
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wide">
                        Active Campaign
                    </div>
                    <h1 className="text-4xl font-extrabold text-white leading-tight">
                        {fund.projectName}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-emerald-200/70">
                        <div className="flex items-center gap-1.5">
                            <div className="w-8 h-8 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-emerald-900">
                                {fund.creator.substring(2, 4).toUpperCase()}
                            </div>
                            <span>
                                Created by <span className="font-semibold text-white">{fund.creator}</span>
                            </span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-emerald-700"></span>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(fund.deadline * 1000).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="aspect-video bg-emerald-900/30 border-emerald-800 flex items-center justify-center text-emerald-600/50">
                        <span className="text-lg font-medium">Campaign Image Placeholder</span>
                    </Card>

                    <Card className="bg-emerald-950 border-emerald-800">
                        <h3 className="text-xl font-bold mb-4 text-white">About this campaign</h3>
                        <p className="text-emerald-100/80 leading-relaxed">
                            This campaign is raising funds on the blockchain. Transparency and accountability are guaranteed by smart contracts.
                            Contributors can vote on how funds are spent.
                        </p>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-8 sticky top-24 bg-emerald-950 border-emerald-800 shadow-xl shadow-emerald-900/20">
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-baseline justify-between mb-2">
                                    <span className="text-3xl font-extrabold text-white">
                                        {parseFloat(fund.totalRaised).toFixed(4)}
                                    </span>
                                    <span className="text-sm font-semibold text-emerald-400">
                                        of {fund.goal} ETH goal
                                    </span>
                                </div>
                                <div className="w-full bg-emerald-900 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-3 text-sm text-emerald-200/60">
                                    <span>{fund.contributorCount} contributors</span>
                                    <span>{timeLeft} days left</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-emerald-800">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                                    Support this project
                                </h4>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-emerald-500 font-bold sm:text-sm">ETH</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        className="block w-full pl-12 pr-12 py-3 bg-emerald-900/50 border border-emerald-700 rounded-xl leading-5 text-white placeholder-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm transition-all"
                                        placeholder="0.1"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleDonate}
                                    disabled={donating || !account}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {donating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Donate Now"
                                    )}
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
