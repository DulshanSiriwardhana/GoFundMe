import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

import { FACTORY_ADDRESS, FACTORY_ABI } from "../utils/contract";
import { ArrowRight, Calendar, Target, Type, Sparkles } from "lucide-react";
import { useAlert } from "../context/AlertContext";
import { Card } from "../components/ui/Card";

export default function CreateFund() {
  const navigate = useNavigate();
  const { provider, signer } = useWeb3();

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    duration: "30",
  });

  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !signer) {
      showAlert("warning", "Please connect your wallet first.");
      return;
    }

    setLoading(true);

    try {
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const goalInWei = ethers.parseEther(formData.goal);
      const durationInSeconds = parseInt(formData.duration) * 24 * 60 * 60;

      const tx = await factory.createFund(formData.name, goalInWei, durationInSeconds);
      await tx.wait();

      showAlert("success", "Success! Your campaign has been launched on the blockchain.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: unknown) {
      console.error(err);
      let message = "Failed to launch campaign.";
      if (err instanceof Error) {
        message = (err as { reason?: string; message?: string }).reason || err.message || message;
      }
      showAlert("error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-16">
      <Card className="p-10 border-emerald-100 bg-white shadow-2xl shadow-emerald-900/10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Sparkles className="w-3 h-3" /> Start something new
          </div>
          <h2 className="text-4xl font-black text-emerald-950 tracking-tight">
            Launch Your <span className="text-emerald-500">Campaign</span>
          </h2>
          <p className="text-emerald-900/40 text-sm font-bold mt-4 uppercase tracking-widest">
            Fill in the details to deploy your contract
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-emerald-900/60 ml-1">Campaign Name</label>
            <div className="relative group">
              <input
                type="text"
                required
                className="w-full bg-emerald-50/50 border-2 border-emerald-50 rounded-2xl px-5 py-4 pl-12 text-emerald-950 font-bold placeholder:text-emerald-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                placeholder="e.g. Save the Ocean"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Type className="absolute left-4.5 top-4.5 w-5 h-5 text-emerald-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-emerald-900/60 ml-1">Funding Goal (ETH)</label>
              <div className="relative group">
                <input
                  type="number"
                  step="0.001"
                  required
                  className="w-full bg-emerald-50/50 border-2 border-emerald-50 rounded-2xl px-5 py-4 pl-12 text-emerald-950 font-bold placeholder:text-emerald-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  placeholder="5.00"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                />
                <Target className="absolute left-4.5 top-4.5 w-5 h-5 text-emerald-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-emerald-900/60 ml-1">Duration (Days)</label>
              <div className="relative group">
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  className="w-full bg-emerald-50/50 border-2 border-emerald-50 rounded-2xl px-5 py-4 pl-12 text-emerald-950 font-bold placeholder:text-emerald-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
                <Calendar className="absolute left-4.5 top-4.5 w-5 h-5 text-emerald-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg mt-10"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Launching...
              </>
            ) : (
              <>
                Launch Campaign <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </form>
      </Card>
      <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/20 mt-8">
        Immutable Smart Contract &bull; Blockchain Powered &bull; Gas Fees Apply
      </p>
    </div>
  );
}
