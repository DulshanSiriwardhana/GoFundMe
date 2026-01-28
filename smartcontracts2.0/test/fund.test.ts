import { expect } from "chai";
import hre from "hardhat";

describe("Fund System", function () {
  it("Should deploy factory", async function () {
    const { ethers } = hre;

    const Factory = await ethers.getContractFactory("FundFactory");
    const factory = await Factory.deploy();

    await factory.waitForDeployment();

    expect(await factory.getFunds()).to.deep.equal([]);
  });
});
