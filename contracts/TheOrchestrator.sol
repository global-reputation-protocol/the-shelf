pragma solidity ^0.8.21;

import "@rmrk-team/evm-contracts/contracts/implementations/abstract/RMRKAbstractEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/implementations/utils/RMRKTokenURIEnumerated.sol";
import "@rmrk-team/evm-contracts/contracts/implementations/lazyMintNative/InitDataNativePay.sol";
// import "hardhat/console.sol";

/**
 * @title EquipabbleToken
 * @author RMRK team
 * @notice Implementation of RMRK equippable module with native token-powered lazy minting.
 */
contract TheOrchestrator
{
    uint256 public theShelfAddress;

    constructor(
        address theShelfAddress_
    )
    {
        theShelfAddress = theShelfAddress_;
    }

    function mintItem(
        address theItem,
        uint256 theShelfNFTId,
        string memory metadataURI
    ) public payable virtual returns (uint256) {
        uint256 numToMint = 1;
        address shelfOwner = theShelf.ownerOf(theShelfNFTId);
        require(shelfOwner == msg.sender, "Needs to be called by the NFT Owner");
        uint256 childId = theItem.nestMint(shelfOwner, theShelfAddress, numToMint, theShelfNFTId);

        theShelf.acceptChild(
                theShelfNFTId,
                theShelf.childrenOf(theShelfNFTId).lenght,
                theItem,
                childId
            );

        theItem.addEquippableAssetEntry(
            childId, // uint64 id,  = assetId
            0, // uint64 equippableGroupId,
            catalogAddress, // address catalogAddress,
            metadataURI, // string memory metadataURI,
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] // uint64[] calldata partIds = array equals to len of the shelf
        );

        theItem.addAssetToToken(
            theShelfNFTId, // uint256 tokenId,
            childId, // uint64 assetId,
            0 // uint64 replacesAssetWithId = 0
        );
        return childId;
    }
}