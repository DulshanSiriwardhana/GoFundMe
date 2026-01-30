import { useState } from "react";
import { ethers } from "ethers";
import { ArrowLeft, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FACTORY_ABI, FACTORY_ADDRESS } from "../utils/contract";
import Header from "../components/Header";
import Footer from "../components/Footer";

const DURATIONS = [
  { label: "1 Week", value: 7 * 24 * 60 * 60 },
  { label: "2 Weeks", value: 14 * 24 * 60 * 60 },
  { label: "1 Month", value: 30 * 24 * 60 * 60 },
  { label: "3 Months", value: 90 * 24 * 60 * 60 },
];

export default function CreateFund() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    description: "",
    duration: DURATIONS[0].value,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setError("Failed to connect wallet");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!formData.name || !formData.goal) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(undefined);

      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        FACTORY_ABI,
        signer
      );

      const tx = await factory.createFund(
        formData.name,
        ethers.parseEther(formData.goal),
        formData.duration
      );

      await tx.wait();

      setSuccess(true);
      setFormData({
        name: "",
        goal: "",
        description: "",
        duration: DURATIONS[0].value,
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      console.error("Error creating fund:", err);
      setError(err.message || "Failed to create fund. Please try again.");
    } finally {
      setLoading(false);
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Create a New Campaign
            </h1>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <p className="font-semibold">Campaign created successfully!</p>
                <p className="text-sm">Redirecting to home page...</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {!account ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-6">
                  You need to connect your wallet to create a campaign
                </p>
                <button
                  onClick={connectWallet}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Campaign Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your campaign name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Funding Goal (ETH) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="goal"
                      value={formData.goal}
                      onChange={handleInputChange}
                      placeholder="Enter amount in ETH"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Campaign Duration
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                      {DURATIONS.map((duration) => (
                        <option key={duration.value} value={duration.value}>
                          {duration.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Campaign Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell people about your campaign"
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Campaign Details</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • You will be the campaign creator and fund recipient
                    </li>
                    <li>
                      • Contributors can request refunds if the goal is not reached
                    </li>
                    <li>
                      • As creator, you can create withdrawal requests
                    </li>
                    <li>
                      • Contributors vote on withdrawal requests
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader className="w-5 h-5 animate-spin" />}
                  {loading ? "Creating Campaign..." : "Create Campaign"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
