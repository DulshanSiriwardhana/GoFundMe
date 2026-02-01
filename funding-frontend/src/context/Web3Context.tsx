import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { ethers } from "ethers";
import { modal } from "../utils/web3modal";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";

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

    // WalletConnect / AppKit Hooks
    const { address, isConnected } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider('eip155');

    const connectWallet = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (typeof (window as any).ethereum !== "undefined") {
                const _provider = new ethers.BrowserProvider((window as any).ethereum);
                const accounts = await _provider.send("eth_requestAccounts", []);
                const _signer = await _provider.getSigner();

                setAccount(accounts[0]);
                setProvider(_provider);
                setSigner(_signer);
            } else {
                // Fallback to WalletConnect if MetaMask is missing
                await modal.open();
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

    const disconnectWallet = async () => {
        await modal.disconnect();
        setAccount(null);
        setProvider(null);
        setSigner(null);
    };

    // Auto-sync AppKit state
    useEffect(() => {
        const syncAppKit = async () => {
            if (isConnected && address && walletProvider) {
                const _provider = new ethers.BrowserProvider(walletProvider as any);
                const _signer = await _provider.getSigner();
                setAccount(address || null);
                setProvider(_provider);
                setSigner(_signer);
            }
        };
        syncAppKit();
    }, [isConnected, address, walletProvider]);

    useEffect(() => {
        const init = async () => {
            if (typeof (window as any).ethereum !== "undefined") {
                const _provider = new ethers.BrowserProvider((window as any).ethereum);
                try {
                    const accounts = await _provider.listAccounts();
                    if (accounts.length > 0) {
                        const _signer = await _provider.getSigner();
                        setAccount(accounts[0].address);
                        setProvider(_provider);
                        setSigner(_signer);
                    }
                } catch (e) {
                    console.error("Auto connect failed", e);
                }
            }
            setIsLoading(false);
        };

        if (!isConnected) {
            init();
        } else {
            setIsLoading(false);
        }

        const handleAccountsChanged = (accounts: any) => {
            if (Array.isArray(accounts) && accounts.length > 0) {
                setAccount(accounts[0]);
                window.location.reload();
            } else {
                setAccount(null);
                setSigner(null);
            }
        };

        const ethereum = (window as any).ethereum;
        if (ethereum) {
            ethereum.on('accountsChanged', handleAccountsChanged);
        }

        return () => {
            if (ethereum && ethereum.removeListener) {
                ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        }
    }, [isConnected]);

    return (
        <Web3Context.Provider value={{ account, provider, signer, connectWallet, disconnectWallet, isLoading, error }}>
            {children}
        </Web3Context.Provider>
    );
}


// eslint-disable-next-line react-refresh/only-export-components
export const useWeb3 = () => useContext(Web3Context);
