import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import FundCard from "../components/FundCard";
import { FACTORY_ABI, FACTORY_ADDRESS, type FundData } from "../utils/contract";

export default function MyFunds() {
  const { account, provider } = useWeb3();
  const [funds, setFunds] = useState<FundData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account && provider) {
      loadMyFunds();
    }
  }, [account, provider]);

  const loadMyFunds = async () => {
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
              requestCount: 0 // Not needed for card
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
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
        <p className="text-slate-500">You need to connect your wallet to view your campaigns.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">My Campaigns</h1>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2].map(i => <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse"></div>)}
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
              goalReached={fund.goalReached}
              contributors={fund.contributorCount}
              onClick={() => window.location.href = `/fund/${fund.address}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-500 mb-4">You haven't created any campaigns yet.</p>
          <Link to="/create" className="text-indigo-600 font-bold hover:underline">Start your first campaign &rarr;</Link>
        </div>
      )}
    </div>
  );
}
