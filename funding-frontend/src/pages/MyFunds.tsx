import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import FundCard from "../components/FundCard";
import { FACTORY_ABI, FACTORY_ADDRESS, type FundData } from "../utils/contract";
import { Plus } from "lucide-react";

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
          const FUND_ABI_PARTIAL = [
            "function creator() view returns (address)",
            "function projectName() view returns (string)",
            "function goal() view returns (uint256)",
            "function deadline() view returns (uint256)",
            "function totalRaised() view returns (uint256)",
            "function goalReached() view returns (bool)",
            "function contributorCount() view returns (uint256)",
          ];
          const contract = new ethers.Contract(address, FUND_ABI_PARTIAL, provider);
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
      <div className="text-center py-20 px-6 bg-white border border-emerald-100 rounded-3xl shadow-xl shadow-emerald-900/5 max-w-lg mx-auto mt-20">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Plus className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black mb-4 text-emerald-950 tracking-tight underline decoration-emerald-500/20 underline-offset-8">Connect Wallet</h2>
        <p className="text-emerald-800/50 font-bold uppercase tracking-widest text-[10px] mb-8">You need to connect your wallet to view your campaigns</p>
        <button
          onClick={() => { }} // This should be handled by the layout's connect button
          className="px-8 py-3.5 bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-900 shadow-2xl shadow-emerald-900/40 px-10 py-16">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-bl from-emerald-400/20 to-transparent transform translate-x-1/4 skew-x-12"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/50 border border-emerald-700/50 text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em]">
              Dashboard
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-tight">My Campaigns</h1>
            <p className="text-emerald-100/60 text-lg max-w-xl font-medium">
              Manage your fundraising campaigns and track your progress on the blockchain.
            </p>
          </div>
          <button
            onClick={() => navigate('/create')}
            className="group px-8 py-4 bg-emerald-500 text-emerald-950 rounded-2xl font-black hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95 shrink-0"
          >
            Launch New <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </section>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2].map(i => (
            <div key={i} className="h-96 bg-white border border-emerald-50 rounded-[2rem] animate-pulse"></div>
          ))}
        </div>
      ) : funds.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {funds.map(fund => (
            <div key={fund.address} className="relative">
              <FundCard
                name={fund.projectName}
                goal={fund.goal}
                raised={fund.totalRaised}
                creator={fund.creator}
                deadline={fund.deadline}
                contributors={fund.contributorCount}
                onClick={() => navigate(`/fund/${fund.address}`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-emerald-100 shadow-xl shadow-emerald-900/5 px-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100/50">
            <Plus className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-3xl font-black text-emerald-950 mb-4 tracking-tight">No campaigns yet</h3>
          <p className="text-emerald-900/40 mb-10 max-w-sm mx-auto font-bold uppercase tracking-widest text-xs leading-relaxed">
            You haven't created any campaigns yet. Start your journey today!
          </p>
          <button
            onClick={() => navigate('/create')}
            className="px-10 py-4.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] text-lg"
          >
            Create your first Campaign
          </button>
        </div>
      )}
    </div>
  );
}

