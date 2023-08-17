
pragma solidity ^0.8.21;


contract TheAllowList {
    mapping(address => bool) private _allowedAddresses;

    constructor (
        address[] memory allowedAddresses
    ) {
        for (uint256 i = 0; i < allowedAddresses.length; i++) {
            _allowedAddresses[allowedAddresses[i]] = true;
        }
    }

    function isAllowed(address addr) public view returns (bool) {
        return _allowedAddresses[addr];
    }
}
