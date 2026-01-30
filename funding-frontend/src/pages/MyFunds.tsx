import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MyFunds() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<string>();

  useEffect(() => {
    checkAccount();
  }, []);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Campaigns</h1>

          {!account ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
              <p className="text-gray-600 mb-6">
                Connect your wallet to view your campaigns
              </p>
              <button
                onClick={connectWallet}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
              <p className="text-gray-600">
                No campaigns found for your account. Create one to get started!
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
