/**
 * Rewards Service
 * Handles reward calculations for customers and agents
 */

// Reward values for different waste types (customer rewards)
export const CUSTOMER_REWARDS = {
    plastic: 10,
    paper: 8,
    metal: 15,
    glass: 12,
    organic: 5,
    electronic: 25,
    hazardous: 20
};

// Agent rewards
export const AGENT_REWARDS = {
    basePickup: 50,        // Base points per pickup
    speedBonus: 10,        // Completed within 1 hour of acceptance
    ratingBonus: 20,       // 5-star rating from customer
    distanceBonus: 5       // Per km traveled (future feature)
};

// Bonus multipliers
export const BONUSES = {
    streak: 1.2,           // 20% bonus for 7-day streak
    bulk: 1.5,             // 50% bonus for 10+ items
    firstTime: 2.0         // 2x for first recycling
};

/**
 * Calculate customer rewards for recycling
 * @param {string} wasteType - Type of waste
 * @param {number} itemCount - Number of items
 * @param {Object} userStats - User's recycling stats
 * @returns {number} Reward points
 */
export const calculateCustomerRewards = (wasteType, itemCount = 1, userStats = {}) => {
    const baseReward = CUSTOMER_REWARDS[wasteType] || 10;
    let totalReward = baseReward * itemCount;

    // First time bonus
    if (userStats.totalItems === 0) {
        totalReward *= BONUSES.firstTime;
    }

    // Bulk bonus (10+ items)
    if (itemCount >= 10) {
        totalReward *= BONUSES.bulk;
    }

    // Streak bonus (recycled 7 days in a row)
    if (userStats.currentStreak >= 7) {
        totalReward *= BONUSES.streak;
    }

    return Math.round(totalReward);
};

/**
 * Calculate agent rewards for completing pickup
 * @param {Object} pickup - Pickup data
 * @param {Object} agentStats - Agent's stats
 * @returns {number} Reward points
 */
export const calculateAgentRewards = (pickup, agentStats = {}) => {
    let totalReward = AGENT_REWARDS.basePickup;

    // Speed bonus (completed within 1 hour of acceptance)
    if (pickup.acceptedAt && pickup.completedAt) {
        const acceptTime = new Date(pickup.acceptedAt);
        const completeTime = new Date(pickup.completedAt);
        const hoursDiff = (completeTime - acceptTime) / (1000 * 60 * 60);

        if (hoursDiff <= 1) {
            totalReward += AGENT_REWARDS.speedBonus;
        }
    }

    // Rating bonus (if customer gave 5 stars)
    if (pickup.rating === 5) {
        totalReward += AGENT_REWARDS.ratingBonus;
    }

    // Performance bonus (completed 50+ pickups)
    if (agentStats.completedPickups >= 50) {
        totalReward *= 1.1; // 10% bonus
    }

    return Math.round(totalReward);
};

/**
 * Get leaderboard data
 * @param {string} type - 'customer' or 'agent'
 * @param {number} limit - Number of top users to return
 * @returns {Array} Leaderboard data
 */
export const getLeaderboard = (type = 'customer', limit = 10) => {
    const users = JSON.parse(localStorage.getItem('recyclink_users') || '[]');

    // Filter by role
    const filteredUsers = users.filter(u => u.role === type);

    // Sort by rewards (descending)
    const sorted = filteredUsers.sort((a, b) => b.rewards - a.rewards);

    // Return top N
    return sorted.slice(0, limit).map((user, index) => ({
        rank: index + 1,
        name: user.name,
        rewards: user.rewards,
        stats: user.stats
    }));
};

/**
 * Calculate CO2 savings based on waste type and weight
 * @param {string} wasteType - Type of waste
 * @param {number} weight - Weight in kg
 * @returns {number} CO2 saved in kg
 */
export const calculateCO2Savings = (wasteType, weight = 1) => {
    // CO2 savings per kg of recycled material
    const co2PerKg = {
        plastic: 2.0,
        paper: 1.5,
        metal: 3.5,
        glass: 0.5,
        organic: 0.3,
        electronic: 4.0,
        hazardous: 2.5
    };

    return (co2PerKg[wasteType] || 1.0) * weight;
};

/**
 * Get user's recycling streak
 * @param {string} userId - User ID
 * @returns {number} Current streak in days
 */
export const getRecyclingStreak = (userId) => {
    const pickups = JSON.parse(localStorage.getItem('recyclink_pickups') || '[]');
    const userPickups = pickups
        .filter(p => p.customerId === userId && p.status === 'completed')
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    if (userPickups.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(userPickups[0].completedAt);

    for (let i = 1; i < userPickups.length; i++) {
        const pickupDate = new Date(userPickups[i].completedAt);
        const daysDiff = Math.floor((currentDate - pickupDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
            streak++;
            currentDate = pickupDate;
        } else if (daysDiff > 1) {
            break;
        }
    }

    return streak;
};

/**
 * Award rewards to user
 * @param {string} userId - User ID
 * @param {number} amount - Reward amount
 * @param {string} reason - Reason for reward
 */
export const awardRewards = (userId, amount, reason = 'Recycling activity') => {
    const users = JSON.parse(localStorage.getItem('recyclink_users') || '[]');
    const userIndex = users.findIndex(u => u.userId === userId);

    if (userIndex !== -1) {
        users[userIndex].rewards = (users[userIndex].rewards || 0) + amount;

        // Add to rewards history
        if (!users[userIndex].rewardsHistory) {
            users[userIndex].rewardsHistory = [];
        }
        users[userIndex].rewardsHistory.push({
            amount,
            reason,
            date: new Date().toISOString()
        });

        localStorage.setItem('recyclink_users', JSON.stringify(users));

        // Update current user in localStorage if it's them
        const currentUser = JSON.parse(localStorage.getItem('recyclink_user') || 'null');
        if (currentUser && currentUser.userId === userId) {
            currentUser.rewards = users[userIndex].rewards;
            localStorage.setItem('recyclink_user', JSON.stringify(currentUser));
        }
    }
};

export default {
    calculateCustomerRewards,
    calculateAgentRewards,
    getLeaderboard,
    calculateCO2Savings,
    getRecyclingStreak,
    awardRewards,
    CUSTOMER_REWARDS,
    AGENT_REWARDS,
    BONUSES
};
