const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

// enum ItemType {
//   None,
//   Slot,
//   Fixed,
// }

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
    const collectionMetadata = "";
    const baseTokenURI = "";
    const data = [
      address, // address royaltyRecipient; // 20 bytes
      0, // uint16 royaltyPercentageBps; // 2 bytes
      MAX_UINT256, // uint256 maxSupply;
      0, // uint256 pricePerMint;
    ];
    return [name, symbol, collectionMetadata, baseTokenURI, data];
}

function getItemArgs(address){
  const name = "TheItem";
    const symbol = "ITEM";
    const collectionMetadata = "";
    const baseTokenURI = "";
    const data = [
      address, // address royaltyRecipient; // 20 bytes
      0, // uint16 royaltyPercentageBps; // 2 bytes
      MAX_UINT256, // uint256 maxSupply;
      0, // uint256 pricePerMint;
    ];
    return [name, symbol, collectionMetadata, baseTokenURI, data];
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

    const item =  await ethers.deployContract("TheItem", getItemArgs(owner.address));

    const catalogSymbol = 'CATALOG';
    const catalogType = 'items';
    // const catalog = await ethers.deployContract("RMRKCatalogImpl", [catalogSymbol, catalogType]);

    const catalog = {}
    // setup catalog addPartList

    return { catalog, shelf, item, owner, otherAccount };
  }
 
  // USER                   PROTOCOL
  //                        Deploy TheShelf
  // Mint TheShelf
  //                        Deploy TheItem
  //                        Link TheItem to TheShelf
  // Mint TheItem + Accept Child + addAssetToToken
  // Equip TheItem

  describe("Deployment", function () {
    it("Deploy Equippable", async function () {
      const { shelf } = await loadFixture(deployOneYearLockFixture);
      expect(await shelf.pricePerMint()).to.equal(0)
    });

    // it("Mint NFT", async function () {
    //   const { equipabbleToken, owner } = await loadFixture(deployOneYearLockFixture);
    //   await equipabbleToken.mint(owner.address, 1); // Mint TheShelf
    //   // Deploy TheItem 
    //   // Link Item to TheShelf

    //   // nestMint  // Mint Item

    //   // acceptChild // Accept Item on TheShelf
    //   // parentId (uint256)
    //   // childIndex (uint256) - how many children ppl have
    //   // childAddress (address)
    //   // childId (uint256) 

    //   // addEquippableAssetEntry // Add possible item to TheShelf

    //   await equipabbleToken.addEquippableAssetEntry(
    //     0, // uint64 id,  = assetId
    //     0, // uint64 equippableGroupId,
    //     catalog.address, // address catalogAddress,
    //     '', // string memory metadataURI,
    //     [] // uint64[] calldata partIds = array equals to len of the shelf
    //   )

    //   // addAssetToToken  // Gives TheItem to TheShelf
    //   await neonEquip.addAssetToToken(
    //     // uint256 tokenId,
    //     // uint64 assetId,
    //     0 // uint64 replacesAssetWithId = 0
    //   );

    //   const expectedSlots = [bn(partIdForWeapon), bn(partIdForBackground)];
    //   expect(await view.getEquipped(soldierEquip.address, soldiersIds[0], soldierResId)).to.eql([
    //   expectedSlots,
    //   [
    //     [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
    //     [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
    //   ],
    //   ['', ''],
    // ]);

    // await expect(
    //   soldierEquip
    //     .connect(from)
    //     .equip([soldiersIds[0], childIndex, soldierResId, partIdForWeapon, weaponResId]),
    // )
    //   .to.emit(soldierEquip, 'ChildAssetEquipped')
    //   .withArgs(
    //     soldiersIds[0],
    //     soldierResId,
    //     partIdForWeapon,
    //     weaponsIds[0],
    //     weaponEquip.address,
    //     weaponAssetsEquip[0],
    //   );
    // // All part slots are included on the response:
    // // If a slot has nothing equipped, it returns an empty equip:
    // const expectedEquips = [
    //   [bn(soldierResId), bn(weaponResId), weaponsIds[0], weaponEquip.address],
    //   [bn(0), bn(0), bn(0), ethers.constants.AddressZero],
    // ];
    // const expectedMetadata = ['ipfs:weapon/equip/5', ''];
    // expect(await view.getEquipped(soldierEquip.address, soldiersIds[0], soldierResId)).to.eql([
    //   expectedSlots,
    //   expectedEquips,
    //   expectedMetadata,
    // ]);

    // // Child is marked as equipped:
    // expect(
    //   await soldierEquip.isChildEquipped(soldiersIds[0], weapon.address, weaponsIds[0]),
    // ).to.eql(true);
      

    // });
  });
});
