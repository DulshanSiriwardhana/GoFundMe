import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { ethers } from "ethers";

interface Web3ContextType {
    account: string | null;
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    isLoading: boolean;
    error: string | null;
}

const Web3Context = createContext<Web3ContextType>({} as Web3ContextType);

export function Web3Provider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const connectWallet = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (typeof window.ethereum !== "undefined") {
                const _provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await _provider.send("eth_requestAccounts", []);
                const _signer = await _provider.getSigner();

                setAccount(accounts[0]);
                setProvider(_provider);
                setSigner(_signer);
            } else {
                setError("Please install MetaMask!");
            }
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to connect wallet");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setSigner(null);
    };

    useEffect(() => {
        const init = async () => {
            if (typeof window.ethereum !== "undefined") {
                const _provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(_provider);

                try {
                    const accounts = await _provider.listAccounts();
                    if (accounts.length > 0) {
                        const _signer = await _provider.getSigner();
                        setAccount(accounts[0].address);
                        setSigner(_signer);
                    }
                } catch (e) {
                    console.error("Auto connect failed", e);
                }
            }
            setIsLoading(false);
        };

        init();

        const handleAccountsChanged = (accounts: unknown) => {
            const accs = accounts as string[];
            if (accs.length > 0) {
                setAccount(accs[0]);
                window.location.reload();
            } else {
                setAccount(null);
                setSigner(null);
            }
        };

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        }
    }, []);

    return (
        <Web3Context.Provider value={{ account, provider, signer, connectWallet, disconnectWallet, isLoading, error }}>
            {children}
        </Web3Context.Provider>
    );
}


// eslint-disable-next-line react-refresh/only-export-components
export const useWeb3 = () => useContext(Web3Context);
