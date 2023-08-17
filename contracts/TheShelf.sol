// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "@rmrk-team/evm-contracts/contracts/implementations/abstract/RMRKAbstractEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/implementations/utils/RMRKTokenURIEnumerated.sol";
import "@rmrk-team/evm-contracts/contracts/implementations/lazyMintNative/InitDataNativePay.sol";
import "./TheCatalog.sol";
import "./interfaces/ITheItem.sol";

/**
 * @title EquipabbleToken
 * @author RMRK team
 * @notice Implementation of RMRK equippable module with native token-powered lazy minting.
 */
contract TheShelf is
    InitDataNativePay,
    RMRKTokenURIEnumerated,
    RMRKAbstractEquippable
{
    uint256 private _pricePerMint;
    address catalogAddress;
    uint64 private totalParts;
    mapping(address => uint64) public assetToItem;
    mapping(address => uint64) public slotToItem;
    mapping(address => uint256) public ownerToShelfId;
    mapping(address => mapping(address => uint64)) public ownerItemChildId;
    mapping(address => mapping(address => uint256)) public ownerItemChildIndex;

    /**
     * @notice Used to initialize the smart contract.
     * @param name Name of the token collection
     * @param symbol Symbol of the token collection
     * @param collectionMetadata URI to the collection's metadata
     * @param baseTokenURI Each token's base URI
     * @param data The `InitData` struct used to pass initialization parameters
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        string memory baseTokenURI,
        InitData memory data
    )
        RMRKTokenURIEnumerated(baseTokenURI)
        RMRKImplementationBase(
            name,
            symbol,
            collectionMetadata,
            data.maxSupply,
            data.royaltyRecipient,
            data.royaltyPercentageBps
        )
    {
        _pricePerMint = data.pricePerMint;
        TheCatalog catalog = new TheCatalog('CATALOG', 'items');
        catalogAddress = address(catalog);

        uint64[] memory partIds = new uint64[](15);
        for (uint64 i = 0; i < 15; i++) {
            partIds[i] = i + 1;
        }
        
        addEquippableAssetEntry(
            0, // uint64 equippableGroupId,
            catalogAddress, // address catalogAddress,
            baseTokenURI, // string memory metadataURI,
            partIds // uint64[] calldata partIds = array equals to len of the shelf
          );
    }

    function addItemCollection(
        address itemAddress,
        uint64[] calldata slots, // always make it lenght 1
        string memory metadataURI
    ) external {
        require(assetToItem[itemAddress] == 0, 'Item already added');

        addPart(itemAddress, metadataURI);

        ITheItem(itemAddress).addEquippableAssetEntry(
            1, // uint64 equippableGroupId,
            catalogAddress, // address catalogAddress,
            metadataURI, // string memory metadataURI,
            slots // uint64[] calldata partIds = array equals to len of the shelf
        );

        assetToItem[itemAddress] = uint64(ITheItem(itemAddress).totalAssets());
        slotToItem[itemAddress] = slots[0];
        ITheItem(itemAddress).setValidParentForEquippableGroup(
            1, // equippableGroupId,
            address(this), // soldierEquip.address,
            slots[0] // partId,
        );
    }

    function mintItem(address itemAddress) external {
      // Mint TheItem
      uint256 childId = ITheItem(itemAddress).nestMint(msg.sender, address(this), 1, ownerToShelfId[msg.sender]); // Mint TheItem
      uint256 childIndex = ITheItem(itemAddress).pendingChildrenOf(ownerToShelfId[msg.sender]).length; 

      acceptChild(
        ownerToShelfId[msg.sender], // nftId
        childIndex, 
        itemAddress, 
        childId
        ); // Accept Item on TheShelf

      ownerItemChildId[msg.sender][itemAddress] = uint64(childId);
      ownerItemChildIndex[msg.sender][itemAddress] = childIndex; 
 
        // Gives Visual Asset to Token
      ITheItem(itemAddress).addAssetToToken(
            ownerToShelfId[msg.sender], // uint256 tokenId,
            assetToItem[itemAddress], // uint64 assetId,
            0 // uint64 replacesAssetWithId = 0
        );
    }

    function addPart(
        address itemAddress,
        string memory metadataURI
    ) public {
        totalParts++;
        address[] memory parts = new address[](1); // Initialize with a specific length of 1
        parts[0] = itemAddress; // Assign the current contract's address
        TheCatalog(catalogAddress).addPart(IRMRKCatalog.IntakeStruct(totalParts, IRMRKCatalog.Part(
                                IRMRKCatalog.ItemType.Slot,  // ItemType itemType; //1 byte 
                                10, // uint8 zindex 
                                parts, //address[] equippable
                                metadataURI
                                )));
    }

    function equipItem(address itemAddress) external {
        equip(IntakeEquip(
            ownerToShelfId[msg.sender], // shelfId, 
            ownerItemChildIndex[msg.sender][itemAddress], // childIndex,
            assetToItem[itemAddress], // assetId
            slotToItem[itemAddress], // slot
            ownerItemChildId[msg.sender][itemAddress] // childId
            ));
    }

    function unequipItem(address itemAddress) external {
        unequip(
            ownerToShelfId[msg.sender], // tokenId, 
            assetToItem[itemAddress], // assetId, 
            slotToItem[itemAddress]// slotPartId
        );
    }

    function isItemEquipped(address sender, address itemAddress) external {
        isChildEquipped(
         ownerToShelfId[sender],
         itemAddress,
         ownerItemChildId[sender][itemAddress] 
        );
    }
    
    function mint() public payable virtual returns (uint256) {
        require(ownerToShelfId[msg.sender] == 0, 'Already minted');
        (uint256 nextToken, uint256 totalSupplyOffset) = _prepareMint(
            1
        );
        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _safeMint(msg.sender, i, "");
            unchecked {
                ++i;
            }
        }

        ownerToShelfId[msg.sender] = nextToken;
        return nextToken;
    }
}
