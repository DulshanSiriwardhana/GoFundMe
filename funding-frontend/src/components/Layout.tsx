import { ReactNode } from "react";
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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                                G
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                                GoFundChain
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === link.path
                                            ? "text-indigo-600"
                                            : "text-slate-600 hover:text-indigo-600"
                                        }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Wallet Integration */}
                        <div className="hidden md:flex items-center gap-4">
                            {account ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-100 shadow-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    {formatAddress(account)}
                                </div>
                            ) : (
                                <button
                                    onClick={connectWallet}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
                                >
                                    <Wallet className="w-4 h-4" />
                                    Connect Wallet
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:text-indigo-600">
                                {isMobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 absolute w-full px-4 py-4 shadow-xl flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-2 text-base font-medium transition-colors ${location.pathname === link.path
                                        ? "text-indigo-600"
                                        : "text-slate-600 hover:text-indigo-600"
                                    }`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-slate-100">
                            {account ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    {formatAddress(account)}
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        connectWallet();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md active:scale-95"
                                >
                                    <Wallet className="w-4 h-4" />
                                    Connect Wallet
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
                    <p>&copy; 2026 GoFundChain. Decentralized Crowdfunding.</p>
                </div>
            </footer>
        </div>
    );
}
