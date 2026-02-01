import { Shield } from "lucide-react";

interface LoaderProps {
    message?: string;
    fullPage?: boolean;
}

export default function Loader({ message = "Syncing with Blockchain...", fullPage = false }: LoaderProps) {
    const content = (
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="relative">
                {/* Main Spinner */}
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-600 animate-pulse" />
                </div>

                {/* Outer Glow */}
                <div className="absolute -inset-4 bg-emerald-400/10 blur-xl rounded-full animate-pulse" />
            </div>

            <div className="space-y-2 text-center">
                <p className="text-emerald-900/40 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">
                    {message}
                </p>
                <div className="flex justify-center gap-1">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
}
