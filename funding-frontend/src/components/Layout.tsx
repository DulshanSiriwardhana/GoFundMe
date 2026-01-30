import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { Wallet, Plus, Home as HomeIcon, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    const { account, connectWallet } = useWeb3();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: "Browse Funds", path: "/", icon: <HomeIcon className="w-4 h-4" /> },
        { name: "Start a Fund", path: "/create", icon: <Plus className="w-4 h-4" /> },
        { name: "My Dashboard", path: "/my-funds", icon: <LayoutDashboard className="w-4 h-4" /> },
    ];

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="min-h-screen bg-emerald-950 text-white font-sans selection:bg-emerald-500 selection:text-white">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/80 backdrop-blur-md border-b border-emerald-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                G
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">
                                GoFundChain
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === link.path
                                        ? "text-emerald-400"
                                        : "text-emerald-200/70 hover:text-emerald-400"
                                        }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            {account ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/50 text-emerald-100 rounded-full text-sm font-semibold border border-emerald-500/30 shadow-sm">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                    {formatAddress(account)}
                                </div>
                            ) : (
                                <button
                                    onClick={connectWallet}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-emerald-900/20 transition-all active:scale-95 border border-emerald-500/20"
                                >
                                    <Wallet className="w-4 h-4" />
                                    Connect Wallet
                                </button>
                            )}
                        </div>

                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-emerald-200 hover:text-white">
                                {isMobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden bg-emerald-900 border-t border-emerald-800 absolute w-full px-4 py-4 shadow-xl flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-2 text-base font-medium transition-colors ${location.pathname === link.path
                                    ? "text-emerald-400"
                                    : "text-emerald-200 hover:text-emerald-400"
                                    }`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-emerald-800">
                            {account ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-800 text-emerald-100 rounded-lg text-sm font-semibold">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                                    {formatAddress(account)}
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        connectWallet();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-md active:scale-95"
                                >
                                    <Wallet className="w-4 h-4" />
                                    Connect Wallet
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {children}
            </main>

            <footer className="bg-emerald-950 border-t border-emerald-900 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-emerald-600/60">
                    <p>&copy; 2026 GoFundChain. Decentralized Crowdfunding.</p>
                </div>
            </footer>
        </div>
    );
}
