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
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
        <p className="text-slate-500">You need to connect your wallet to view your campaigns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      <div className="bg-emerald-900 border border-emerald-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-bl from-emerald-600/10 to-transparent transform translate-x-1/4"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-white mb-4">My Campaigns</h1>
          <p className="text-emerald-200/80 text-lg max-w-2xl">
            Manage your fundraising campaigns and track your progress on the blockchain.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="h-80 bg-emerald-900/30 border border-emerald-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : funds.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {funds.map(fund => (
            <div key={fund.address} className="relative group">
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
        <div className="text-center py-20 bg-emerald-900/20 rounded-3xl border border-dashed border-emerald-800">
          <div className="w-16 h-16 bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No campaigns yet</h3>
          <p className="text-emerald-400/60 mb-8 max-w-md mx-auto">
            You haven't created any campaigns yet. Start your journey today!
          </p>
          <button
            onClick={() => navigate('/create')}
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            Create your first Campaign
          </button>
        </div>
      )}
    </div>
  );
}

