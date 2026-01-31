import { ArrowUpRight, Clock, Users } from "lucide-react";
import { Card } from "./ui/Card";

interface FundCardProps {
  name: string;
  goal: string;
  raised: string;
  creator: string;
  deadline: number;
  contributors: number;
  onClick: () => void;
}

export default function FundCard({
  name,
  goal,
  raised,
  creator,
  deadline,
  contributors,
  onClick,
}: FundCardProps) {
  const progress = Math.min((parseFloat(raised) / parseFloat(goal)) * 100, 100);
  const timeLeft = new Date(deadline * 1000).toLocaleDateString();
  // eslint-disable-next-line react-hooks/purity
  const isActive = deadline * 1000 > Date.now();

  const formatAddress = (addr: string) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`;

  return (
    <Card onClick={onClick} className="group cursor-pointer p-0 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
      <div className="h-44 bg-emerald-50 relative flex items-end p-6 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-600/10 to-transparent" />
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-800 shadow-sm border border-emerald-100">
          {isActive ? "Active" : "Closed"}
        </div>
        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-600/20 relative z-10">
          {name.charAt(0)}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-emerald-950 truncate flex-1 pr-4 group-hover:text-emerald-600 transition-colors">
            {name}
          </h3>
          <ArrowUpRight className="w-5 h-5 text-emerald-300 group-hover:text-emerald-600 transition-colors" />
        </div>

        <p className="text-xs font-semibold text-emerald-800/60 mb-6 flex items-center gap-1.5">
          by <span className="text-emerald-900 font-bold">{formatAddress(creator)}</span>
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-extrabold text-emerald-950">{parseFloat(raised).toFixed(2)} <span className="text-sm font-bold text-emerald-500">ETH</span></span>
              <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-emerald-50 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-emerald-800/40 mt-2 uppercase tracking-wider">
              <span>Progress</span>
              <span>Goal: {parseFloat(goal).toFixed(2)} ETH</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-emerald-50 text-[11px] font-bold text-emerald-800/50 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              {contributors} backers
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              {timeLeft}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
