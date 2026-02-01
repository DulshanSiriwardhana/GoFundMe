import { Clock, Users, ArrowUpRight, ShieldCheck, Zap, Heart, Globe, TreePine } from "lucide-react";
import { useMemo } from "react";

interface FundCardProps {
  name: string;
  description?: string;
  imageUri?: string;
  goal: string;
  raised: string;
  creator: string;
  deadline: number;
  contributors: number;
  category?: string;
  onClick: () => void;
}

export default function FundCard({
  name,
  description,
  imageUri,
  goal,
  raised,
  creator,
  deadline,
  contributors,
  category = "Community",
  onClick
}: FundCardProps) {
  const progress = Math.min((parseFloat(raised) / parseFloat(goal)) * 100, 100);
  const timeLeft = Math.max(0, Math.ceil((deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24)));
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const categoryConfig = useMemo(() => {
    switch (category) {
      case "Tech": return { icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", gradient: "from-blue-600 to-emerald-500" };
      case "Charity": return { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", gradient: "from-rose-600 to-ruby-500" };
      case "Creative": return { icon: Globe, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", gradient: "from-purple-600 to-indigo-500" };
      case "Environment": return { icon: TreePine, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-600 to-teal-500" };
      default: return { icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-600/10", border: "border-emerald-600/20", gradient: "from-emerald-700 to-teal-900" };
    }
  }, [category]);

  const CategoryIcon = categoryConfig.icon;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-white border border-emerald-50 rounded-2xl overflow-hidden hover:border-emerald-200 hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
    >
      <div className={`aspect-video relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500`}>
        {imageUri ? (
          <img
            src={imageUri}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop";
            }}
          />
        ) : (
          <div className={`w-full h-full bg-linear-to-br ${categoryConfig.gradient} opacity-90`}>
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-3xl font-black">
                {name.charAt(0)}
              </div>
            </div>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border flex items-center gap-1.5 ${categoryConfig.bg} ${categoryConfig.color} ${categoryConfig.border}`}>
            <CategoryIcon className="w-3 h-3" />
            {category}
          </div>
        </div>
        <div className="absolute bottom-4 right-4">
          <div className="w-8 h-8 rounded-lg bg-white shadow-lg flex items-center justify-center text-emerald-600 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-lg font-black text-emerald-950 leading-tight group-hover:text-emerald-600 transition-colors">
              {name}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-900/50 uppercase tracking-widest">
            <span>By {formatAddress(creator)}</span>
          </div>
          {description && (
            <p className="text-xs text-emerald-900/60 font-medium line-clamp-2 leading-relaxed pt-1">
              {description}
            </p>
          )}
        </div>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-emerald-950">{parseFloat(raised).toFixed(3)}</span>
                <span className="text-[10px] font-black text-emerald-600">ETH</span>
              </div>
              <span className="text-[10px] font-black text-emerald-900/50 uppercase tracking-widest">
                {progress.toFixed(0)}% of {goal} ETH
              </span>
            </div>
            <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-linear-to-r ${categoryConfig.gradient} transition-all duration-1000 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest">Ends In</span>
                <span className="text-[10px] font-black text-emerald-950">{timeLeft} Days</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest">Backers</span>
                <span className="text-[10px] font-black text-emerald-950">{contributors}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
