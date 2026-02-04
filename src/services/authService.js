/**
 * Authentication Service
 * Handles user registration, login, and session management
 */

// Generate unique user ID
const generateUserId = () => {
    return `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all users from localStorage
const getUsers = () => {
    const users = localStorage.getItem('recyclink_users');
    return users ? JSON.parse(users) : [];
};

// Save users to localStorage
const saveUsers = (users) => {
    localStorage.setItem('recyclink_users', JSON.stringify(users));
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registered user data
 */
export const register = async ({ email, password, name, role, phone, vehicleInfo }) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();

            // Check if email already exists
            if (users.find(u => u.email === email)) {
                reject(new Error('Email already registered'));
                return;
            }

            // Create new user
            const newUser = {
                userId: generateUserId(),
                email,
                name,
                role, // 'customer' or 'agent'
                phone: phone || '',
                vehicleInfo: role === 'agent' ? vehicleInfo : null,
                createdAt: new Date().toISOString(),
                rewards: 0,
                stats: {
                    totalPickups: 0,
                    totalItems: 0,
                    totalCO2Saved: 0
                }
            };

            // Save password separately (in real app, this would be hashed)
            const passwords = JSON.parse(localStorage.getItem('recyclink_passwords') || '{}');
            passwords[email] = password; // In production, hash this!
            localStorage.setItem('recyclink_passwords', JSON.stringify(passwords));

            // Add user to users list
            users.push(newUser);
            saveUsers(users);

            // Return user without password
            resolve(newUser);
        }, 500); // Simulate network delay
    });
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data with token
 */
export const login = async (email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const passwords = JSON.parse(localStorage.getItem('recyclink_passwords') || '{}');

            // Find user
            const user = users.find(u => u.email === email);
            if (!user) {
                reject(new Error('Invalid email or password'));
                return;
            }

            // Check password
            if (passwords[email] !== password) {
                reject(new Error('Invalid email or password'));
                return;
            }

            // Generate token (simple version)
            const token = btoa(`${email}:${Date.now()}`);
            localStorage.setItem('recyclink_token', token);

            resolve({ ...user, token });
        }, 500);
    });
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem('recyclink_token');
    localStorage.removeItem('recyclink_user');
};

/**
 * Get current user
 * @returns {Object|null} Current user data
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('recyclink_user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (userId, updates) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const userIndex = users.findIndex(u => u.userId === userId);

            if (userIndex === -1) {
                reject(new Error('User not found'));
                return;
            }

            // Update user
            users[userIndex] = { ...users[userIndex], ...updates };
            saveUsers(users);

            // Update stored user if it's the current user
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.userId === userId) {
                localStorage.setItem('recyclink_user', JSON.stringify(users[userIndex]));
            }

            resolve(users[userIndex]);
        }, 300);
    });
};

/**
 * Update user rewards
 * @param {string} userId - User ID
 * @param {number} rewardAmount - Amount to add
 * @returns {Promise<Object>} Updated user data
 */
export const updateRewards = async (userId, rewardAmount) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.userId === userId);

    if (userIndex !== -1) {
        users[userIndex].rewards += rewardAmount;
        saveUsers(users);
        return users[userIndex];
    }
    return null;
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User data
 */
export const getUserById = (userId) => {
    const users = getUsers();
    return users.find(u => u.userId === userId) || null;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('recyclink_token');
};
