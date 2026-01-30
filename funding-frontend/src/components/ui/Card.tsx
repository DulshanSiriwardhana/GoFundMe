import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 ${className}`}
        >
            {children}
        </div>
    );
}
