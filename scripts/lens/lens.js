
const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
const shelfAddress = "0x36B4f598528209CaCf7fdD63c0A16AaF9DB187ed";
const permaAllowLists = ["0x9B613116064F04796336221A01BA7B134C062567", "0xC6091123E4b233efA0f2150091d61f4edeceaDa6", "0x5D97a043870d52c70f49D0b2A5eD97e14D136D19", "0xdF67046cf01635c9Fc3B3e6117E90a1215c9BaC7", "0x5BAB21A8CC554a54fD8ebFd239BF24F6feE48372", "0x23a4bDFe71451ABFBa5C316a0440a62955f62976", "0x506A613a261d16e9617A60339DC330Ff04ad5a12"];


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
      return addresses;
    });
  }

module.exports.generateLensItem = async function(lensId, lensNumber, globalId){
    return {
      id: globalId,
      name: `LENS-FOLLOWS-${lensId}`,
      symbol: `ITEM`,
      collectionMetadata: `https://shelf-frontend-shelf.vercel.app/api/item-${globalId}/`,
      baseTokenURI: `https://shelf-frontend-shelf.vercel.app/api/item-${globalId}/`,
      data: [
        shelfAddress, // address royaltyRecipient; // 20 bytes
        0, // uint16 royaltyPercentageBps; // 2 bytes
        MAX_UINT256, // uint256 maxSupply;
        0, // uint256 pricePerMint;
      ],
      allowList: (await generateLensAllowList(lensId)).concat(permaAllowLists)
    }
  };
  