import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, sepolia, localhost } from '@reown/appkit/networks'

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'b5681c4234b66c02bc45000e407137f8' // Placeholder for development

// 2. Create your application's metadata object
const metadata = {
    name: 'GoFundChain',
    description: 'Decentralized Crowdfunding Platform',
    url: 'https://gofundchain.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Create the AppKit instance
export const modal = createAppKit({
    adapters: [new EthersAdapter()],
    networks: [mainnet, sepolia, localhost],
    metadata,
    projectId,
    features: {
        analytics: true
    }
})
