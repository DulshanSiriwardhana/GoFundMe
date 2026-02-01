async function main() {
  console.log("Deploying GoFundMe contracts...");

  // Deploy FundFactory
  const FundFactory = await ethers.getContractFactory("FundFactory");
  const fundFactory = await FundFactory.deploy();
  await fundFactory.waitForDeployment();
  const fundFactoryAddress = await fundFactory.getAddress();
  console.log("FundFactory deployed to:", fundFactoryAddress);

  // Save deployment addresses
  const deploymentAddresses = {
    FundFactory: fundFactoryAddress,
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
