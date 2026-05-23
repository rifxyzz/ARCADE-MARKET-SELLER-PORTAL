// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcadeMarket
 * @notice On-chain product listing & purchasing for Arcade Market Seller Portal
 * @dev Deploy on Circle Arc Testnet (chainId 2648)
 *      Each seller deploys their own instance of this contract.
 *      After deploying, paste the contract address in the Seller Dashboard → Settings.
 *
 * Network:  Circle Arc Testnet  (https://rpc.arc.testnet.circle.com)
 * Explorer: https://testnet.arcscan.app
 * USDC:     0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238  (Circle test USDC on Arc)
 *
 * Flow:
 *  1. Seller deploys this contract on Arc Testnet
 *  2. Seller pastes contract address in dashboard Settings
 *  3. Seller calls listProduct() → product stored on-chain
 *  4. Buyer calls purchaseProduct() with USDC → payment sent directly to seller
 *  5. Products appear on arcade-markets.vercel.app via getAllProducts()
 *  6. Dashboard reads getSellerProducts() to display seller's own listings
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
}

contract ArcadeMarket {

    // ── STRUCTS ──────────────────────────────────────────────
    struct Product {
        uint256 id;
        string  name;
        string  description;
        uint256 priceUsdc;   // in USDC (6 decimals)
        uint256 stock;
        string  category;
        string  imageUri;    // IPFS URI or data URI
        address seller;
        bool    active;
        uint256 totalSold;
    }

    struct SellerStats {
        uint256 totalRevenue;   // USDC (6 decimals)
        uint256 totalOrders;
        uint256 activeListings;
    }

    // ── STATE ────────────────────────────────────────────────
    address public owner;
    address public usdcToken;       // USDC contract address
    address public genesisNFT;      // ARCM Genesis NFT contract
    uint256 public minNFTBalance;   // minimum NFT balance required
    uint256 public platformFeeBps;  // platform fee in basis points (e.g. 250 = 2.5%)
    address public feeRecipient;

    uint256 private _nextProductId = 1;

    mapping(uint256 => Product)  public products;
    mapping(address => uint256[]) public sellerProductIds;
    mapping(address => SellerStats) public sellerStats;

    uint256[] public allProductIds;

    // ── EVENTS ───────────────────────────────────────────────
    event ProductListed(
        uint256 indexed productId,
        address indexed seller,
        string  name,
        uint256 priceUsdc
    );

    event ProductUpdated(
        uint256 indexed productId,
        address indexed seller,
        uint256 newPrice,
        uint256 newStock
    );

    event ProductDelisted(
        uint256 indexed productId,
        address indexed seller
    );

    event ProductPurchased(
        uint256 indexed productId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 quantity
    );

    event PlatformFeeUpdated(uint256 newFeeBps);

    // ── MODIFIERS ────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "ArcadeMarket: not owner");
        _;
    }

    modifier onlyVerifiedSeller() {
        if (genesisNFT != address(0) && minNFTBalance > 0) {
            require(
                IERC721(genesisNFT).balanceOf(msg.sender) >= minNFTBalance,
                "ArcadeMarket: insufficient Genesis NFT balance"
            );
        }
        _;
    }

    modifier onlyProductSeller(uint256 productId) {
        require(products[productId].seller == msg.sender, "ArcadeMarket: not product seller");
        _;
    }

    // ── CONSTRUCTOR ──────────────────────────────────────────
    /**
     * @param _usdcToken     USDC token address on this network
     * @param _genesisNFT    ARCM Genesis NFT address (0x0 to disable gating)
     * @param _minNFTBalance Minimum NFT balance required (e.g. 1)
     * @param _platformFeeBps Platform fee in bps (e.g. 250 = 2.5%)
     * @param _feeRecipient  Address to receive platform fees
     */
    constructor(
        address _usdcToken,
        address _genesisNFT,
        uint256 _minNFTBalance,
        uint256 _platformFeeBps,
        address _feeRecipient
    ) {
        owner           = msg.sender;
        usdcToken       = _usdcToken;
        genesisNFT      = _genesisNFT;
        minNFTBalance   = _minNFTBalance;
        platformFeeBps  = _platformFeeBps;
        feeRecipient    = _feeRecipient;
    }

    // ── SELLER FUNCTIONS ─────────────────────────────────────

    /**
     * @notice List a new product on Arcade Market
     * @param name        Product name
     * @param description Product description
     * @param priceUsdc   Price in USDC (6 decimals, e.g. 5000000 = 5 USDC)
     * @param stock       Available stock quantity
     * @param category    Product category string
     * @param imageUri    IPFS or data URI for product image
     * @return productId  The assigned product ID
     */
    function listProduct(
        string calldata name,
        string calldata description,
        uint256 priceUsdc,
        uint256 stock,
        string calldata category,
        string calldata imageUri
    ) external onlyVerifiedSeller returns (uint256 productId) {
        require(bytes(name).length > 0,  "ArcadeMarket: name required");
        require(priceUsdc > 0,           "ArcadeMarket: price must be > 0");
        require(stock > 0,               "ArcadeMarket: stock must be > 0");

        productId = _nextProductId++;

        products[productId] = Product({
            id:          productId,
            name:        name,
            description: description,
            priceUsdc:   priceUsdc,
            stock:       stock,
            category:    category,
            imageUri:    imageUri,
            seller:      msg.sender,
            active:      true,
            totalSold:   0
        });

        sellerProductIds[msg.sender].push(productId);
        allProductIds.push(productId);
        sellerStats[msg.sender].activeListings++;

        emit ProductListed(productId, msg.sender, name, priceUsdc);
    }

    /**
     * @notice Update price and/or stock of an existing product
     */
    function updateProduct(
        uint256 productId,
        uint256 newPrice,
        uint256 newStock
    ) external onlyProductSeller(productId) {
        require(products[productId].active, "ArcadeMarket: product not active");
        require(newPrice > 0, "ArcadeMarket: price must be > 0");

        products[productId].priceUsdc = newPrice;
        products[productId].stock     = newStock;

        emit ProductUpdated(productId, msg.sender, newPrice, newStock);
    }

    /**
     * @notice Delist a product (marks inactive, keeps history)
     */
    function delistProduct(uint256 productId) external onlyProductSeller(productId) {
        require(products[productId].active, "ArcadeMarket: already delisted");

        products[productId].active = false;
        if (sellerStats[msg.sender].activeListings > 0) {
            sellerStats[msg.sender].activeListings--;
        }

        emit ProductDelisted(productId, msg.sender);
    }

    // ── BUYER FUNCTIONS ──────────────────────────────────────

    /**
     * @notice Purchase a product with USDC
     * @dev Buyer must approve this contract to spend USDC first
     * @param productId  Product to purchase
     * @param quantity   Number of units to buy
     */
    function purchaseProduct(uint256 productId, uint256 quantity) external {
        Product storage p = products[productId];
        require(p.active,           "ArcadeMarket: product not active");
        require(p.stock >= quantity, "ArcadeMarket: insufficient stock");
        require(quantity > 0,        "ArcadeMarket: quantity must be > 0");

        uint256 totalCost = p.priceUsdc * quantity;

        // Calculate platform fee
        uint256 fee           = (totalCost * platformFeeBps) / 10000;
        uint256 sellerAmount  = totalCost - fee;

        // Transfer USDC from buyer
        require(
            IERC20(usdcToken).transferFrom(msg.sender, address(this), totalCost),
            "ArcadeMarket: USDC transfer failed"
        );

        // Pay seller
        require(
            IERC20(usdcToken).transfer(p.seller, sellerAmount),
            "ArcadeMarket: seller payment failed"
        );

        // Pay platform fee
        if (fee > 0 && feeRecipient != address(0)) {
            IERC20(usdcToken).transfer(feeRecipient, fee);
        }

        // Update state
        p.stock     -= quantity;
        p.totalSold += quantity;
        if (p.stock == 0) {
            p.active = false;
            if (sellerStats[p.seller].activeListings > 0) {
                sellerStats[p.seller].activeListings--;
            }
        }

        sellerStats[p.seller].totalRevenue += sellerAmount;
        sellerStats[p.seller].totalOrders  += 1;

        emit ProductPurchased(productId, msg.sender, p.seller, totalCost, quantity);
    }

    // ── VIEW FUNCTIONS ───────────────────────────────────────

    /**
     * @notice Get all products listed by a specific seller
     */
    function getSellerProducts(address seller) external view returns (Product[] memory) {
        uint256[] storage ids = sellerProductIds[seller];
        Product[] memory result = new Product[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = products[ids[i]];
        }
        return result;
    }

    /**
     * @notice Get all active products (for marketplace display)
     */
    function getAllProducts() external view returns (Product[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allProductIds.length; i++) {
            if (products[allProductIds[i]].active) activeCount++;
        }

        Product[] memory result = new Product[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < allProductIds.length; i++) {
            if (products[allProductIds[i]].active) {
                result[idx++] = products[allProductIds[i]];
            }
        }
        return result;
    }

    /**
     * @notice Get seller stats (revenue, orders, active listings)
     */
    function getSellerStats(address seller) external view returns (
        uint256 totalRevenue,
        uint256 totalOrders,
        uint256 activeListings
    ) {
        SellerStats storage s = sellerStats[seller];
        return (s.totalRevenue, s.totalOrders, s.activeListings);
    }

    /**
     * @notice Get a single product by ID
     */
    function getProduct(uint256 productId) external view returns (Product memory) {
        return products[productId];
    }

    /**
     * @notice Total number of products ever listed
     */
    function totalProducts() external view returns (uint256) {
        return allProductIds.length;
    }

    // ── ADMIN FUNCTIONS ──────────────────────────────────────

    function setGenesisNFT(address _nft, uint256 _minBalance) external onlyOwner {
        genesisNFT    = _nft;
        minNFTBalance = _minBalance;
    }

    function setPlatformFee(uint256 _feeBps, address _recipient) external onlyOwner {
        require(_feeBps <= 1000, "ArcadeMarket: fee too high (max 10%)");
        platformFeeBps = _feeBps;
        feeRecipient   = _recipient;
        emit PlatformFeeUpdated(_feeBps);
    }

    function setUSDC(address _usdc) external onlyOwner {
        usdcToken = _usdc;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ArcadeMarket: zero address");
        owner = newOwner;
    }

    /**
     * @notice Emergency withdraw stuck tokens (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
}
