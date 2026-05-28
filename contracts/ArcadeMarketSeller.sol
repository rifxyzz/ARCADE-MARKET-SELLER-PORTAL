// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcadeMarketSeller
 * @notice Individual seller listing contract, deployed once per seller by ArcadeMarketFactory.
 *         The seller wallet is the immutable owner — only they can list or delist.
 *
 * Network:  Arc Testnet (chainId 5042002)
 * Explorer: https://testnet.arcscan.app
 */
contract ArcadeMarketSeller {

    struct Listing {
        uint256 id;
        string  name;
        string  description;
        uint256 price;       // USDC amount, 6 decimals (e.g. 5000000 = 5 USDC)
        uint256 quantity;
        string  imageURI;
        string  category;
        bool    active;
    }

    address public immutable owner;

    uint256 private _nextId = 1;
    mapping(uint256 => Listing) private _listings;
    uint256[] private _ids;

    event ProductListed(uint256 indexed id, string name, uint256 price, uint256 quantity);
    event ProductDelisted(uint256 indexed id);

    modifier onlyOwner() {
        require(msg.sender == owner, "ArcadeMarketSeller: not owner");
        _;
    }

    constructor(address seller) {
        require(seller != address(0), "ArcadeMarketSeller: zero address");
        owner = seller;
    }

    // ── WRITE ────────────────────────────────────────────────

    /**
     * @notice List a new product. Only callable by the seller (owner).
     * @param name        Product name (non-empty).
     * @param description Product description.
     * @param price       Price in USDC with 6 decimals (e.g. 1000000 = 1 USDC).
     * @param quantity    Available stock (> 0).
     * @param imageURI    IPFS URI or on-chain data URI for the product image.
     * @param category    Category string (e.g. "Collectibles").
     * @return id         The assigned listing ID.
     */
    function listProduct(
        string calldata name,
        string calldata description,
        uint256 price,
        uint256 quantity,
        string calldata imageURI,
        string calldata category
    ) external onlyOwner returns (uint256 id) {
        require(bytes(name).length > 0, "ArcadeMarketSeller: name required");
        require(price > 0,              "ArcadeMarketSeller: price must be > 0");
        require(quantity > 0,           "ArcadeMarketSeller: quantity must be > 0");

        id = _nextId++;
        _listings[id] = Listing({
            id:          id,
            name:        name,
            description: description,
            price:       price,
            quantity:    quantity,
            imageURI:    imageURI,
            category:    category,
            active:      true
        });
        _ids.push(id);

        emit ProductListed(id, name, price, quantity);
    }

    /**
     * @notice Delist a product (marks inactive, preserves history).
     *         Only callable by the seller (owner).
     */
    function delistProduct(uint256 id) external onlyOwner {
        require(_listings[id].active, "ArcadeMarketSeller: listing not active");
        _listings[id].active = false;
        emit ProductDelisted(id);
    }

    // ── VIEW ─────────────────────────────────────────────────

    /**
     * @notice Returns all listings (active and inactive).
     *         Marketplace filters by active == true client-side.
     */
    function getListings() external view returns (Listing[] memory) {
        Listing[] memory result = new Listing[](_ids.length);
        for (uint256 i = 0; i < _ids.length; i++) {
            result[i] = _listings[_ids[i]];
        }
        return result;
    }

    /**
     * @notice Returns a single listing by ID.
     */
    function getListing(uint256 id) external view returns (Listing memory) {
        return _listings[id];
    }

    /**
     * @notice Total number of listings ever created (including delisted).
     */
    function totalListings() external view returns (uint256) {
        return _ids.length;
    }
}
