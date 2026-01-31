import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { FUND_ABI, type FundData } from "../utils/contract";
import { Card } from "../components/ui/Card";
import { AlertCircle, Clock, Heart, Users, MapPin, Share2 } from "lucide-react";
import { useAlert } from "../context/AlertContext";

export default function FundDetails() {
    const { address } = useParams();
    const { provider, signer, account } = useWeb3();
    const [fund, setFund] = useState<FundData | null>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [donating, setDonating] = useState(false);
    const { showAlert } = useAlert();

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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
            showAlert("success", "Thank you! Your donation was successful.");
            loadFundData();
            setAmount("");
        } catch (error: unknown) {
            console.error("Donation failed:", error);
            let message = "Donation failed";
            if (error instanceof Error) {
                message = (error as { reason?: string }).reason || error.message;
            }
            showAlert("error", message);
        } finally {
            setDonating(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading campaign details...</div>;
    if (!fund) return <div className="text-center py-20">Campaign not found.</div>;

    const progress = Math.min((Number(fund.totalRaised) / Number(fund.goal)) * 100, 100);
    const timeLeft = Math.max(0, Math.ceil((fund.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Active Campaign
                    </div>
                    <h1 className="text-5xl font-black text-emerald-950 leading-[1.1] tracking-tight">
                        {fund.projectName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-emerald-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-600/20">
                                {fund.creator.substring(2, 4).toUpperCase()}
                            </div>
                            <span>
                                Created by <span className="text-emerald-950">{formatAddress(fund.creator)}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-400" />
                            <span>Ends {new Date(fund.deadline * 1000).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span>Global</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="aspect-video bg-emerald-50 border-emerald-100 flex items-center justify-center text-emerald-200 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br from-emerald-400/5 to-transparent" />
                        <span className="text-2xl font-black uppercase tracking-widest relative z-10">Campaign Image</span>
                        <div className="absolute bottom-6 right-6">
                            <button className="p-3 bg-white rounded-2xl shadow-xl border border-emerald-50 text-emerald-600 hover:scale-110 transition-transform">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </Card>

                    <Card className="p-10 border-emerald-100 bg-white shadow-xl shadow-emerald-900/5">
                        <h3 className="text-2xl font-black mb-6 text-emerald-950 uppercase tracking-tight">About this campaign</h3>
                        <p className="text-emerald-900/70 leading-loose text-lg font-medium">
                            This campaign is raising funds on the blockchain. Transparency and accountability are guaranteed by smart contracts.
                            Contributors can vote on how funds are spent. Join us in shaping the future of decentralized crowdfunding.
                        </p>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="p-10 sticky top-32 border-emerald-100 bg-white shadow-2xl shadow-emerald-900/10 scale-105 origin-top">
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-baseline justify-between mb-4">
                                    <span className="text-4xl font-black text-emerald-950 tracking-tighter">
                                        {parseFloat(fund.totalRaised).toFixed(3)}
                                    </span>
                                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">
                                        of {fund.goal} ETH Goal
                                    </span>
                                </div>
                                <div className="w-full bg-emerald-50 rounded-full h-4 overflow-hidden border border-emerald-100/50">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/40">
                                    <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {fund.contributorCount} Contributors</span>
                                    <span>{timeLeft} Days Left</span>
                                </div>
                            </div>

                            <div className="space-y-6 pt-8 border-t border-emerald-50">
                                <h4 className="font-black text-emerald-950 uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                                    Support this project
                                </h4>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-emerald-500 font-black text-xs">ETH</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        className="block w-full pl-14 pr-4 py-4.5 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl leading-5 text-emerald-950 font-black placeholder-emerald-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-lg"
                                        placeholder="0.10"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleDonate}
                                    disabled={donating || !account}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                                >
                                    {donating ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Back this project"
                                    )}
                                </button>
                                {!account && (
                                    <p className="text-[10px] text-center font-black uppercase tracking-widest text-amber-600 bg-amber-50 py-3 rounded-xl border border-amber-100 flex items-center justify-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
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
