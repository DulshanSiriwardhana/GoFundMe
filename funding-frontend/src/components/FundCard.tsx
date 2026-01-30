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
    <Card onClick={onClick} className="group cursor-pointer p-0 overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-600 transition-all duration-300">
      <div className="h-40 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 relative flex items-end p-4">
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-900 shadow-lg">
          {isActive ? "Active" : "Closed"}
        </div>
        <div className="text-white">
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-extrabold text-white truncate flex-1 pr-4 group-hover:text-emerald-300 transition-colors">
            {name}
          </h3>
          <ArrowUpRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
        </div>

        <p className="text-xs font-medium text-emerald-200 mb-6 flex items-center gap-1">
          by <span className="text-white bg-emerald-800/50 px-1.5 rounded">{formatAddress(creator)}</span>
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold text-white">{parseFloat(raised).toFixed(2)} <span className="text-sm font-medium text-emerald-200">ETH</span></span>
              <span className="text-xs font-bold text-emerald-900 bg-emerald-300 px-2 py-1 rounded-full">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-emerald-900/30 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-out shadow-lg shadow-emerald-400/50"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-emerald-200 mt-1">
              <span>Raised</span>
              <span>Goal: {parseFloat(goal).toFixed(2)} ETH</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-emerald-800/50 text-xs font-medium text-emerald-200">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              {contributors} backers
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              {timeLeft}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
