// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title RecyclingBadge
 * @dev NFT contract for RecycLink - Mints badges for verified recycling actions
 */
contract RecyclingBadge is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    struct Badge {
        uint256 itemsRecycled;
        uint256 co2Saved;        // in grams
        uint256 timestamp;
        string wasteType;
        string imageHash;        // IPFS hash
        address recycler;
    }
    
    // Mapping from token ID to badge details
    mapping(uint256 => Badge) public badges;
    
    // Mapping from user address to their token IDs
    mapping(address => uint256[]) public userBadges;
    
    // Total stats
    uint256 public totalItemsRecycled;
    uint256 public totalCO2Saved;
    
    event BadgeMinted(
        address indexed user,
        uint256 indexed tokenId,
        string wasteType,
        uint256 co2Saved
    );
    
    constructor() ERC721("RecycLink Badge", "RECYCLE") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new recycling badge
     */
    function mintBadge(
        address user,
        uint256 itemsRecycled,
        uint256 co2Saved,
        string memory wasteType,
        string memory imageHash
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(user, newTokenId);
        
        // Store badge details
        badges[newTokenId] = Badge({
            itemsRecycled: itemsRecycled,
            co2Saved: co2Saved,
            timestamp: block.timestamp,
            wasteType: wasteType,
            imageHash: imageHash,
            recycler: user
        });
        
        // Add to user's badges
        userBadges[user].push(newTokenId);
        
        // Update totals
        totalItemsRecycled += itemsRecycled;
        totalCO2Saved += co2Saved;
        
        emit BadgeMinted(user, newTokenId, wasteType, co2Saved);
        
        return newTokenId;
    }
    
    /**
     * @dev Get all badge IDs owned by a user
     */
    function getUserBadges(address user) public view returns (uint256[] memory) {
        return userBadges[user];
    }
    
    /**
     * @dev Get badge details
     */
    function getBadgeDetails(uint256 tokenId) public view returns (Badge memory) {
        require(_ownerOf(tokenId) != address(0), "Badge does not exist");
        return badges[tokenId];
    }
    
    /**
     * @dev Get user's total recycling stats
     */
    function getUserStats(address user) public view returns (
        uint256 badgeCount,
        uint256 totalItems,
        uint256 totalCO2
    ) {
        uint256[] memory userTokens = userBadges[user];
        badgeCount = userTokens.length;
        
        for (uint256 i = 0; i < userTokens.length; i++) {
            Badge memory badge = badges[userTokens[i]];
            totalItems += badge.itemsRecycled;
            totalCO2 += badge.co2Saved;
        }
        
        return (badgeCount, totalItems, totalCO2);
    }
    
    /**
     * @dev Get total platform stats
     */
    function getPlatformStats() public view returns (
        uint256 totalBadges,
        uint256 totalItems,
        uint256 totalCO2
    ) {
        return (_tokenIds.current(), totalItemsRecycled, totalCO2Saved);
    }
}
