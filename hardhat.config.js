require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        arbitrumSepolia: {
            url: process.env.VITE_ARBITRUM_RPC || "https://arbitrum-sepolia.drpc.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 421614,
            // Custom gas settings to fix Remix issues
            gasPrice: 100000000, // 0.1 gwei - much higher than base fee
            gas: 5000000, // 5M gas limit
            timeout: 60000 // 60 second timeout
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
