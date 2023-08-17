require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const gwei = 1000000000;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.21",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: "london"
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`, 
      }
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: {
        mnemonic: process.env.POLYGON_TEST_MNEMONIC
      },
      gasPrice: 150*gwei
    }
  },
  etherscan: {
    apiKey: process.env.POLYGON_SCAN
  },
};
