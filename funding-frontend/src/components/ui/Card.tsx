import { type ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-emerald-900/40 backdrop-blur-md border border-emerald-500/20 rounded-2xl shadow-xl transition-all duration-300 ${className}`}
        >
            {children}
        </div>
    );
}
