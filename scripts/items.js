const { generateLensItem } = require("./lens/lens.js");
const { generateAaveItem } = require("./aave/aave.js");

const aaveProposals = ['0x3d3cae04cca35a36b278449831a985ba8520ef127784f2724360d8d956eddf7e',
                      '0x0be8229173181fe0aaf5ed1883e53752546efb810e55610e7ac8b991155ab788',
                      '0x4e17faf4fdb1ea2c8974d19e710724daf98dde225cd2078a9af4fbb5f0895512',
                      '0x4d200c139c13a192fad85ca51729b47b4b2ecd905667d9f6204b870aebd3d434',
                      '0x389c0cd79720fd9853ca6714f4597484dd25cc3a5e34955bf6144f0ba1888a3a',
                    ]

const lensIds = ['0x01', '0x02', '0x03']


async function buildOuput(){
  let globalCounter = 1;
  let output = [];

  for (let i = 0; i < aaveProposals.length; i++) {
    const proposal = aaveProposals[i];
    const result = await generateAaveItem(proposal, i, globalCounter);
    globalCounter++;
    output.push(result);
  }
  
  
  for (let i = 0; i < lensIds.length; i++) {
    const lensId = lensIds[i];
    const result = await generateLensItem(lensId, i, globalCounter);
    globalCounter++;
    output.push(result);
  }

  return output;
}

async function deploy(output){
  const allowList = await ethers.deployContract("TheAllowList", [output.allowList]);
  await allowList.waitForDeployment();

  const args = [output.name, output.symbol, output.collectionMetadata, output.baseTokenURI, output.data, allowList.target]

  const parentToken = await ethers.deployContract("TheItem", args);

  await parentToken.waitForDeployment();

  const contractAddress = parentToken.target;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  console.log('Sleeping for 5 seconds...');
  await sleep(40000);
  console.log('Awake after 5 seconds!');

  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: args,
  });

  console.log(`ETH and unlock timestamp deployed to ${parentToken.target}`);
  console.log('ready')
  output.address = parentToken.target;
  console.log(output);
}

async function main(){
  const output = await buildOuput();
  await deploy(output[0]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});