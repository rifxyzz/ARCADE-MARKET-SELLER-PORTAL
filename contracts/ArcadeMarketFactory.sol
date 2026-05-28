// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ArcadeMarketSeller.sol";

/**
 * @title ArcadeMarketFactory
 * @notice Deploys and tracks one ArcadeMarketSeller contract per seller wallet.
 *
 * Network:  Arc Testnet (chainId 5042002)
 * Explorer: https://testnet.arcscan.app
 *
 * Flow:
 *  1. Deploy this factory once — paste address into portal + marketplace configs.
 *  2. Each seller calls deploySellerContract() → their personal ArcadeMarketSeller is created.
 *  3. Marketplace calls getAllSellerContracts() then getListings() on each → all listings.
 *  4. Seller portal calls getSellerContract(wallet) to find the seller's contract.
 */
contract ArcadeMarketFactory {

    // seller wallet → their deployed ArcadeMarketSeller address
    mapping(address => address) private _sellerContracts;

    // ordered list of every deployed seller contract
    address[] private _allSellerContracts;

    event SellerContractDeployed(address indexed seller, address indexed sellerContract);

    // ── WRITE ────────────────────────────────────────────────

    /**
     * @notice Deploy a new ArcadeMarketSeller for the caller.
     *         Reverts if the caller already has one — call getSellerContract() first.
     * @return sellerContract Address of the newly deployed contract.
     */
    function deploySellerContract() external returns (address sellerContract) {
        require(
            _sellerContracts[msg.sender] == address(0),
            "ArcadeMarketFactory: seller already has a contract"
        );

        ArcadeMarketSeller deployed = new ArcadeMarketSeller(msg.sender);
        sellerContract = address(deployed);

        _sellerContracts[msg.sender] = sellerContract;
        _allSellerContracts.push(sellerContract);

        emit SellerContractDeployed(msg.sender, sellerContract);
    }

    // ── VIEW ─────────────────────────────────────────────────

    /**
     * @notice Returns the ArcadeMarketSeller address for a given seller wallet,
     *         or address(0) if they have not deployed one yet.
     */
    function getSellerContract(address seller) external view returns (address) {
        return _sellerContracts[seller];
    }

    /**
     * @notice Returns every deployed seller contract address.
     *         Marketplace uses this to aggregate all listings without a backend.
     */
    function getAllSellerContracts() external view returns (address[] memory) {
        return _allSellerContracts;
    }

    /**
     * @notice Total number of seller contracts deployed via this factory.
     */
    function totalSellers() external view returns (uint256) {
        return _allSellerContracts.length;
    }
}
