import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { FACTORY_ADDRESS, FACTORY_ABI } from "../utils/contract";
import { Calendar, Target, Type, Sparkles, Wand2, Shield, Globe, Zap, AlertCircle, Image as ImageIcon } from "lucide-react";
import { useAlert } from "../context/AlertContext";
import { Card } from "../components/ui/Card";
import { uploadToPinata } from "../utils/pinata";

export default function CreateFund() {
  const navigate = useNavigate();
  const { signer, account } = useWeb3();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "",
    duration: "30"
  });

  const truncateFileName = (name: string, limit = 20) => {
    if (name.length <= limit) return name;
    const lastDot = name.lastIndexOf('.');
    const ext = lastDot !== -1 ? name.substring(lastDot) : '';
    const base = lastDot !== -1 ? name.substring(0, lastDot) : name;
    return base.substring(0, limit - ext.length - 3) + "..." + ext;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer || !account) {
      showAlert("error", "Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      let imageUri = "";
      if (file) {
        showAlert("info", "Uploading image to IPFS...");
        imageUri = await uploadToPinata(file);
      }

      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const goalWei = ethers.parseEther(formData.goal);
      const durationSec = parseInt(formData.duration) * 86400;

      const tx = await factory.createFund(formData.name, formData.description, imageUri, goalWei, durationSec);
      await tx.wait();

      showAlert("success", "Project initialized on the blockchain!");
      navigate("/my-funds");
    } catch (err: any) {
      console.error("Creation failed:", err);
      showAlert("error", err.message || "Deployment failed. Check your wallet.");
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
            <p className="text-emerald-900/40 font-bold uppercase tracking-widest text-[10px] mt-2">Connect your wallet to initiate a fund</p>
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
              <Sparkles className="w-2.5 h-2.5" /> Fund Builder
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 tracking-tight leading-[1.1]">
              Launch your <br />
              <span className="text-emerald-600 italic">Fund.</span>
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
          <Card className="p-6 md:p-8 border border-emerald-100 rounded-3xl bg-white shadow-2xl shadow-emerald-950/5 relative overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-emerald-500" /> Project Identifier
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Enter fund name..."
                    className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-950 font-bold focus:border-emerald-500 focus:outline-none transition-all placeholder:text-emerald-900/30 text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" /> Mission Brief
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Explain the impact of this fund..."
                    className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-950 font-bold focus:border-emerald-500 focus:outline-none transition-all placeholder:text-emerald-900/30 resize-none text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-emerald-500" /> Goal (ETH)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-950 font-bold focus:border-emerald-500 focus:outline-none transition-all placeholder:text-emerald-900/30 text-sm"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Days
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      max="365"
                      className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-950 font-bold focus:border-emerald-500 focus:outline-none transition-all text-sm"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> Visual (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-transparent font-bold focus:border-emerald-500 focus:outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
                  />
                  {file && (
                    <div className="flex items-center gap-2 mt-1 px-1 min-w-0">
                      <span className="text-[10px] font-black text-emerald-950 uppercase tracking-widest whitespace-nowrap shrink-0">Selected:</span>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest truncate min-w-0" title={file.name}>
                        {truncateFileName(file.name)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black text-base shadow-xl shadow-emerald-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'cursor-wait opacity-80' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <span>Initiate Protocol</span>
                    <Wand2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-amber-50/40 border border-amber-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-amber-900/60 font-black uppercase tracking-widest leading-relaxed">
                Network persistence requires a gas fee. All data is permanent.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
