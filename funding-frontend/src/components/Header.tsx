import { Wallet, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  account?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function Header({ account, onConnect, onDisconnect }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatAddress = (addr: string) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`;

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">GF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">GoFundMe</span>
          </Link>

          <nav className="hidden md:flex gap-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Home
            </Link>
            <Link to="/create" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Create Fund
            </Link>
            <Link to="/my-funds" className="text-gray-600 hover:text-blue-600 font-medium transition">
              My Funds
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {account ? (
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{formatAddress(account)}</span>
                <button
                  onClick={onDisconnect}
                  className="p-1 hover:bg-gray-200 rounded transition"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </button>
            )}

            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            <Link to="/" className="block text-gray-600 hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link to="/create" className="block text-gray-600 hover:text-blue-600 font-medium">
              Create Fund
            </Link>
            <Link to="/my-funds" className="block text-gray-600 hover:text-blue-600 font-medium">
              My Funds
            </Link>
            {!account && (
              <button
                onClick={onConnect}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
