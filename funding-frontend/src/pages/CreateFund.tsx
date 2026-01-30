import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { Card } from "../components/ui/Card";
import { FACTORY_ADDRESS, FACTORY_ABI } from "../utils/contract";
import { Rocket, Calendar, Target, AlertTriangle } from "lucide-react";

export default function CreateFund() {
  const navigate = useNavigate();
  const { provider, signer } = useWeb3();

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    duration: "30", // days
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !signer) {
      setError("Please connect your wallet first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const goalInWei = ethers.parseEther(formData.goal);
      const durationInSeconds = parseInt(formData.duration) * 24 * 60 * 60;

      const tx = await factory.createFund(formData.name, goalInWei, durationInSeconds);

      // Wait for transaction receipt
      const receipt = await tx.wait();

      // Look for FundCreated event to get the address (optional, or just go to home)
      // For now, simpler to redirect home
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.reason || err.message || "Failed to create fund.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Start your Campaign</h1>
        <p className="text-slate-600">Tell your story and start raising funds on the blockchain.</p>
      </div>

      <Card>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Title</label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. Community Garden Project"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Target className="w-4 h-4 text-slate-400" /> goal Amount (ETH)
              </label>
              <input
                required
                type="number"
                step="0.001"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="10.0"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" /> Duration (Days)
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Creating Contract..."
              ) : (
                <>
                  <Rocket className="w-5 h-5" /> Launch Campaign
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
              By launching, you are deploying a immutable smart contract. Gas fees apply.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
