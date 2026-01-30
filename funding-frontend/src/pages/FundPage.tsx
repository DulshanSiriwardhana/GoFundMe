import { useState } from "react";
import { ethers } from "ethers";
import { FUND_ABI } from "../utils/contract";

export default function FundPage({ fundAddress }: { fundAddress: string }) {
  const [amount, setAmount] = useState("");

  async function deposit() {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const fund = new ethers.Contract(fundAddress, FUND_ABI, signer);

    await fund.deposit({
      value: ethers.parseEther(amount)
    });

    alert("Deposit Success!");
  }

  return (
    <div>
      <h2>Fund Project</h2>
      <input onChange={e => setAmount(e.target.value)} />
      <button onClick={deposit}>Deposit</button>
    </div>
  );
}
