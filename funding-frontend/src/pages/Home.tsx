import { useState } from "react";
import { ethers } from "ethers";
import { FACTORY_ABI, FACTORY_ADDRESS } from "../utils/contract";

export default function Home() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  async function createFund() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const factory = new ethers.Contract(
      FACTORY_ADDRESS,
      FACTORY_ABI,
      signer
    );

    await factory.createFund(
      name,
      ethers.parseEther(goal),
      604800
    );

    alert("Fund Created!");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Create Fund</h1>

      <input placeholder="Project Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Goal (ETH)" onChange={e => setGoal(e.target.value)} />

      <button onClick={createFund}>Create</button>
    </div>
  );
}
