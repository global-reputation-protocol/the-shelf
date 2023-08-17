const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
const shelfAddress = "0xDF210f05c4d82979b6AEcBC8f10BA88A9eD91539";
const permaAllowLists = ["0x9B613116064F04796336221A01BA7B134C062567", "0xC6091123E4b233efA0f2150091d61f4edeceaDa6", "0x5D97a043870d52c70f49D0b2A5eD97e14D136D19", "0xdF67046cf01635c9Fc3B3e6117E90a1215c9BaC7"];
const aaveProposals = ['0x3d3cae04cca35a36b278449831a985ba8520ef127784f2724360d8d956eddf7e',
                      '0x0be8229173181fe0aaf5ed1883e53752546efb810e55610e7ac8b991155ab788',
                      '0x4e17faf4fdb1ea2c8974d19e710724daf98dde225cd2078a9af4fbb5f0895512',
                      '0x4d200c139c13a192fad85ca51729b47b4b2ecd905667d9f6204b870aebd3d434',
                      '0x389c0cd79720fd9853ca6714f4597484dd25cc3a5e34955bf6144f0ba1888a3a',
                    ]

const lensIds = ['0x01', '0x02', '0x03']


async function generateLensAllowList(lensId){
  let proposalQuery = `
  query Followers {
    followers(request: {
      profileId: "${lensId}",
      limit: 10,
    }) {
      items {
        wallet {
          address
        }
      }
      pageInfo {
        next
      }
    }
}`;
  
const payload = { query: proposalQuery };

const headers = {'Content-Type': 'application/json'};
const url = "https://api.lens.dev";

return fetch(url, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(payload)
})
  .then(response => response.json())
  .then(data => {
    const followers = data.data.followers.items;
    const addresses = followers.map(f => f.wallet.address);
    console.log(addresses)
    return addresses;
  });
}

function generateAaveAllowList(proposalId){
  let proposalQuery = `
  query {
    votes (
      first: 10
      skip: 0
      where: {
        proposal: "${proposalId}"
      }
      orderBy: "created",
      orderDirection: desc
    ) {
      id
      voter
      vp
      vp_by_strategy
      vp_state
      created
      proposal {
        id
      }
      choice
      space {
        id
      }
    }
  }
  `;
  
const payload = { query: proposalQuery };

const headers = {'Content-Type': 'application/json'};
const url = "https://hub.snapshot.org/graphql";

return fetch(url, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(payload)
})
  .then(response => response.json())
  .then(data => {
    const votes = data.data.votes;
    const addresses = votes.map(vote => vote.voter);
    return addresses;
  });
}


async function generateAaveItem(proposalId, aaveId, globalId){
  return {
    id: globalId,
    symbol: `AAVE-SNAPSHOT-${aaveId}`,
    collectionMetadata: `https://shelf-frontend-shelf.vercel.app/item-${globalId}.json`,
    baseTokenURI: `https://shelf-frontend-shelf.vercel.app/item-${globalId}.json`,
    data: [
      shelfAddress, // address royaltyRecipient; // 20 bytes
      0, // uint16 royaltyPercentageBps; // 2 bytes
      MAX_UINT256, // uint256 maxSupply;
      0, // uint256 pricePerMint;
    ],
    allowList: await generateAaveAllowList(aaveId),
  }
};

async function generateLensItem(lensId, lensNumber, globalId){
  return {
    id: globalId,
    symbol: `LENS-FOLLOWS-${lensId}`,
    collectionMetadata: `https://shelf-frontend-shelf.vercel.app/item-${globalId}.json`,
    baseTokenURI: `https://shelf-frontend-shelf.vercel.app/item-${globalId}.json`,
    data: [
      shelfAddress, // address royaltyRecipient; // 20 bytes
      0, // uint16 royaltyPercentageBps; // 2 bytes
      MAX_UINT256, // uint256 maxSupply;
      0, // uint256 pricePerMint;
    ],
    allowList: await generateLensAllowList(lensId)
  }
};

function generateWorldCoin(i){
  return {
    id: i,
    symbol: `WORLDCOIN-ID-${i}`,
    collectionMetadata: `https://shelf-frontend-shelf.vercel.app/item-${i}.json`,
    baseTokenURI: `https://shelf-frontend-shelf.vercel.app/item-${i}.json`,
    data: [
      shelfAddress, // address royaltyRecipient; // 20 bytes
      0, // uint16 royaltyPercentageBps; // 2 bytes
      MAX_UINT256, // uint256 maxSupply;
      0, // uint256 pricePerMint;
    ],
    allowList: generateWorldCoinAllowList()}
};


async function main(){
  let globalCounter = 1;
  const aaveItems = await Promise.all(aaveProposals.map(
    async (proposal, index) => {
      const result = await generateAaveItem(proposal, index, globalCounter);
      globalCounter++;
      // console.log(result.errors.locations)
      return result;
    }
  ));
  
  const lensItems = await Promise.all(lensIds.map(
    async (lensId, index) => {
      const result = await generateLensItem(lensId, index, globalCounter);
      globalCounter++;
      // console.log(result.errors.locations)
      return result;
    }
  ));

  console.log(lensItems)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});