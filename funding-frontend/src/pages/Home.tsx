import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { ArrowRight, Zap, Globe, ShieldCheck, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import FundCard from "../components/FundCard";
import { FACTORY_ABI, FACTORY_ADDRESS, FUND_ABI, type FundData } from "../utils/contract";
import { useWeb3 } from "../context/Web3Context";

const CATEGORIES = ["All", "Tech", "Charity", "Creative", "Community", "Environment"];

export default function Home() {
  const [funds, setFunds] = useState<FundData[]>([]);
  const { provider } = useWeb3();
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

      // Only take last 10 for performance in blockchain-direct mode
      for (const address of fundAddresses.slice(-10)) {
        try {
          const contract = new ethers.Contract(address, FUND_ABI, readProvider);
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
      // Try backend first
      const response = await fetch(`http://localhost:3001/api/funds?search=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setFunds(data.funds);
      } else {
        throw new Error("Backend unavailable");
      }
    } catch (err) {
      console.warn("Falling back to blockchain-direct fetch...");
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
    // Simple frontend filtering for categories since we don't have them in contract yet
    // In a real app, categories would be indexed in DB
    return funds.filter(fund => {
      const name = fund.projectName || "";
      const addr = fund.address || "";
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [funds, searchQuery]);

  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-900 shadow-2xl shadow-emerald-900/40">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-linear-to-bl from-emerald-400/20 via-emerald-500/10 to-transparent transform translate-x-1/4 skew-x-12"></div>
        <div className="relative z-10 px-8 py-24 sm:px-12 lg:px-20 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/50 border border-emerald-700/50 text-emerald-300 text-xs font-bold uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" /> Empowering Ideas
            </div>
            <h1 className="text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Follow the fund <br />
              <span className="text-emerald-400">to the future.</span>
            </h1>
            <p className="text-xl text-emerald-100/80 max-w-xl font-medium leading-relaxed">
              Launch your campaign on the GoFundChain. Transparent, secure, and unstoppable funding for your dreams.
            </p>
            <div className="flex flex-wrap gap-5 pt-4">
              <Link to="/create" className="px-10 py-4.5 bg-emerald-500 text-emerald-950 rounded-2xl font-black hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-3">
                Start a Campaign <ArrowRight className="w-6 h-6" />
              </Link>
              <button onClick={() => {
                document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' });
              }} className="px-10 py-4.5 bg-white/10 text-white border-2 border-white/20 rounded-2xl font-black hover:bg-white/20 transition-all backdrop-blur-md">
                Explore Projects
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full md:w-auto relative group" title="Our Features">
            <div className="absolute -inset-4 bg-emerald-400/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            {[
              { icon: Zap, label: "Instant Payouts", desc: "No waiting for banks." },
              { icon: ShieldCheck, label: "Secure", desc: "Audited contracts." },
              { icon: Globe, label: "Global", desc: "Anyone can donate." },
            ].map((feat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:bg-white/15 transition-all relative z-10">
                <feat.icon className="w-8 h-8 text-emerald-400 mb-4" />
                <div className="font-bold text-lg text-white mb-1">{feat.label}</div>
                <div className="text-sm text-emerald-100/60 leading-tight">{feat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="explore" className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-emerald-950 tracking-tight">Trending Campaigns</h2>
              <div className="h-1 w-20 bg-emerald-500 rounded-full" />
            </div>
            <p className="text-emerald-900/40 font-bold uppercase tracking-widest text-[10px]">
              Discover groundbreaking projects on the chain
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search campaigns or addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-emerald-50 rounded-2xl focus:border-emerald-500 focus:outline-none shadow-lg shadow-emerald-900/5 transition-all text-emerald-950 font-medium placeholder:text-emerald-900/20"
              />
            </div>
            <button className="px-6 py-4 bg-white border-2 border-emerald-50 text-emerald-950 rounded-2xl font-bold flex items-center justify-center gap-3 hover:border-emerald-500 transition-all shadow-lg shadow-emerald-900/5 active:scale-95 group">
              <Filter className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pb-4 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-black tracking-tight transition-all border-2 whitespace-nowrap active:scale-95 ${activeCategory === cat
                ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-white border-emerald-50 text-emerald-900/40 hover:border-emerald-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-white border border-emerald-50 rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : filteredFunds.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredFunds.map(fund => (
              <FundCard
                key={fund.address}
                name={fund.projectName}
                goal={fund.goal}
                raised={fund.totalRaised}
                creator={fund.creator}
                deadline={fund.deadline}
                contributors={fund.contributorCount}
                onClick={() => window.location.href = `/fund/${fund.address}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-emerald-100 shadow-xl shadow-emerald-900/5 px-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100/50">
              <Globe className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-3xl font-black text-emerald-950 mb-4 tracking-tight">No campaigns found</h3>
            <p className="text-emerald-900/40 mb-10 max-w-sm mx-auto font-bold uppercase tracking-widest text-xs leading-relaxed">
              {searchQuery ? "No results match your search query." : "The blockchain is waiting for the next big idea. Be the first to launch!"}
            </p>
            {!searchQuery && (
              <Link to="/create" className="inline-flex items-center gap-2 px-10 py-4.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] text-lg">
                Launch a campaign <ArrowRight className="w-6 h-6" />
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
