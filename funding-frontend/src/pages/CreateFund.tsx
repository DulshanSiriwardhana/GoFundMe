import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

import { FACTORY_ADDRESS, FACTORY_ABI } from "../utils/contract";
import { ArrowRight, Calendar, Target, AlertCircle, Type } from "lucide-react";

export default function CreateFund() {
  const navigate = useNavigate();
  const { provider, signer } = useWeb3();

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    duration: "30",
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

      await tx.wait();

      navigate("/");
    } catch (err: unknown) {
      console.error(err);
      let message = "Failed to create fund.";
      if (err instanceof Error) {
        message = (err as { reason?: string; message?: string }).reason || err.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-white">
          Launch Your <span className="text-emerald-400">Campaign</span>
        </h2>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-emerald-200">Campaign Name</label>
            <div className="relative group">
              <input
                type="text"
                required
                className="w-full bg-emerald-900/50 border border-emerald-700 rounded-xl px-4 py-3.5 pl-11 text-white placeholder:text-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="e.g. Community Garden"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Type className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-600 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-emerald-200">Funding Goal (ETH)</label>
            <div className="relative group">
              <input
                type="number"
                step="0.001"
                required
                className="w-full bg-emerald-900/50 border border-emerald-700 rounded-xl px-4 py-3.5 pl-11 text-white placeholder:text-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="10.0"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              />
              <Target className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-600 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-emerald-200">Duration (Days)</label>
            <div className="relative group">
              <input
                type="number"
                min="1"
                max="365"
                required
                className="w-full bg-emerald-900/50 border border-emerald-700 rounded-xl px-4 py-3.5 pl-11 text-white placeholder:text-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="30"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
              <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-600 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Campaign <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
      <p className="text-center text-xs text-slate-400 mt-4">
        By launching, you are deploying a immutable smart contract. Gas fees apply.
      </p>
    </div>
  );
}
