
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (accounts: unknown[] | unknown) => void) => void;
  removeListener: (event: string, callback: (accounts: unknown[] | unknown) => void) => void;
  once: (event: string, callback: (accounts: unknown[] | unknown) => void) => void;
}

declare global {
  interface Window {
    ethereum: EthereumProvider | undefined;
  }
}

export { };
