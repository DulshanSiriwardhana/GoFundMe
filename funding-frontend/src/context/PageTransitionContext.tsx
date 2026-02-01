import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from '../components/Loader';

interface PageTransitionContextType {
    setLoading: (loading: boolean) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Show loader on route change
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800); // Show for 800ms for a smooth transition

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <PageTransitionContext.Provider value={{ setLoading }}>
            {loading && <Loader fullPage message="Switching Protocols" />}
            {children}
        </PageTransitionContext.Provider>
    );
}

export function usePageTransition() {
    const context = useContext(PageTransitionContext);
    if (context === undefined) {
        throw new Error('usePageTransition must be used within a PageTransitionProvider');
    }
    return context;
}
