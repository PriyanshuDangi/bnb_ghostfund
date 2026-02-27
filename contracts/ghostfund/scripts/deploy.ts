import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying GhostPaymaster with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

  const relayerAddress = process.env.RELAYER_ADDRESS || deployer.address;
  const feeBasisPoints = 50; // 0.5%

  const GhostPaymaster = await ethers.getContractFactory("GhostPaymaster");
  const paymaster = await GhostPaymaster.deploy(relayerAddress, feeBasisPoints);
  await paymaster.waitForDeployment();

  const address = await paymaster.getAddress();
  console.log("GhostPaymaster deployed to:", address);
  console.log("\nAdd to your .env:");
  console.log(`GHOST_PAYMASTER=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
