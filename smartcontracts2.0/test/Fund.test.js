const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Fund System", function () {
  async function deployContracts() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy FundFactory
    const FundFactory = await ethers.getContractFactory("FundFactory");
    const factory = await FundFactory.deploy();
    await factory.waitForDeployment();

    return { factory, owner, addr1, addr2, addr3 };
  }

  describe("FundFactory", function () {
    it("Should deploy factory with empty funds", async function () {
      const { factory } = await loadFixture(deployContracts);

      const funds = await factory.getFunds();
      expect(funds).to.deep.equal([]);
    });

    it("Should create a new fund", async function () {
      const { factory, owner } = await loadFixture(deployContracts);

      const name = "Test Fund";
      const goal = ethers.parseEther("10");
      const duration = 7 * 24 * 60 * 60; // 7 days

      await expect(factory.createFund(name, goal, duration))
        .to.emit(factory, "FundCreated");

      const funds = await factory.getFunds();
      expect(funds.length).to.equal(1);
    });

    it("Should track multiple funds", async function () {
      const { factory } = await loadFixture(deployContracts);

      const goal = ethers.parseEther("10");
      const duration = 7 * 24 * 60 * 60;

      await factory.createFund("Fund 1", goal, duration);
      await factory.createFund("Fund 2", goal, duration);
      await factory.createFund("Fund 3", goal, duration);

      const funds = await factory.getFunds();
      expect(funds.length).to.equal(3);
    });
  });

  describe("Fund Contract", function () {
    async function deployFund() {
      const { factory, owner, addr1, addr2, addr3 } = await loadFixture(deployContracts);

      const name = "Test Campaign";
      const goal = ethers.parseEther("5");
      const duration = 7 * 24 * 60 * 60; // 7 days

      await factory.createFund(name, goal, duration);
      const funds = await factory.getFunds();
      const fundAddress = funds[0];

      const Fund = await ethers.getContractFactory("Fund");
      const fund = Fund.attach(fundAddress);

      return { fund, factory, owner, addr1, addr2, addr3, goal, duration, fundAddress };
    }

    it("Should have correct initial state", async function () {
      const { fund, owner, goal } = await loadFixture(deployFund);

      expect(await fund.creator()).to.equal(owner.address);
      expect(await fund.goal()).to.equal(goal);
      expect(await fund.totalRaised()).to.equal(0);
      expect(await fund.goalReached()).to.equal(false);
      expect(await fund.projectName()).to.equal("Test Campaign");
    });

    it("Should accept deposits", async function () {
      const { fund, addr1 } = await loadFixture(deployFund);

      const depositAmount = ethers.parseEther("1");

      await expect(fund.connect(addr1).deposit({ value: depositAmount }))
        .to.emit(fund, "Funded")
        .withArgs(addr1.address, depositAmount);

      expect(await fund.totalRaised()).to.equal(depositAmount);
      expect(await fund.contributions(addr1.address)).to.equal(depositAmount);
      expect(await fund.contributorCount()).to.equal(1);
    });

    it("Should track multiple contributors", async function () {
      const { fund, addr1, addr2, addr3 } = await loadFixture(deployFund);

      const amount = ethers.parseEther("1");

      await fund.connect(addr1).deposit({ value: amount });
      await fund.connect(addr2).deposit({ value: amount });
      await fund.connect(addr3).deposit({ value: amount });

      expect(await fund.contributorCount()).to.equal(3);
      expect(await fund.totalRaised()).to.equal(ethers.parseEther("3"));
    });

    it("Should reach goal when contributions exceed goal", async function () {
      const { fund, addr1, addr2, goal } = await loadFixture(deployFund);

      const amount = goal / 2n + ethers.parseEther("0.1");

      await fund.connect(addr1).deposit({ value: amount });
      expect(await fund.goalReached()).to.equal(false);

      await fund.connect(addr2).deposit({ value: amount });
      expect(await fund.goalReached()).to.equal(true);
    });

    it("Should reject deposits after deadline", async function () {
      const { fund, addr1 } = await loadFixture(deployFund);

      // Fast forward time past deadline
      await time.increase(8 * 24 * 60 * 60); // 8 days

      const depositAmount = ethers.parseEther("1");

      await expect(
        fund.connect(addr1).deposit({ value: depositAmount })
      ).to.be.revertedWith("Funding ended");
    });

    it("Should allow refund if goal not reached", async function () {
      const { fund, addr1 } = await loadFixture(deployFund);

      const depositAmount = ethers.parseEther("1");
      await fund.connect(addr1).deposit({ value: depositAmount });

      // Fast forward past deadline
      await time.increase(8 * 24 * 60 * 60);

      const balanceBefore = await ethers.provider.getBalance(addr1.address);

      const tx = await fund.connect(addr1).refund();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(addr1.address);

      expect(balanceAfter + gasUsed).to.equal(balanceBefore + depositAmount);
      expect(await fund.contributions(addr1.address)).to.equal(0);
    });

    it("Should reject refund if goal was reached", async function () {
      const { fund, addr1, addr2, goal } = await loadFixture(deployFund);

      const amount = (goal / 2n) + ethers.parseEther("1");

      await fund.connect(addr1).deposit({ value: amount });
      await fund.connect(addr2).deposit({ value: amount });

      // Fast forward past deadline
      await time.increase(8 * 24 * 60 * 60);

      await expect(fund.connect(addr1).refund())
        .to.be.revertedWith("Goal reached");
    });

    it("Should allow creator to create request", async function () {
      const { fund, owner, addr1, goal } = await loadFixture(deployFund);

      const amount = goal + ethers.parseEther("1");
      await fund.connect(addr1).deposit({ value: amount });

      const requestAmount = ethers.parseEther("2");

      await expect(
        fund.connect(owner).createRequest("Buy equipment", requestAmount)
      ).to.emit(fund, "RequestCreated");

      expect(await fund.requestCount()).to.equal(1);
    });

    it("Should reject request from non-creator", async function () {
      const { fund, addr1 } = await loadFixture(deployFund);

      const requestAmount = ethers.parseEther("2");

      await expect(
        fund.connect(addr1).createRequest("Buy equipment", requestAmount)
      ).to.be.revertedWith("Not creator");
    });

    it("Should allow contributors to vote on requests", async function () {
      const { fund, owner, addr1, addr2, goal } = await loadFixture(deployFund);

      const amount = goal + ethers.parseEther("2");
      await fund.connect(addr1).deposit({ value: amount / 2n });
      await fund.connect(addr2).deposit({ value: amount / 2n });

      const requestAmount = ethers.parseEther("2");
      await fund.connect(owner).createRequest("Buy equipment", requestAmount);

      await fund.connect(addr1).voteRequest(0);
      await fund.connect(addr2).voteRequest(0);

      const request = await fund.requests(0);
      expect(request.approvals).to.equal(2);
    });

    it("Should reject vote from non-contributor", async function () {
      const { fund, owner, addr1, addr2, goal } = await loadFixture(deployFund);

      const amount = goal + ethers.parseEther("1");
      await fund.connect(addr1).deposit({ value: amount });

      const requestAmount = ethers.parseEther("2");
      await fund.connect(owner).createRequest("Buy equipment", requestAmount);

      await expect(fund.connect(addr2).voteRequest(0))
        .to.be.revertedWith("Not contributor");
    });

    it("Should reject duplicate votes", async function () {
      const { fund, owner, addr1, goal } = await loadFixture(deployFund);

      const amount = goal + ethers.parseEther("1");
      await fund.connect(addr1).deposit({ value: amount });

      const requestAmount = ethers.parseEther("2");
      await fund.connect(owner).createRequest("Buy equipment", requestAmount);

      await fund.connect(addr1).voteRequest(0);

      await expect(fund.connect(addr1).voteRequest(0))
        .to.be.revertedWith("Already voted");
    });

    it("Should allow creator to finalize approved request", async function () {
      const { fund, owner, addr1, addr2, addr3, goal } = await loadFixture(deployFund);

      const amount = goal + ethers.parseEther("3");
      await fund.connect(addr1).deposit({ value: amount / 3n });
      await fund.connect(addr2).deposit({ value: amount / 3n });
      await fund.connect(addr3).deposit({ value: amount / 3n });

      const requestAmount = ethers.parseEther("1");
      await fund.connect(owner).createRequest("Buy equipment", requestAmount);

      // Need more than half approvals (> 1 out of 3)
      await fund.connect(addr1).voteRequest(0);
      await fund.connect(addr2).voteRequest(0);

      const balanceBefore = await ethers.provider.getBalance(owner.address);

      const tx = await fund.connect(owner).finalizeRequest(0);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter + gasUsed).to.equal(balanceBefore + requestAmount);

      const request = await fund.requests(0);
      expect(request.completed).to.equal(true);
    });

    it("Should reject finalize with insufficient approvals", async function () {
      const { fund, owner, addr1, goal } = await loadFixture(deployFund);

      const amount = goal + ethers.parseEther("2");
      await fund.connect(addr1).deposit({ value: amount });

      const requestAmount = ethers.parseEther("1");
      await fund.connect(owner).createRequest("Buy equipment", requestAmount);

      await expect(fund.connect(owner).finalizeRequest(0))
        .to.be.revertedWith("Not enough votes");
    });
  });
});

