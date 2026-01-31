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
            className={`bg-white border border-emerald-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
        >
            {children}
        </div>
    );
}
