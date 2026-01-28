async function main() {
  console.log("Deploying GoFundMe contracts...");

  // Deploy FundFactory
  const FundFactory = await ethers.getContractFactory("FundFactory");
  const fundFactory = await FundFactory.deploy();
  await fundFactory.deployed();
  console.log("✓ FundFactory deployed to:", fundFactory.address);

  // Save deployment addresses
  const deploymentAddresses = {
    FundFactory: fundFactory.address,
    deployedAt: new Date().toISOString(),
    network: (await ethers.provider.getNetwork()).name,
  };

  console.log("\nDeployment Summary:");
  console.log(JSON.stringify(deploymentAddresses, null, 2));

  return deploymentAddresses;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
