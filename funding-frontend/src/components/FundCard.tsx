import { Users, Clock, Target, ArrowUpRight } from "lucide-react";
import { Card } from "./ui/Card";

interface FundCardProps {
  name: string;
  goal: string;
  raised: string;
  creator: string;
  deadline: number;
  goalReached: boolean;
  contributors: number;
  onClick?: () => void;
}

export default function FundCard({
  name,
  goal,
  raised,
  creator,
  deadline,
  goalReached,
  contributors,
  onClick,
}: FundCardProps) {
  const progress = Math.min((parseFloat(raised) / parseFloat(goal)) * 100, 100);
  const timeLeft = new Date(deadline * 1000).toLocaleDateString();
  const isActive = deadline * 1000 > Date.now();

  const formatAddress = (addr: string) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`;

  return (
    <Card onClick={onClick} className="group cursor-pointer p-0 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
      <div className="h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative flex items-end p-4">
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-900 shadow-sm">
          {isActive ? "Active" : "Closed"}
        </div>
        <div className="text-white">
          {/* Placeholder for project icon or identicon usually */}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-extrabold text-slate-900 truncate flex-1 pr-4 group-hover:text-indigo-600 transition-colors">
            {name}
          </h3>
          <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
        </div>

        <p className="text-xs font-medium text-slate-500 mb-6 flex items-center gap-1">
          by <span className="text-slate-700 bg-slate-100 px-1.5 rounded">{formatAddress(creator)}</span>
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold text-slate-900">{parseFloat(raised).toFixed(2)} <span className="text-sm font-medium text-slate-500">ETH</span></span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Raised</span>
              <span>Goal: {parseFloat(goal).toFixed(2)} ETH</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              {contributors} backers
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {timeLeft}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
