import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { FUND_ABI, type FundData } from "../utils/contract";
import Loader from "../components/Loader";
import { Card } from "../components/ui/Card";
import { AlertCircle, Clock, Heart, ArrowLeft, Share2, Zap, Globe, TreePine, Shield, Plus, CheckCircle2, ThumbsUp, Wallet } from "lucide-react";
import { useAlert } from "../context/AlertContext";

export default function FundDetails() {
    const { address } = useParams();
    const navigate = useNavigate();
    const { provider, signer, account } = useWeb3();
    const [fund, setFund] = useState<FundData | null>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [donating, setDonating] = useState(false);

    // Request related state
    const [requestPurpose, setRequestPurpose] = useState("");
    const [requestAmount, setRequestAmount] = useState("");
    const [creatingRequest, setCreatingRequest] = useState(false);
    const [voting, setVoting] = useState<number | null>(null);
    const [finalizing, setFinalizing] = useState<number | null>(null);
    const [hasContributed, setHasContributed] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "requests">("details");

    const { showAlert } = useAlert();

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const loadFundData = useCallback(async () => {
        if (!address || !provider) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            let backendData = null;
            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
                const response = await fetch(`${apiBaseUrl}/api/funds/${address}`);
                if (response.ok) {
                    backendData = await response.json();
                }
            } catch (err) {
                // Backend fallback
            }

            const contract = new ethers.Contract(address, FUND_ABI, provider);

            // Fetch description separately to handle older contracts that might not have it
            let description = "";
            try {
                description = await contract.description();
            } catch (err) {
                console.warn("Description field not found on this contract version");
            }

            let imageUri = "";
            try {
                imageUri = await contract.imageUri();
            } catch (err) {
                console.warn("imageUri field not found on this contract version");
            }

            const [creator, projectName, goal, deadline, totalRaised, goalReached, contributorCount, requestCount] =
                await Promise.all([
                    contract.creator(),
                    contract.projectName(),
                    contract.goal(),
                    contract.deadline(),
                    contract.totalRaised(),
                    contract.goalReached(),
                    contract.contributorCount(),
                    contract.requestCount()
                ]);

            // Check if current user has contributed
            if (account) {
                const contribution = await contract.contributions(account);
                setHasContributed(contribution > 0n);
            }

            // Fetch requests
            const requests = [];
            const count = Number(requestCount);
            for (let i = 0; i < count; i++) {
                try {
                    const req = await contract.requests(i);
                    requests.push({
                        id: i,
                        purpose: req.purpose,
                        amount: ethers.formatEther(req.amount),
                        completed: req.completed,
                        approvals: Number(req.approvals)
                    });
                } catch (e) {
                    console.warn(`Failed to fetch request ${i}`);
                }
            }

            setFund({
                address,
                creator,
                projectName,
                description,
                imageUri,
                category: backendData?.category || "Community",
                goal: ethers.formatEther(goal),
                deadline: Number(deadline),
                totalRaised: ethers.formatEther(totalRaised),
                goalReached,
                contributorCount: Number(contributorCount),
                requestCount: Number(requestCount),
                requests: requests.reverse() // Newest first
            });
        } catch (error) {
            console.error("Error loading fund:", error);
            showAlert("error", "Failed to load campaign data");
        } finally {
            setLoading(false);
        }
    }, [address, provider, showAlert]);

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
            showAlert("success", "Fund supported! Donation successful.");
            loadFundData();
            setAmount("");
        } catch (error: any) {
            console.error("Donation failed:", error);
            showAlert("error", error.reason || "Transaction failed");
        } finally {
            setDonating(false);
        }
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fund || !signer || !requestPurpose || !requestAmount) return;
        setCreatingRequest(true);
        try {
            const contract = new ethers.Contract(fund.address, FUND_ABI, signer);
            const tx = await contract.createRequest(requestPurpose, ethers.parseEther(requestAmount));
            await tx.wait();
            showAlert("success", "Withdrawal request created!");
            setRequestPurpose("");
            setRequestAmount("");
            loadFundData();
        } catch (error: any) {
            console.error("Request failed:", error);
            showAlert("error", error.reason || "Failed to create request");
        } finally {
            setCreatingRequest(false);
        }
    };

    const handleVote = async (id: number) => {
        if (!fund || !signer) return;
        setVoting(id);
        try {
            const contract = new ethers.Contract(fund.address, FUND_ABI, signer);
            const tx = await contract.voteRequest(id);
            await tx.wait();
            showAlert("success", "Vote recorded!");
            loadFundData();
        } catch (error: any) {
            console.error("Voting failed:", error);
            showAlert("error", error.reason || "Voting failed. You may have already voted.");
        } finally {
            setVoting(null);
        }
    };

    const handleFinalize = async (id: number) => {
        if (!fund || !signer) return;
        setFinalizing(id);
        try {
            const contract = new ethers.Contract(fund.address, FUND_ABI, signer);
            const tx = await contract.finalizeRequest(id);
            await tx.wait();
            showAlert("success", "Request finalized and funds released!");
            loadFundData();
        } catch (error: any) {
            console.error("Finalization failed:", error);
            showAlert("error", error.reason || "Finalization failed");
        } finally {
            setFinalizing(null);
        }
    };

    const categoryConfig = useMemo(() => {
        const cat = fund?.category || "Community";
        switch (cat) {
            case "Tech": return { icon: Zap, color: "bg-blue-500", gradient: "from-blue-600 to-emerald-500" };
            case "Charity": return { icon: Heart, color: "bg-rose-500", gradient: "from-rose-600 to-ruby-500" };
            case "Creative": return { icon: Globe, color: "bg-purple-500", gradient: "from-purple-600 to-indigo-500" };
            case "Environment": return { icon: TreePine, color: "bg-emerald-500", gradient: "from-emerald-600 to-teal-500" };
            default: return { icon: Shield, color: "bg-emerald-700", gradient: "from-emerald-800 to-teal-900" };
        }
    }, [fund?.category]);

    if (loading) return (
        <Loader message="Syncing Campaign Data" />
    );

    if (!fund) return (
        <div className="text-center py-20 px-6 border border-emerald-50 rounded-2xl bg-white shadow-sm">
            <AlertCircle className="w-12 h-12 text-emerald-100 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-emerald-950 mb-4">Campaign Not Found</h2>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-emerald-600 text-white font-black rounded-xl">
                Back to Discovery
            </button>
        </div>
    );

    const progress = Math.min((parseFloat(fund.totalRaised) / parseFloat(fund.goal)) * 100, 100);
    const timeLeft = Math.max(0, Math.ceil((fund.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24)));
    const CategoryIcon = categoryConfig.icon;

    return (
        <div className="space-y-10 md:space-y-16 pb-24">
            <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-3 text-emerald-900/40 hover:text-emerald-600 font-black uppercase tracking-widest text-[10px] transition-all"
            >
                <ArrowLeft className="w-4 h-4" />
                Return to Discovery
            </button>

            <header className="space-y-6">
                <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        <CategoryIcon className="w-3 h-3" />
                        {fund.category}
                    </div>
                    {fund.creator.toLowerCase() === account?.toLowerCase() && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest border border-amber-100">
                            <Shield className="w-3 h-3" />
                            Creator Access
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 leading-tight tracking-tight break-words max-w-3xl">
                        {fund.projectName}
                    </h1>

                    <div className="flex bg-emerald-50 p-1.5 rounded-2xl border border-emerald-100 h-fit">
                        <button
                            onClick={() => setActiveTab("details")}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "details" ? "bg-white text-emerald-600 shadow-sm" : "text-emerald-900/40 hover:text-emerald-600"}`}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab("requests")}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "requests" ? "bg-white text-emerald-600 shadow-sm" : "text-emerald-900/40 hover:text-emerald-600"}`}
                        >
                            Requests ({fund.requests?.length || 0})
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 pt-2">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${categoryConfig.gradient} flex items-center justify-center text-white font-black text-sm shadow-sm`}>
                            {fund.creator.substring(2, 4).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">Creator</p>
                            <p className="font-bold text-emerald-950">{formatAddress(fund.creator)}</p>
                        </div>
                    </div>
                    <div className="hidden sm:block h-6 w-px bg-emerald-100" />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">Time Remaining</p>
                            <p className="font-bold text-emerald-950">{timeLeft} Days</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
                {activeTab === "details" ? (
                    <>
                        <main className="lg:col-span-8 space-y-10">
                            <div className="aspect-video rounded-3xl overflow-hidden relative group shadow-2xl shadow-emerald-950/20 border border-emerald-100">
                                {fund.imageUri ? (
                                    <img
                                        src={fund.imageUri}
                                        alt={fund.projectName}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop";
                                        }}
                                    />
                                ) : (
                                    <div className={`w-full h-full bg-linear-to-br ${categoryConfig.gradient} flex flex-col items-center justify-center`}>
                                        <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-5xl font-black shadow-inner">
                                            {fund.projectName.charAt(0)}
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent opacity-60" />
                                <button className="absolute bottom-6 right-6 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 text-emerald-600 hover:scale-110 active:scale-95 transition-all z-10">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-emerald-950 tracking-tight italic border-l-4 border-emerald-500 pl-4">Campaign Details</h3>
                                <div className="text-emerald-950/70 font-medium leading-relaxed space-y-4 text-base whitespace-pre-wrap break-words">
                                    <p>
                                        {fund.description || "This campaign is powered by the GoFundChain protocol, ensuring every donation is transparently handled by on-chain smart contracts."}
                                    </p>
                                    <p>
                                        Contributors are part of a global community supporting creative and charitable initiatives without intermediaries. Your participation directly fuels the creator's project.
                                    </p>
                                </div>
                            </div>
                        </main>

                        <aside className="lg:col-span-4 space-y-6">
                            <Card className="p-8 border border-emerald-100 rounded-2xl bg-white shadow-sm overflow-hidden relative">
                                <div className="space-y-8">
                                    <div className="space-y-7">
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-black text-emerald-800/60 uppercase tracking-widest">Funding Progress</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-black text-emerald-950 tracking-tighter">
                                                    {parseFloat(fund.totalRaised).toFixed(3)}
                                                </span>
                                                <span className="text-lg font-black text-emerald-500 uppercase tracking-tighter">ETH</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black text-emerald-800/60 uppercase tracking-widest pt-1">
                                                <span>{progress.toFixed(1)}% complete</span>
                                                <span>Target: {fund.goal} ETH</span>
                                            </div>
                                        </div>

                                        <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden border border-emerald-100/50">
                                            <div
                                                className={`h-full rounded-full bg-linear-to-r ${categoryConfig.gradient} transition-all duration-1000 ease-out`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-50 text-center">
                                                <p className="text-[8px] font-black text-emerald-800/40 uppercase tracking-widest mb-0.5">Backers</p>
                                                <p className="text-lg font-black text-emerald-950">{fund.contributorCount}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-50 text-center">
                                                <p className="text-[8px] font-black text-emerald-800/40 uppercase tracking-widest mb-0.5">Left</p>
                                                <p className="text-lg font-black text-emerald-950">{timeLeft} d</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-8 border-t border-emerald-50">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                                                Support Project
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <span className="text-emerald-400 font-black text-xs">ETH</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-950 font-bold focus:outline-none focus:border-emerald-500 transition-all"
                                                    placeholder="0.10"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleDonate}
                                            disabled={donating || !account || (fund.deadline < Date.now() / 1000)}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-md active:scale-[0.98] transition-all disabled:opacity-40"
                                        >
                                            {donating ? "Confirming..." : "Support Now"}
                                        </button>

                                        {!account && (
                                            <p className="text-center text-[8px] font-black text-amber-600 uppercase tracking-widest">
                                                Connect wallet to participate
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </aside>
                    </>
                ) : (
                    <main className="lg:col-span-12 space-y-10">
                        <section className="grid lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-4 space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black text-emerald-950 tracking-tight italic border-l-4 border-emerald-500 pl-4">Release System</h3>
                                    <p className="text-sm font-medium text-emerald-900/50 leading-relaxed">
                                        Funds are released through a transparent governance process. Creators propose expenses, and contributors vote to approve them.
                                    </p>
                                </div>

                                {fund.creator.toLowerCase() === account?.toLowerCase() && (
                                    <Card className="p-8 border border-emerald-100 rounded-2xl bg-emerald-50/30">
                                        <form onSubmit={handleCreateRequest} className="space-y-5">
                                            <div className="space-y-2">
                                                <h4 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                                                    <Plus className="w-3.5 h-3.5 text-emerald-500" /> New Request
                                                </h4>
                                                <p className="text-[9px] font-bold text-emerald-900/40 uppercase tracking-widest">Define your spending purpose</p>
                                            </div>

                                            <div className="space-y-4">
                                                <input
                                                    required
                                                    placeholder="Purpose (e.g. Hardware purchase)"
                                                    className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl text-emerald-950 font-bold focus:border-emerald-500 focus:outline-none transition-all placeholder:text-emerald-900/20 text-sm"
                                                    value={requestPurpose}
                                                    onChange={(e) => setRequestPurpose(e.target.value)}
                                                />
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <span className="text-emerald-400 font-black text-xs">ETH</span>
                                                    </div>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="0.001"
                                                        placeholder="0.00"
                                                        className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-100 rounded-xl text-emerald-950 font-bold focus:border-emerald-500 focus:outline-none transition-all placeholder:text-emerald-900/20 text-sm"
                                                        value={requestAmount}
                                                        onChange={(e) => setRequestAmount(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                disabled={creatingRequest}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-md active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                            >
                                                {creatingRequest ? "Submitting..." : (
                                                    <>
                                                        Initialize Request <CheckCircle2 className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </Card>
                                )}

                                <div className="p-6 bg-white border border-emerald-100 rounded-2xl space-y-4">
                                    <div className="flex items-center gap-3 text-emerald-600">
                                        <Shield className="w-5 h-5" />
                                        <h5 className="font-black text-[10px] uppercase tracking-widest">Protocol Rules</h5>
                                    </div>
                                    <ul className="space-y-3">
                                        {[
                                            "Requests need >50% approval count.",
                                            "Only contributors can vote.",
                                            "One vote per contributor per request.",
                                            "Only creators can finalize approved requests."
                                        ].map((rule, i) => (
                                            <li key={i} className="flex gap-2 text-[9px] font-black text-emerald-900/40 bg-emerald-50/50 p-2 rounded-lg border border-emerald-50">
                                                <span className="text-emerald-500 font-black">0{i + 1}</span>
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="lg:col-span-8 space-y-6">
                                {fund.requests && fund.requests.length > 0 ? (
                                    <div className="grid gap-6">
                                        {fund.requests.map((request) => (
                                            <Card key={request.id} className={`p-8 border rounded-2xl transition-all ${request.completed ? 'bg-emerald-50/10 border-emerald-100 opacity-60' : 'bg-white border-emerald-100 hover:shadow-lg'}`}>
                                                <div className="flex flex-col md:flex-row justify-between gap-8">
                                                    <div className="space-y-4 flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${request.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                {request.completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                            </div>
                                                            <h4 className="text-xl font-black text-emerald-950 tracking-tight">{request.purpose}</h4>
                                                        </div>

                                                        <div className="flex flex-wrap gap-6 pt-2">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">Amount</p>
                                                                <p className="font-black text-emerald-600 text-lg">{request.amount} ETH</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">Approvals</p>
                                                                <p className="font-black text-emerald-950 text-lg">
                                                                    {request.approvals} / {fund.contributorCount}
                                                                    <span className="text-[10px] text-emerald-900/30 ml-2 font-medium">({((request.approvals / (fund.contributorCount || 1)) * 100).toFixed(0)}%)</span>
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">Status</p>
                                                                <p className={`font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${request.completed ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-amber-100 border-amber-200 text-amber-700'}`}>
                                                                    {request.completed ? 'Released' : 'Active'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {!request.completed && (
                                                        <div className="flex flex-col gap-3 min-w-[160px]">
                                                            {hasContributed ? (
                                                                <button
                                                                    onClick={() => handleVote(request.id)}
                                                                    disabled={voting === request.id}
                                                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                                                                >
                                                                    {voting === request.id ? "Voting..." : (
                                                                        <>
                                                                            VOTE <ThumbsUp className="w-4 h-4" />
                                                                        </>
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                                                    <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">Back Project to Vote</p>
                                                                </div>
                                                            )}

                                                            {fund.creator.toLowerCase() === account?.toLowerCase() && (
                                                                <button
                                                                    onClick={() => handleFinalize(request.id)}
                                                                    disabled={finalizing === request.id || request.approvals <= fund.contributorCount / 2}
                                                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-black rounded-xl transition-all active:scale-95 disabled:opacity-30 disabled:border-emerald-200 disabled:text-emerald-200"
                                                                >
                                                                    {finalizing === request.id ? "Finalizing..." : (
                                                                        <>
                                                                            RELEASE <Wallet className="w-4 h-4" />
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {!request.completed && fund.creator.toLowerCase() === account?.toLowerCase() && request.approvals <= fund.contributorCount / 2 && (
                                                    <p className="mt-4 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 p-2 rounded-lg border border-amber-100 inline-block">
                                                        Need {Math.floor(fund.contributorCount / 2) + 1} total approvals to release
                                                    </p>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-24 text-center border-2 border-dashed border-emerald-100 rounded-3xl space-y-6">
                                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-200">
                                            <Wallet className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-2xl font-black text-emerald-950 tracking-tight">Governance Idle.</h4>
                                            <p className="text-[10px] font-black text-emerald-900/30 uppercase tracking-widest">No active spending requests detected for this campaign.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </main>
                )}
            </div>
        </div>
    );
}
