import hre from "hardhat";

async function main() {
  const publicClient = await hre.viem.getPublicClient();
  const [deployerAccount] = await hre.viem.getWalletClients();
  
  const Factory = await hre.viem.getContractFactory("FundFactory");
  const factory = await hre.viem.deployContract("FundFactory", [], {
    account: deployerAccount.account,
  });

  console.log("Factory deployed at:", factory.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
