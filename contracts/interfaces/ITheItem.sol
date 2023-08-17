// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

struct Child {
        uint256 tokenId;
        address contractAddress;
    }

interface ITheItem {
    function nestMint(
        address sender,
        address to,
        uint256 numToMint,
        uint256 destinationId
    ) external payable returns (uint256);

    function totalAssets() external view returns (uint256);

    function setValidParentForEquippableGroup(
        uint64 equippableGroupId,
        address parentAddress,
        uint64 partId
    ) external;

    function addEquippableAssetEntry(
        uint64 equippableGroupId,
        address catalogAddress,
        string memory metadataURI,
        uint64[] memory partIds
    ) external returns (uint256);

    function addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 replacesAssetWithId
    ) external;

    function pendingChildrenOf(uint256 parentId) external view returns (Child[] memory);

}