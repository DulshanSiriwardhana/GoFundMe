import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import FundCard from "../components/FundCard";
import { FACTORY_ABI, FACTORY_ADDRESS, FUND_ABI, type FundData } from "../utils/contract";
import { Layout, ArrowRight, Plus } from "lucide-react";

export default function MyFunds() {
  const navigate = useNavigate();
  const { account, provider } = useWeb3();
  const [funds, setFunds] = useState<FundData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMyFunds = useCallback(async () => {
    if (!provider || !account) return;
    try {
      setLoading(true);
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
      const fundAddresses = await factory.getFunds();
      const myFunds: FundData[] = [];

      for (const address of fundAddresses) {
        try {
          const contract = new ethers.Contract(address, FUND_ABI, provider);
          const creator = await contract.creator();

          if (creator.toLowerCase() === account.toLowerCase()) {
            const [projectName, goal, deadline, totalRaised, goalReached, contributorCount] =
              await Promise.all([
                contract.projectName(),
                contract.goal(),
                contract.deadline(),
                contract.totalRaised(),
                contract.goalReached(),
                contract.contributorCount(),
              ]);

            myFunds.push({
              address,
              creator,
              projectName,
              category: "Community",
              goal: ethers.formatEther(goal),
              deadline: Number(deadline),
              totalRaised: ethers.formatEther(totalRaised),
              goalReached,
              contributorCount: Number(contributorCount),
              requestCount: 0
            });
          }
        } catch (err) {
          console.error(`Error loading fund ${address}:`, err);
        }
      }
      setFunds(myFunds.reverse());
    } catch (err) {
      console.error("Error loading my funds:", err);
    } finally {
      setLoading(false);
    }
  }, [account, provider]);

  useEffect(() => {
    if (account && provider) {
      loadMyFunds();
    }
  }, [account, provider, loadMyFunds]);

  if (!account) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center space-y-8 p-12 border border-emerald-50 rounded-2xl bg-white shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto text-emerald-300">
          <Layout className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-emerald-950 italic">Locked Dashboard.</h2>
          <p className="text-emerald-900/40 font-bold uppercase tracking-widest text-[10px]">
            Please connect your wallet to view your visions.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-emerald-600 text-white font-black rounded-xl shadow-lg active:scale-95"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-24">
      <section className="relative overflow-hidden rounded-3xl bg-emerald-950 p-10 md:p-16 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
            Mission Control
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none">My <span className="text-emerald-400 italic">Visions.</span></h1>
          <p className="text-emerald-100/40 font-medium max-w-md">
            Manage and track the pulse of your on-chain campaigns.
          </p>
        </div>

        <button
          onClick={() => navigate('/create')}
          className="px-8 py-5 bg-emerald-500 text-emerald-950 rounded-xl font-black hover:bg-emerald-400 transition-all shadow-xl active:scale-95 flex items-center gap-3"
        >
          <Plus className="w-5 h-5" /> Launch New Vision
        </button>
      </section>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="h-80 bg-emerald-50/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : funds.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {funds.map(fund => (
            <FundCard
              key={fund.address}
              name={fund.projectName}
              goal={fund.goal}
              raised={fund.totalRaised}
              creator={fund.creator}
              deadline={fund.deadline}
              contributors={fund.contributorCount}
              onClick={() => navigate(`/fund/${fund.address}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-emerald-50 rounded-3xl px-8 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-6 text-emerald-200">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-emerald-950 mb-3 tracking-tight">Zero visions detected.</h3>
          <p className="text-emerald-900/40 font-bold uppercase tracking-widest text-[10px] mb-10 max-w-xs mx-auto">
            Ready to initiate your first blockchain crowdfunding campaign?
          </p>
          <button
            onClick={() => navigate('/create')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-black rounded-xl shadow-lg transition-all active:scale-95"
          >
            Launch First Vision <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
