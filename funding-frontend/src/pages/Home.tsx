import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { ArrowRight, Zap, Globe, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import FundCard from "../components/FundCard";
import { FACTORY_ABI, FACTORY_ADDRESS, type FundData } from "../utils/contract";
import { useWeb3 } from "../context/Web3Context";

export default function Home() {
  const [funds, setFunds] = useState<FundData[]>([]);
  const { provider } = useWeb3();
  const [loading, setLoading] = useState(false);

  const getReadProvider = useCallback(() => {
    if (provider) return provider;
    if (typeof window.ethereum !== 'undefined') {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
  }, [provider]);

  const loadFunds = useCallback(async () => {
    const readProvider = getReadProvider();
    if (!readProvider) return;

    try {
      setLoading(true);
      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        FACTORY_ABI,
        readProvider
      );

      const fundAddresses = await factory.getFunds();
      const fundData: FundData[] = [];

      for (const address of fundAddresses.slice(-10)) {
        try {
          const FUND_ABI_PARTIAL = [
            "function creator() view returns (address)",
            "function projectName() view returns (string)",
            "function goal() view returns (uint256)",
            "function deadline() view returns (uint256)",
            "function totalRaised() view returns (uint256)",
            "function goalReached() view returns (bool)",
            "function contributorCount() view returns (uint256)",
            "function requestCount() view returns (uint256)",
          ];
          const contract = new ethers.Contract(address, FUND_ABI_PARTIAL, readProvider);
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

      setFunds(fundData.reverse());
    } catch (err) {
      console.error("Error loading funds:", err);
    } finally {
      setLoading(false);
    }
  }, [getReadProvider]);

  useEffect(() => {
    loadFunds();
  }, [loadFunds]);

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
              Launch your campaign on the blockchain. Transparent, secure, and unstoppable funding for your dreams.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full md:w-auto relative group">
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

      <section id="explore">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Trending Campaigns</h2>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-emerald-900/30 border border-emerald-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : funds.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {funds.map(fund => (
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
          <div className="text-center py-20 bg-emerald-900/20 rounded-3xl border-2 border-dashed border-emerald-700">
            <p className="text-emerald-100 mb-4 text-lg font-medium">No campaigns found. Be the first!</p>
            <Link to="/create" className="text-emerald-300 font-bold hover:text-emerald-200 hover:underline text-lg">Launch a campaign &rarr;</Link>
          </div>
        )}
      </section>
    </div>
  );
}
