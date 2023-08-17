// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const name = "Equipabble NFT - tstrrr";
  const symbol = "tstrrr";
  const collectionMetadata = "";
  const baseTokenURI = "";
  const data = [
    "0xf0e1dca77b2a40113f3091b7ef6c30feb6405b3f", // address royaltyRecipient; // 20 bytes
    0, // uint16 royaltyPercentageBps; // 2 bytes
    10000000000, // uint256 maxSupply;
    0, // uint256 pricePerMint;
  ]

  const args = [name, symbol, collectionMetadata, baseTokenURI, data]

  // const equipabbleToken = await EquipabbleToken.deploy(name, symbol, collectionMetadata, baseTokenURI, data);
  const parentToken = await ethers.deployContract("EquipabbleToken", args);

  await parentToken.waitForDeployment();

  const contractAddress = parentToken.target;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  console.log('Sleeping for 5 seconds...');
  await sleep(60000);
  console.log('Awake after 5 seconds!');

  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: args,
  });

  console.log(`ETH and unlock timestamp deployed to ${parentToken.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
