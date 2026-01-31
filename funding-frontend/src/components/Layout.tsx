import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { Wallet, Plus, Home as HomeIcon, LayoutDashboard, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    const { account, connectWallet, disconnectWallet } = useWeb3();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: "Home", path: "/", icon: <HomeIcon className="w-4 h-4" /> },
        { name: "Create Fund", path: "/create", icon: <Plus className="w-4 h-4" /> },
        { name: "My Dashboard", path: "/my-funds", icon: <LayoutDashboard className="w-4 h-4" /> },
    ];

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="min-h-screen bg-[#f0fdf4] text-[#014d40] font-serif selection:bg-emerald-100 selection:text-emerald-900">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-emerald-100/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-all">
                                <img src="/favicon.png" alt="GoFundChain Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-2xl font-extrabold text-emerald-900 tracking-tight">
                                GoFund<span className="text-emerald-500 font-normal">Chain</span>
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 text-sm font-bold transition-all ${location.pathname === link.path
                                        ? "text-emerald-600 border-b-2 border-emerald-500 pb-1"
                                        : "text-emerald-800/70 hover:text-emerald-600"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            {account ? (
                                <div className="flex items-center gap-3">
                                    <div className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200 shadow-sm flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        {formatAddress(account)}
                                    </div>
                                    <button
                                        onClick={disconnectWallet}
                                        className="p-2.5 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        title="Disconnect"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={connectWallet}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                                >
                                    <Wallet className="w-4 h-4" />
                                    Connect Wallet
                                </button>
                            )}
                        </div>

                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                {isMobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-emerald-50 absolute w-full px-4 py-6 shadow-xl flex flex-col gap-5 border-b border-emerald-100">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 text-lg font-bold transition-all ${location.pathname === link.path
                                    ? "text-emerald-600"
                                    : "text-emerald-800/70"
                                    }`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-emerald-50">
                            {account ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        {formatAddress(account)}
                                    </div>
                                    <button
                                        onClick={() => {
                                            disconnectWallet();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        connectWallet();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-bold shadow-lg shadow-emerald-600/20"
                                >
                                    <Wallet className="w-5 h-5" />
                                    Connect Wallet
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {children}
            </main>

            <footer className="bg-emerald-950 text-emerald-100/60 border-t border-emerald-900 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center border border-white/20">
                                <img src="/favicon.png" alt="GoFundChain Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xl font-extrabold text-white tracking-tight">
                                GoFundChain
                            </span>
                        </div>
                        <div className="text-sm">
                            <p>&copy; 2026 GoFundChain. All Rights Reserved.</p>
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Documentation</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
