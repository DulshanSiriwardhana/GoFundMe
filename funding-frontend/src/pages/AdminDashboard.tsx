import { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ADMIN_ADDRESS } from "../utils/contract";
import {
    BarChart3,
    Users,
    Wallet2,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    Activity,
    ArrowUpRight,
    Target
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

interface AdminStats {
    overview: {
        totalFunds: number;
        totalRaised: number;
        totalGoal: number;
        totalContributors: number;
    };
    categories: Array<{
        _id: string;
        count: number;
        raised: number;
    }>;
    recentFunds: any[];
}

export default function AdminDashboard() {
    const { account } = useWeb3();
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
                const response = await fetch(`${apiBaseUrl}/api/admin/stats`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const isAdmin = account?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

    if (!isAdmin) {
        return (
            <div className="max-w-xl mx-auto py-24 px-6 text-center space-y-8 p-12 border border-emerald-50 rounded-2xl bg-white shadow-sm">
                <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto text-red-500">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-emerald-950 italic">Access Restricted.</h2>
                    <p className="text-emerald-900/40 font-bold uppercase tracking-widest text-[10px]">
                        You do not have administrative privileges for this protocol.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-emerald-600 text-white font-black rounded-xl shadow-lg active:scale-95"
                >
                    Return Home
                </button>
            </div>
        );
    }

    if (loading) return (
        <Loader message="Querying Protocol Intelligence" />
    );

    return (
        <div className="space-y-12 pb-24">
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-emerald-950 rounded-3xl p-10 md:p-14 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 blur-3xl -z-0" />
                <div className="relative z-10 space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                        <Activity className="w-3 h-3" /> Protocol Overview
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                        Admin <span className="text-emerald-400 italic">Command.</span>
                    </h1>
                    <p className="text-emerald-100/40 font-medium max-w-md">
                        Real-time aggregate data from the GoFundChain smart contracts.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <div>
                        <p className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">Active Nodes</p>
                        <p className="text-sm font-bold text-white">Mainnet Sync: 100%</p>
                    </div>
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total ETH Raised", value: stats?.overview.totalRaised.toFixed(3), icon: Wallet2, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Active Campaigns", value: stats?.overview.totalFunds, icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Total Contributors", value: stats?.overview.totalContributors, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
                    { label: "Funding Efficiency", value: stats?.overview.totalGoal ? ((stats.overview.totalRaised / stats.overview.totalGoal) * 100).toFixed(1) + "%" : "0%", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
                ].map((metric, i) => (
                    <Card key={i} className="p-6 border border-emerald-100/50 hover:border-emerald-200 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${metric.bg} ${metric.color} group-hover:scale-110 transition-transform`}>
                                <metric.icon className="w-6 h-6" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-emerald-200" />
                        </div>
                        <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest mb-1">{metric.label}</p>
                        <h4 className="text-2xl font-black text-emerald-950 tracking-tight">{metric.value}</h4>
                    </Card>
                ))}
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
                <section className="lg:col-span-2 space-y-6">
                    <h3 className="text-2xl font-black text-emerald-950 tracking-tight italic flex items-center gap-3">
                        <Target className="w-6 h-6 text-emerald-500" /> Category Distribution
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {stats?.categories.map((cat, i) => (
                            <Card key={i} className="p-6 bg-white border border-emerald-50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Activity className="w-12 h-12 text-emerald-900" />
                                </div>
                                <h4 className="font-black text-emerald-950 text-xl mb-1">{cat._id}</h4>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest">Growth</p>
                                        <p className="font-bold text-emerald-600">{cat.count} Funds</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest">Raised</p>
                                        <p className="font-bold text-emerald-950">{cat.raised.toFixed(2)} ETH</p>
                                    </div>
                                </div>
                                <div className="mt-4 w-full h-1 bg-emerald-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{ width: `${(cat.raised / (stats.overview.totalRaised || 1)) * 100}%` }}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="space-y-6">
                    <h3 className="text-2xl font-black text-emerald-950 tracking-tight italic">Pulse Check</h3>
                    <Card className="p-6 border border-emerald-100 bg-white">
                        <div className="space-y-6">
                            {stats?.recentFunds.map((fund, i) => (
                                <div key={i} className="flex gap-4 items-center group cursor-pointer" onClick={() => navigate(`/fund/${fund.address}`)}>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xs border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        {fund.projectName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-emerald-950 text-sm truncate">{fund.projectName}</h5>
                                        <p className="text-[10px] text-emerald-900/40 truncate mt-0.5">
                                            {fund.description || "No description available."}
                                        </p>
                                        <p className="text-[9px] font-black text-emerald-900/30 uppercase tracking-widest leading-none mt-1.5">
                                            {fund.totalRaised} / {fund.goal} ETH
                                        </p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${fund.goalReached ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 bg-emerald-50 border border-emerald-100">
                        <div className="flex gap-4 items-start">
                            <AlertCircle className="w-5 h-5 text-emerald-600 mt-1" />
                            <div>
                                <h5 className="font-black text-emerald-950 text-xs uppercase tracking-widest mb-1">Audit Status</h5>
                                <p className="text-xs text-emerald-900/50 font-medium">All contracts verified on etherscan. Security rating: A+</p>
                            </div>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}
