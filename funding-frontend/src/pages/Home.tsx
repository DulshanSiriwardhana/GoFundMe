import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ArrowRight, Zap, Heart, Lock } from "lucide-react";
import FundCard from "../components/FundCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FACTORY_ABI, FACTORY_ADDRESS } from "../utils/contract";

interface Fund {
  address: string;
  name: string;
  goal: string;
  raised: string;
  creator: string;
  deadline: number;
  goalReached: boolean;
  contributors: number;
}

export default function Home() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [account, setAccount] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    loadFunds();
    checkAccount();
    
    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        if (Array.isArray(accounts) && accounts.length > 0) {
          setAccount(String(accounts[0]));
        }
      };
      
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, []);

  const loadFunds = async () => {
    try {
      setLoading(true);
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        FACTORY_ABI,
        provider
      );

      const fundAddresses = await factory.getFunds();
      
      const fundData: Fund[] = [];
      for (const address of fundAddresses) {
        try {
          const fundDetails = await loadFundDetails(provider, address);
          if (fundDetails) {
            fundData.push(fundDetails);
          }
        } catch (err) {
          console.error(`Error loading fund ${address}:`, err);
        }
      }
      
      setFunds(fundData.reverse());
      setError(undefined);
    } catch (err) {
      console.error("Error loading funds:", err);
      setError("Failed to load funds. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadFundDetails = async (
    provider: ethers.BrowserProvider,
    address: string
  ): Promise<Fund | null> => {
    try {
      const FUND_ABI = [
        "function creator() view returns (address)",
        "function projectName() view returns (string)",
        "function goal() view returns (uint256)",
        "function deadline() view returns (uint256)",
        "function totalRaised() view returns (uint256)",
        "function goalReached() view returns (bool)",
        "function contributorCount() view returns (uint256)",
      ];

      const contract = new ethers.Contract(address, FUND_ABI, provider);

      const [creator, projectName, goal, deadline, totalRaised, goalReached, contributors] =
        await Promise.all([
          contract.creator(),
          contract.projectName(),
          contract.goal(),
          contract.deadline(),
          contract.totalRaised(),
          contract.goalReached(),
          contract.contributorCount(),
        ]);

      return {
        address,
        name: projectName,
        goal: ethers.formatEther(goal),
        raised: ethers.formatEther(totalRaised),
        creator,
        deadline: Number(deadline),
        goalReached,
        contributors: Number(contributors),
      };
    } catch (err) {
      console.error(`Error loading details for ${address}:`, err);
      return null;
    }
  };

  const checkAccount = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (Array.isArray(accounts) && accounts.length > 0) {
        setAccount(String(accounts[0]));
      }
    } catch (err) {
      console.error("Error checking account:", err);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (Array.isArray(accounts) && accounts.length > 0) {
        setAccount(String(accounts[0]));
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  };

  const disconnectWallet = () => {
    setAccount(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        account={account}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold mb-6">
                  Decentralized Crowdfunding
                </h1>
                <p className="text-lg text-blue-100 mb-8">
                  Create funding campaigns and raise money with transparency. Every transaction is recorded on the blockchain.
                </p>
                <a
                  href="/create"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Start a Campaign <ArrowRight className="w-5 h-5" />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-500 bg-opacity-50 rounded-lg p-6 backdrop-blur">
                  <Zap className="w-8 h-8 mb-2" />
                  <h3 className="font-bold mb-2">Instant Funding</h3>
                  <p className="text-sm text-blue-100">Fast & secure transactions</p>
                </div>
                <div className="bg-blue-500 bg-opacity-50 rounded-lg p-6 backdrop-blur">
                  <Heart className="w-8 h-8 mb-2" />
                  <h3 className="font-bold mb-2">Community Driven</h3>
                  <p className="text-sm text-blue-100">Democratic decisions</p>
                </div>
                <div className="bg-blue-500 bg-opacity-50 rounded-lg p-6 backdrop-blur">
                  <Lock className="w-8 h-8 mb-2" />
                  <h3 className="font-bold mb-2">Transparent</h3>
                  <p className="text-sm text-blue-100">Blockchain verified</p>
                </div>
                <div className="bg-blue-500 bg-opacity-50 rounded-lg p-6 backdrop-blur">
                  <Zap className="w-8 h-8 mb-2" />
                  <h3 className="font-bold mb-2">No Middlemen</h3>
                  <p className="text-sm text-blue-100">Direct connections</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Funds Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Active Campaigns
            </h2>
            <p className="text-gray-600">
              Discover and support amazing projects
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            </div>
          ) : funds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No active campaigns yet.</p>
              <a
                href="/create"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Create the first campaign
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funds.map((fund) => (
                <FundCard
                  key={fund.address}
                  name={fund.name}
                  goal={fund.goal}
                  raised={fund.raised}
                  creator={fund.creator}
                  deadline={fund.deadline}
                  goalReached={fund.goalReached}
                  contributors={fund.contributors}
                  onClick={() => {
                    // Navigate to fund details
                    window.location.href = `/fund/${fund.address}`;
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {funds.length}
                </div>
                <div className="text-gray-400">Active Campaigns</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {funds.reduce((acc, f) => acc + f.contributors, 0)}
                </div>
                <div className="text-gray-400">Total Backers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {funds
                    .reduce((acc, f) => acc + parseFloat(f.raised), 0)
                    .toFixed(2)}
                </div>
                <div className="text-gray-400">ETH Raised</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {funds.filter((f) => f.goalReached).length}
                </div>
                <div className="text-gray-400">Goals Reached</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

