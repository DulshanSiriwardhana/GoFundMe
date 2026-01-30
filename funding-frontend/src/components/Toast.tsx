import { useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
    type: ToastType;
    message: string;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const styles = {
        success: {
            bg: "bg-emerald-500",
            icon: CheckCircle,
            border: "border-emerald-400",
        },
        error: {
            bg: "bg-red-500",
            icon: XCircle,
            border: "border-red-400",
        },
        warning: {
            bg: "bg-amber-500",
            icon: AlertTriangle,
            border: "border-amber-400",
        },
        info: {
            bg: "bg-blue-500",
            icon: Info,
            border: "border-blue-400",
        },
    };

    const { bg, icon: Icon, border } = styles[type];

    return (
        <div
            className={`fixed top-24 right-4 z-50 ${bg} text-white px-6 py-4 rounded-xl shadow-2xl border-2 ${border} flex items-center gap-3 min-w-[320px] max-w-md animate-slide-in`}
        >
            <Icon className="w-6 h-6 flex-shrink-0" />
            <p className="flex-1 font-medium text-sm">{message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}
