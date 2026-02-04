const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying RecyclingBadge contract to Arbitrum Sepolia...");

    // Get the contract factory
    const RecyclingBadge = await hre.ethers.getContractFactory("RecyclingBadge");

    // Deploy the contract
    console.log("📝 Deploying contract...");
    const recyclingBadge = await RecyclingBadge.deploy();

    await recyclingBadge.deployed();

    console.log("✅ RecyclingBadge deployed to:", recyclingBadge.address);
    console.log("🔗 View on Arbiscan:", `https://sepolia.arbiscan.io/address/${recyclingBadge.address}`);

    console.log("\n📋 Next steps:");
    console.log("1. Copy the contract address above");
    console.log("2. Update VITE_CONTRACT_ADDRESS in .env file");
    console.log("3. Restart your dev server");
    console.log("4. Test NFT minting in the app!");

    console.log("\n💾 Contract address:", recyclingBadge.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
