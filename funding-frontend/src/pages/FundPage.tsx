import { useState } from "react";
import { ethers } from "ethers";
import { FUND_ABI } from "../utils/contract";
import { useAlert } from "../context/AlertContext";

export default function FundPage({ fundAddress }: { fundAddress: string }) {
  const [amount, setAmount] = useState("");
  const { showAlert } = useAlert();

  async function deposit() {
    if (!(window as any).ethereum) {
      showAlert("warning", "Please install MetaMask");
      return;
    }
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    const fund = new ethers.Contract(fundAddress, FUND_ABI, signer);

    try {
      await fund.deposit({
        value: ethers.parseEther(amount)
      });
      showAlert("success", "Deposit Success!");
    } catch (err) {
      console.error(err);
      showAlert("error", "Deposit failed");
    }
  }

  return (
    <div className="p-8 bg-white border border-emerald-100 rounded-3xl shadow-xl">
      <h2 className="text-2xl font-black text-emerald-950 mb-6 tracking-tight">Fund Project</h2>
      <div className="flex gap-4">
        <input
          className="flex-1 bg-emerald-50 border-2 border-emerald-50 rounded-xl px-4 py-3 text-emerald-950 font-bold focus:outline-none focus:border-emerald-500 transition-all font-serif"
          placeholder="0.1"
          onChange={e => setAmount(e.target.value)}
        />
        <button
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all font-serif"
          onClick={deposit}
        >
          Deposit
        </button>
      </div>
    </div>
  );
}
