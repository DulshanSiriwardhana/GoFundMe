// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Fund.sol";

contract FundFactory {
    address[] public deployedFunds;

    event FundCreated(address fund, address creator, string name);

    function createFund(
        string memory name,
        string memory description,
        string memory imageUri,
        uint goal,
        uint duration
    ) public {
        Fund fund = new Fund(msg.sender, name, description, imageUri, goal, duration);
        deployedFunds.push(address(fund));

        emit FundCreated(address(fund), msg.sender, name);
    }

    function getFunds() public view returns(address[] memory) {
        return deployedFunds;
    }
}
