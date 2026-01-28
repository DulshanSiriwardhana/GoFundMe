import { ethers } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("FundFactory");
  const factory = await Factory.deploy();

  await factory.waitForDeployment();

  console.log("Factory deployed at:", await factory.getAddress());
}

main();
