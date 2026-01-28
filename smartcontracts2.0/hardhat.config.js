require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 5777,
    },
    ganache: {
      url: "http://127.0.0.1:8545",
      accounts: [
        "0x952cff359a71fe7bca86f0456e22d23b4e2c211db9a8aaeff2c2ae0dc2b706be",
        "0xdcda907d31d34b251feb92a3472a63884c713598810c36f46a9a6ba237e49b04",
        "0x8910a3e8134c6a3abc2fc2ae84e338866af7bbe8c85b117549f486a0948c724c",
        "0x8225f6683bbfb667560896a9c446c686cb3a0f76289273a4d358a294da66925e",
      ],
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
