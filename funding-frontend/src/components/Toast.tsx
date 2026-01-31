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
            bg: "bg-white",
            text: "text-emerald-900",
            icon: CheckCircle,
            iconColor: "text-emerald-500",
            border: "border-emerald-100",
        },
        error: {
            bg: "bg-white",
            text: "text-red-900",
            icon: XCircle,
            iconColor: "text-red-500",
            border: "border-red-100",
        },
        warning: {
            bg: "bg-white",
            text: "text-amber-900",
            icon: AlertTriangle,
            iconColor: "text-amber-500",
            border: "border-amber-100",
        },
        info: {
            bg: "bg-white",
            text: "text-blue-900",
            icon: Info,
            iconColor: "text-blue-500",
            border: "border-blue-100",
        },
    };

    const { bg, text, icon: Icon, iconColor, border } = styles[type];

    return (
        <div
            className={`flex items-center gap-3 min-w-[320px] max-w-md ${bg} ${text} ${border} border-2 px-6 py-4 rounded-2xl shadow-xl shadow-emerald-900/5 animate-slide-in relative overflow-hidden`}
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${iconColor.replace('text', 'bg')}`} />
            <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
            <p className="flex-1 font-semibold text-sm">{message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:bg-gray-100 rounded-lg p-1 transition-colors"
            >
                <X className="w-5 h-5 text-gray-400" />
            </button>
        </div>
    );
}
