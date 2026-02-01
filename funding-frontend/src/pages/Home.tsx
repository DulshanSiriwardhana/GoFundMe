import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { ArrowRight, Zap, Globe, ShieldCheck, Search, Filter, Sparkles, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FundCard from "../components/FundCard";
import Loader from "../components/Loader";
import { FACTORY_ABI, FACTORY_ADDRESS, FUND_ABI, type FundData } from "../utils/contract";
import { useWeb3 } from "../context/Web3Context";

const CATEGORIES = ["All", "Tech", "Charity", "Creative", "Community", "Environment"];

export default function Home() {
  const [funds, setFunds] = useState<FundData[]>([]);
  const { provider } = useWeb3();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const getReadProvider = useCallback(() => {
    if (provider) return provider;
    if (typeof window.ethereum !== 'undefined') {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
  }, [provider]);

  const loadFundsFromBlockchain = useCallback(async () => {
    const readProvider = getReadProvider();
    if (!readProvider) return [];

    try {
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, readProvider);
      const fundAddresses = await factory.getFunds();
      const fundData: FundData[] = [];

      for (const address of fundAddresses.slice(-12)) {
        try {
          const contract = new ethers.Contract(address, FUND_ABI, readProvider);

          let description = "";
          try {
            description = await contract.description();
          } catch (e) {
            // Field not present in this version
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

          fundData.push({
            address,
            creator,
            projectName,
            description,
            category: "Community",
            goal: ethers.formatEther(goal),
            deadline: Number(deadline),
            totalRaised: ethers.formatEther(totalRaised),
            goalReached,
            contributorCount: Number(contributorCount),
            requestCount: Number(requestCount)
          });
        } catch (err) {
          console.error(`Error loading fund ${address}:`, err);
        }
      }
      return fundData.reverse();
    } catch (err) {
      console.error("Blockchain fetch failed:", err);
      return [];
    }
  }, [getReadProvider]);

  const loadFunds = useCallback(async () => {
    setLoading(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/api/funds?search=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setFunds(data.funds);
      } else {
        throw new Error("Backend unavailable");
      }
    } catch (err) {
      const blockchainFunds = await loadFundsFromBlockchain();
      setFunds(blockchainFunds);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, loadFundsFromBlockchain]);

  useEffect(() => {
    loadFunds();
  }, [loadFunds]);

  const filteredFunds = useMemo(() => {
    return funds.filter(fund => {
      const name = fund.projectName || "";
      const addr = fund.address || "";
      const cat = fund.category || "Community";

      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory === "All" || cat === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [funds, searchQuery, activeCategory]);

  return (
    <div className="space-y-16 md:space-y-24 pb-24">
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center overflow-hidden rounded-3xl bg-emerald-950 shadow-xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-full h-full bg-linear-to-bl from-emerald-400/10 via-transparent to-transparent" />

        <div className="relative z-10 px-6 py-16 sm:px-12 lg:px-20 w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-[9px] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Empowering the Future
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Launch your <br className="hidden sm:block" />
              <span className="text-emerald-400 italic">Fund Idea.</span>
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/60 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
              Global, secure, and transparent protocol for decentralized crowdfunding.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <Link to="/create" className="group px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-500 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
                Start a Campaign <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all backdrop-blur-md"
              >
                Explore Projects
              </button>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4 w-full max-w-sm">
            {[
              { icon: Zap, label: "Fast", desc: "Global payouts." },
              { icon: ShieldCheck, label: "Secure", desc: "On-chain trust." },
              { icon: Globe, label: "Boundless", desc: "No borders." },
              { icon: TrendingUp, label: "Live", desc: "Real-time data." },
            ].map((feat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <feat.icon className="w-5 h-5 text-emerald-400 mb-4" />
                <div className="font-black text-white mb-1">{feat.label}</div>
                <div className="text-xs text-emerald-100/40 leading-tight">{feat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="explore" className="space-y-10 px-4 sm:px-0">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight italic">Explore Funds</h2>
            <p className="text-emerald-900/50 font-black uppercase tracking-widest text-[10px]">
              Active campaigns on the blockchain
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-emerald-100 rounded-2xl focus:border-emerald-500 focus:outline-none shadow-sm transition-all text-emerald-950 font-bold placeholder:text-emerald-900/40"
              />
            </div>
            <button className="px-8 py-4 bg-white border border-emerald-100 text-emerald-950 rounded-2xl font-black flex items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50 transition-all shadow-sm active:scale-95 whitespace-nowrap">
              <Filter className="w-4 h-4 text-emerald-400" />
              Filter
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pb-4 overflow-x-auto no-scrollbar mask-fade-right">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all border-2 whitespace-nowrap active:scale-95 ${activeCategory === cat
                ? "bg-emerald-950 border-emerald-950 text-white shadow-md"
                : "bg-white border-emerald-50 text-emerald-900/30 hover:border-emerald-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20">
            <Loader message="Fetching Active Campaigns" />
          </div>
        ) : filteredFunds.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFunds.map(fund => (
              <FundCard
                key={fund.address}
                name={fund.projectName}
                description={fund.description}
                goal={fund.goal}
                raised={fund.totalRaised}
                creator={fund.creator}
                deadline={fund.deadline}
                contributors={fund.contributorCount}
                category={fund.category}
                onClick={() => navigate(`/fund/${fund.address}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-emerald-50 rounded-3xl px-8 shadow-sm">
            <Globe className="w-12 h-12 text-emerald-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-emerald-950 mb-3 tracking-tight">No results.</h3>
            <p className="text-emerald-900/40 max-w-xs mx-auto font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-8">
              Adjust your search or category filters to discover more funds.
            </p>
            {!searchQuery && (
              <Link to="/create" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95">
                Launch your own Fund <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
