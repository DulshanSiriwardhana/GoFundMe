import { Users, Clock, Target } from "lucide-react";

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
  const progress = (parseFloat(raised) / parseFloat(goal)) * 100;
  const timeLeft = new Date(deadline * 1000).toLocaleDateString();
  const isActive = deadline > Date.now() / 1000;

  const formatAddress = (addr: string) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden border border-gray-100"
    >
      <div className="h-32 bg-linear-to-r from-blue-500 to-indigo-600 relative">
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Active" : "Ended"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 truncate mb-2">{name}</h3>

        <p className="text-xs text-gray-500 mb-3">
          Creator: <span className="font-medium">{formatAddress(creator)}</span>
        </p>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm font-bold text-blue-600">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-linear-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Raised</p>
              <p className="font-bold text-gray-900">{parseFloat(raised).toFixed(2)} ETH</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Goal</p>
              <p className="font-bold text-gray-900">{parseFloat(goal).toFixed(2)} ETH</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {contributors} backers
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {timeLeft}
          </div>
        </div>

        {goalReached && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
            <Target className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700">Goal Reached!</span>
          </div>
        )}
      </div>
    </div>
  );
}
