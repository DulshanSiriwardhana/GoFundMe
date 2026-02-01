// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Fund is ReentrancyGuard {
    address public creator;
    string public projectName;
    string public description;
    uint public goal;
    uint public deadline;
    uint public totalRaised;
    bool public goalReached;

    struct Request {
        string purpose;
        uint amount;
        bool completed;
        uint approvals;
    }

    mapping(address => uint) public contributions;
    mapping(uint => Request) public requests;
    mapping(uint => mapping(address => bool)) public voted;

    uint public contributorCount;
    uint public requestCount;

    modifier onlyCreator() {
        require(msg.sender == creator, "Not creator");
        _;
    }

    constructor(
        address _creator,
        string memory _name,
        string memory _description,
        uint _goal,
        uint _duration
    ) {
        creator = _creator;
        projectName = _name;
        description = _description;
        goal = _goal;
        deadline = block.timestamp + _duration;
    }

    event Funded(address contributor, uint amount);
    event Withdrawn(uint amount);
    event RequestCreated(string purpose, uint amount);

    function deposit() public payable {
        require(block.timestamp < deadline, "Funding ended");
        require(msg.value > 0, "Send ETH");

        if (contributions[msg.sender] == 0) {
            contributorCount++;
        }

        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;

        if (totalRaised >= goal) {
            goalReached = true;
        }

        emit Funded(msg.sender, msg.value);
    }

    function refund() public nonReentrant {
        require(block.timestamp > deadline, "Funding active");
        require(!goalReached, "Goal reached");

        uint amount = contributions[msg.sender];
        require(amount > 0, "Nothing to refund");

        contributions[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund failed");
    }

    function createRequest(string memory purpose, uint amount) public onlyCreator {
        require(amount <= address(this).balance, "Insufficient funds");

        requests[requestCount] = Request(purpose, amount, false, 0);
        requestCount++;

        emit RequestCreated(purpose, amount);
    }

    function voteRequest(uint id) public {
        require(contributions[msg.sender] > 0, "Not contributor");
        require(!voted[id][msg.sender], "Already voted");

        voted[id][msg.sender] = true;
        requests[id].approvals++;
    }

    function finalizeRequest(uint id) public onlyCreator nonReentrant {
        Request storage req = requests[id];

        require(!req.completed, "Already completed");
        require(req.approvals > contributorCount / 2, "Not enough votes");

        req.completed = true;

        (bool success, ) = creator.call{value: req.amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(req.amount);
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
}
