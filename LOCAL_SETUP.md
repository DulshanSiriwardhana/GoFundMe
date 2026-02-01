# GoFundChain Local Setup Guide

Follow these steps to get the GoFundChain protocol running on your local machine using Anvil.

## 1. Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for Anvil)
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/docs/manual/installation/) (Running locally)
- [Metamask](https://metamask.io/) installed in your browser

---

## 2. Start Local Blockchain (Anvil)
In a new terminal, navigate to the root and run:
```bash
anvil
```
*Keep this terminal running. It will provide you with several test accounts and private keys.*

---

## 3. Deploy Smart Contracts
Open a new terminal and navigate to the `smartcontracts` directory:
```bash
cd smartcontracts
npm install
npx hardhat run scripts/deploy.ts --network localhost
```
**Important:** Copy the `Factory deployed at: 0x...` address from the output. You will need it for the frontend configuration.

---

## 4. Setup Backend
Navigate to the `backend` directory:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/gofundme
FACTORY_ADDRESS=PASTE_YOUR_FACTORY_ADDRESS_HERE
LOCALHOST_RPC_URL=http://localhost:8545
```
Start the backend:
```bash
npm run dev
```

---

## 5. Setup Frontend
Navigate to the `funding-frontend` directory:
```bash
cd funding-frontend
yarn install
```
Create a `.env` file in the `funding-frontend` folder:
```env
VITE_FACTORY_ADDRESS=PASTE_YOUR_FACTORY_ADDRESS_HERE
VITE_API_BASE_URL=http://localhost:3001
VITE_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```
Start the frontend:
```bash
yarn dev
```

---

## 6. Configure Metamask
1. Open Metamask and add a **Custom RPC Network**:
   - Network Name: `Anvil Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
2. **Import Account**: Use one of the private keys provided by the `anvil` command (the first one is usually the admin/deployer).

---

## 7. Using the App
- **Home**: `http://localhost:5173`
- **Admin Dashboard**: Accessible if connected with the deployer account at `http://localhost:5173/admin`
