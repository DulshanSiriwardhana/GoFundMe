import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import Toast, { type ToastType } from "../components/Toast";

interface Alert {
    id: string;
    type: ToastType;
    message: string;
}

interface AlertContextType {
    showAlert: (type: ToastType, message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const showAlert = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setAlerts((prev) => [...prev, { id, type, message }]);
    }, []);

    const removeAlert = useCallback((id: string) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <div className="fixed top-24 right-4 z-50 flex flex-col gap-4">
                {alerts.map((alert) => (
                    <Toast
                        key={alert.id}
                        type={alert.type}
                        message={alert.message}
                        onClose={() => removeAlert(alert.id)}
                    />
                ))}
            </div>
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error("useAlert must be used within an AlertProvider");
    }
    return context;
}
