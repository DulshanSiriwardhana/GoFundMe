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
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-indigo-600 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-purple-500/30 to-transparent transform translate-x-1/4 skew-x-12"></div>
        <div className="relative z-10 px-8 py-20 sm:px-12 lg:px-16 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
              Fund the Future, <br />
              <span className="text-purple-200">Decentralized.</span>
            </h1>
            <p className="text-lg text-indigo-100 max-w-xl">
              Launch your campaign on the blockchain. Transparent, secure, and unstoppable funding for your dreams.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/create" className="px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg active:scale-95 flex items-center gap-2">
                Start a Campaign <ArrowRight className="w-5 h-5" />
              </Link>
              <button onClick={() => {
                document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' });
              }} className="px-8 py-3.5 bg-indigo-700/50 text-white border border-indigo-400/30 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                Explore Projects
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
            {[
              { icon: Zap, label: "Instant Payouts", desc: "No waiting for banks." },
              { icon: ShieldCheck, label: "Secure", desc: "Audited contracts." },
              { icon: Globe, label: "Global", desc: "Anyone can donate." },
            ].map((feat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                <feat.icon className="w-6 h-6 text-purple-200 mb-2" />
                <div className="font-bold text-sm">{feat.label}</div>
                <div className="text-xs text-indigo-200">{feat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="explore">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Trending Campaigns</h2>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse"></div>
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
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-500 mb-4">No campaigns found. Be the first!</p>
            <Link to="/create" className="text-indigo-600 font-bold hover:underline">Launch a campaign &rarr;</Link>
          </div>
        )}
      </section>
    </div>
  );
}
