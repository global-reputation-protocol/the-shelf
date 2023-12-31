const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

async function setupCatalog(){

  const partIdForMask = 0;
  const partForMask = {
    itemType: 1, //ItemType.Slot,
    z: 2,
    equippable: [maskEquip.address],
    metadataURI: 'ipfs://hornEquipped3.png',
  };

  await catalog.addPartList([
    { partId: partIdForMask, part: partForMask },
  ]);
}

function getShelfArgs(address){
  const name = "TheShelf";
    const symbol = "SHELF";
    const collectionMetadata = "https://shelf-frontend-shelf.vercel.app/shelf-collection.json";
    const baseTokenURI = "https://shelf-frontend-shelf.vercel.app/shelf.json";
    const data = [
      address, // address royaltyRecipient; // 20 bytes
      0, // uint16 royaltyPercentageBps; // 2 bytes
      MAX_UINT256, // uint256 maxSupply;
      0, // uint256 pricePerMint;
    ];
    return [name, symbol, collectionMetadata, baseTokenURI, data];
}

function getItemArgs(shelfAddress, allowListAddress){
  const name = "TheItem";
    const symbol = "ITEM";
    const collectionMetadata = "https://shelf-frontend-shelf.vercel.app/item-collection.json";
    const baseTokenURI = "https://shelf-frontend-shelf.vercel.app/item.json";
    const data = [
      shelfAddress, // address royaltyRecipient; // 20 bytes
      0, // uint16 royaltyPercentageBps; // 2 bytes
      MAX_UINT256, // uint256 maxSupply;
      0, // uint256 pricePerMint;
    ];
    return [name, symbol, collectionMetadata, baseTokenURI, data, allowListAddress];
}

describe("Equippable Token", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    // const equipabbleToken = await EquipabbleToken.deploy(name, symbol, collectionMetadata, baseTokenURI, data);
    const shelf =  await ethers.deployContract("TheShelf", getShelfArgs(owner.address));

    await shelf.waitForDeployment();

    const allowList = await ethers.deployContract("TheAllowList", [[owner.address]]);
    await allowList.waitForDeployment();

    const item =  await ethers.deployContract("TheItem", getItemArgs(shelf.target, allowList.target));
    await item.waitForDeployment();

    const catalogSymbol = 'CATALOG';
    const catalogType = 'items';
    const catalog = await ethers.deployContract("TheCatalog", [catalogSymbol, catalogType]);
    await catalog.waitForDeployment();

    // setup catalog addPartList

    return { catalog, shelf, item, owner, otherAccount, allowList };
  }
 
  // USER                   PROTOCOL
  //                        Deploy TheShelf
  // Mint TheShelf
  //                        Deploy TheItem
  //                        Link TheItem to TheShelf
  // Mint TheItem + Accept Child + addAssetToToken
  // Equip TheItem

  describe("Deployment", function () {
    // it("Deploy Equippable", async function () {
    //   const { shelf } = await loadFixture(deployOneYearLockFixture);
    //   expect(await shelf.pricePerMint()).to.equal(0)
    // });

    // it("Mint NFT", async function () {
    //   const { catalog, shelf, item, owner } = await loadFixture(deployOneYearLockFixture);

    //   // Mint TheShelf
    //   await shelf.mint(owner.address, 1); // Mint TheShelf

    //   const partDescription = {
    //     itemType: 1,
    //     z: 0,
    //     equippable: [item.target],
    //     metadataURI: 'item.png',
    //   };
  
    //   await catalog.addPartList([
    //     { partId: 1, part: partDescription },
    //   ]);

    //   // Global shelf config
    //   await shelf.addEquippableAssetEntry(
    //     0, // uint64 equippableGroupId,
    //     catalog.target, // address catalogAddress,
    //     'sample', // string memory metadataURI,
    //     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] // uint64[] calldata partIds = array equals to len of the shelf
    //   )

    //   // Global Item config
    //   await item.addEquippableAssetEntry(
    //     1, // uint64 equippableGroupId,
    //     catalog.target, // address catalogAddress,
    //     'sample', // string memory metadataURI,
    //     [1, 2, 3, 4, 5, 6] // uint64[] calldata partIds = array equals to len of the shelf
    //   )

    //   await item.setValidParentForEquippableGroup(
    //     1, // equippableGroupId,
    //     shelf.target, // soldierEquip.address,
    //     1, // partIdForWeapon,
    //   );

    //   console.log(await item.totalAssets())
      
    //   // Mint TheItem
    //   await item.nestMint(shelf.target, 1, 1); // Mint TheItem

    //   // Accept Child
    //   // parentId (uint256)
    //   // childIndex (uint256) - how many children ppl have
    //   // childAddress (address)
    //   // childId (uint256) 
    //   await shelf.acceptChild(1, 0, item.target, 1); // Accept Item on TheShelf
    
    //   // Gives Visual Asset to Token
    //   await item.addAssetToToken(
    //     1, // uint256 tokenId,
    //     await item.totalAssets(), // uint64 assetId,
    //     0 // uint64 replacesAssetWithId = 0
    //   );

    // //   const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
    // //   expect(await view.getEquipped(soldierEquip.address, soldiersIds[0], soldierResId)).to.eql([
    // //   expectedSlots,
    // //   [
    // //     [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
    // //     [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
    // //   ],
    // //   ['', ''],
    // // ]);

    // await shelf.equip([
    //   1, // soldiersIds[0], 
    //   0, // childIndex,
    //   1, // assetId
    //   1, // slot
    //   1 // childAssetId
    //   ])

    // // // Child is marked as equipped:
    // expect(
    //   await shelf.isChildEquipped(
    //     1, // soldiersIds[0], 
    //     item.target, //weapon.address,
    //     1, // weaponsIds[0]
    //     )
    // ).to.eql(true);
    // });

    it("Quick", async function () {
      const { owner, shelf, item } = await loadFixture(deployOneYearLockFixture);

      await shelf.addItemCollection(
        item.target, // address itemAddress,
        [1], // uint64 slot,
        "https://shelf-frontend-shelf.vercel.app/item-on-shelf.png", // address catalogAddress,
      );

      await shelf.mint(); // Mint TheShelf

      await shelf.mintItem(item.target);

      await shelf.equipItem(item.target);

      await shelf.unequipItem(item.target);
    });
  });
});
