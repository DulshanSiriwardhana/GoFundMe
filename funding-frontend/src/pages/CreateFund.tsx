import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { FACTORY_ADDRESS, FACTORY_ABI } from "../utils/contract";
import { Calendar, Target, Type, Sparkles, Wand2, Shield, Globe, Zap, AlertCircle } from "lucide-react";
import { useAlert } from "../context/AlertContext";
import { Card } from "../components/ui/Card";

export default function CreateFund() {
  const navigate = useNavigate();
  const { signer, account } = useWeb3();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    duration: "30"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer || !account) {
      showAlert("error", "Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const goalWei = ethers.parseEther(formData.goal);
      const durationSec = parseInt(formData.duration) * 86400;

      const tx = await factory.createFund(formData.name, goalWei, durationSec);
      await tx.wait();

      showAlert("success", "Project initialized on the blockchain!");
      navigate("/my-funds");
    } catch (err: any) {
      console.error("Creation failed:", err);
      showAlert("error", err.reason || "Deployment failed. Check your wallet.");
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6">
        <div className="text-center space-y-8 p-12 border border-emerald-50 rounded-2xl bg-white shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto text-emerald-300">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-emerald-950 italic">Authentication Required.</h2>
            <p className="text-emerald-900/40 font-bold uppercase tracking-widest text-[10px] mt-2">Connect your wallet to initiate a vision</p>
          </div>
          <button onClick={() => navigate('/')} className="px-8 py-4 bg-emerald-600 text-white font-black rounded-xl shadow-lg active:scale-95">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 md:py-20 px-4">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100">
              <Sparkles className="w-2.5 h-2.5" /> Vision Builder
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 tracking-tight leading-[1.1]">
              Launch your <br />
              <span className="text-emerald-600 italic">Vision.</span>
            </h1>
            <p className="text-base md:text-lg text-emerald-900/50 font-medium leading-relaxed max-w-md">
              Turn your ideas into decentralized reality. Secure funding globally with zero intermediaries.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {[
              { icon: Shield, label: "Secure Protocol", desc: "Non-custodial smart contracts." },
              { icon: Globe, label: "Global Access", desc: "Receive ETH from anywhere." },
              { icon: Zap, label: "Instant Execution", desc: "Live on mainnet in seconds." }
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-100/50 group">
                <div className="p-3 bg-white border border-emerald-100 rounded-xl text-emerald-500 shadow-sm h-fit group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-emerald-950 text-sm leading-tight mb-1">{f.label}</h4>
                  <p className="text-xs text-emerald-900/40 font-medium leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-emerald-100/20 rounded-[2.5rem] blur-3xl -z-10" />
          <Card className="p-8 md:p-10 border border-emerald-100 rounded-3xl bg-white shadow-2xl shadow-emerald-950/5 relative overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-emerald-500" /> Project Identifier
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Enter vision name..."
                    className="w-full px-5 py-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-950 font-bold focus:border-emerald-500 focus:outline-none transition-all placeholder:text-emerald-900/30"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-emerald-500" /> Funding Intensity (ETH)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-5 py-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-950 font-bold focus:border-emerald-500 focus:outline-none transition-all placeholder:text-emerald-900/30"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Mission Duration (Days)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="365"
                    className="w-full px-5 py-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-950 font-bold focus:border-emerald-500 focus:outline-none transition-all"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-xl font-black text-lg shadow-xl shadow-emerald-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${loading ? 'cursor-wait opacity-80' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <span>Initiate Protocol</span>
                    <Wand2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-5 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-900/70 font-black uppercase tracking-widest leading-loose">
                Note: Deployment requires a small transaction fee (Gas). This vision will be permanent on the blockchain.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
