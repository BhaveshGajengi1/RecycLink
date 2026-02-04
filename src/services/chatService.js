import { CHAT_RESPONSES, WASTE_CATEGORIES } from '../utils/constants';

/**
 * Simulated chat service for conversational AI assistant
 */

// Simulate typing delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get random response from array
const getRandomResponse = (responses) => {
    return responses[Math.floor(Math.random() * responses.length)];
};

// Detect intent from user message
const detectIntent = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
        return 'greeting';
    }

    if (lowerMessage.includes('recycle') || lowerMessage.includes('recyclable')) {
        return 'recyclable_query';
    }

    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('?')) {
        return 'question';
    }

    if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('help')) {
        return 'tips';
    }

    return 'general';
};

// Detect waste category from message
const detectCategory = (message) => {
    const lowerMessage = message.toLowerCase();

    for (const category of Object.values(WASTE_CATEGORIES)) {
        if (lowerMessage.includes(category.name.toLowerCase())) {
            return category;
        }
    }

    // Check for common items
    if (lowerMessage.match(/bottle|bag|container|wrapper/)) return WASTE_CATEGORIES.PLASTIC;
    if (lowerMessage.match(/can|foil|wire/)) return WASTE_CATEGORIES.METAL;
    if (lowerMessage.match(/cardboard|newspaper|magazine|box/)) return WASTE_CATEGORIES.PAPER;
    if (lowerMessage.match(/jar|wine|beer/)) return WASTE_CATEGORIES.GLASS;
    if (lowerMessage.match(/food|fruit|vegetable|compost/)) return WASTE_CATEGORIES.ORGANIC;

    return null;
};

/**
 * Generate AI response to user message
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} AI response
 */
export const generateResponse = async (userMessage, conversationHistory = []) => {
    // Simulate thinking delay
    await delay(800);

    const intent = detectIntent(userMessage);
    const category = detectCategory(userMessage);

    let response = '';
    let suggestions = [];

    switch (intent) {
        case 'greeting':
            response = getRandomResponse(CHAT_RESPONSES.greeting);
            suggestions = [
                'Can I recycle plastic bottles?',
                'How do I recycle paper?',
                'Give me recycling tips',
            ];
            break;

        case 'recyclable_query':
            if (category) {
                if (category.recyclable) {
                    response = `${getRandomResponse(CHAT_RESPONSES.recyclable)} ${category.tip}`;
                } else {
                    response = `${getRandomResponse(CHAT_RESPONSES.notRecyclable)} ${category.tip}`;
                }
                suggestions = [
                    'What about other materials?',
                    'Show me recycling tips',
                    'How can I reduce waste?',
                ];
            } else {
                response = "I'd be happy to help! Could you tell me what specific item you'd like to recycle? For example, plastic bottles, paper, glass jars, etc.";
                suggestions = [
                    'Plastic bottles',
                    'Cardboard boxes',
                    'Glass jars',
                ];
            }
            break;

        case 'tips':
            response = getRandomResponse(CHAT_RESPONSES.tips);
            suggestions = [
                'More tips please',
                'How to recycle plastic?',
                'What can I recycle?',
            ];
            break;

        case 'question':
            if (category) {
                response = `Great question about ${category.name}! ${category.tip}`;
                if (category.recyclable) {
                    response += ` ${category.name} is recyclable, so make sure to clean it before placing it in your recycling bin.`;
                } else {
                    response += ` ${category.name} typically can't be recycled through standard programs.`;
                }
            } else {
                response = "I'm here to help with recycling questions! You can ask me about specific materials like plastic, paper, glass, metal, or organic waste. What would you like to know?";
            }
            suggestions = [
                'Tell me about plastic recycling',
                'What about composting?',
                'Recycling tips',
            ];
            break;

        default:
            response = "I'm your recycling assistant! I can help you understand what can be recycled, how to properly dispose of waste, and share sustainability tips. What would you like to know?";
            suggestions = [
                'Can I recycle this?',
                'Recycling tips',
                'How does it work?',
            ];
    }

    return {
        message: response,
        suggestions,
        timestamp: new Date().toISOString(),
        category: category ? category.name : null,
    };
};

/**
 * Get quick action suggestions
 * @returns {Array} Array of quick action buttons
 */
export const getQuickActions = () => {
    return [
        {
            id: 'scan',
            label: '📸 Scan Waste',
            action: 'navigate',
            target: '/classify',
        },
        {
            id: 'schedule',
            label: '📅 Schedule Pickup',
            action: 'navigate',
            target: '/schedule',
        },
        {
            id: 'tips',
            label: '💡 Recycling Tips',
            action: 'message',
            message: 'Give me some recycling tips',
        },
        {
            id: 'impact',
            label: '🌍 My Impact',
            action: 'navigate',
            target: '/dashboard',
        },
    ];
};

/**
 * Get recycling tips by category
 * @param {string} categoryId - Waste category ID
 * @returns {Array} Array of tips
 */
export const getTipsByCategory = (categoryId) => {
    const tips = {
        plastic: [
            'Remove caps and lids before recycling bottles',
            'Rinse containers to remove food residue',
            'Check the recycling number - #1 and #2 are most commonly accepted',
            'Avoid recycling plastic bags in curbside bins - take them to store drop-offs',
            'Flatten bottles to save space',
        ],
        metal: [
            'Rinse cans and remove labels when possible',
            'Aluminum cans are infinitely recyclable',
            'Steel cans are magnetic - use a magnet to test',
            'Crush cans to save space in your bin',
            'Remove paper labels from cans',
        ],
        paper: [
            'Keep paper dry - wet paper cannot be recycled',
            'Remove plastic windows from envelopes',
            'Flatten cardboard boxes',
            'Shredded paper can be composted if not recyclable',
            'Remove tape and staples from cardboard',
        ],
        glass: [
            'Rinse jars and bottles',
            'Remove metal lids and caps',
            'Glass is 100% recyclable and can be recycled endlessly',
            'Separate by color if required by your program',
            'Broken glass should be wrapped and labeled',
        ],
        organic: [
            'Start a compost bin for food scraps',
            'Avoid composting meat, dairy, and oils',
            'Turn compost regularly for faster decomposition',
            'Use finished compost in your garden',
            'Consider vermicomposting (worm composting)',
        ],
    };

    return tips[categoryId] || [];
};

/**
 * Search recycling information
 * @param {string} query - Search query
 * @returns {Array} Search results
 */
export const searchRecyclingInfo = (query) => {
    const lowerQuery = query.toLowerCase();
    const results = [];

    Object.values(WASTE_CATEGORIES).forEach(category => {
        if (category.name.toLowerCase().includes(lowerQuery) ||
            category.tip.toLowerCase().includes(lowerQuery)) {
            results.push({
                category: category.name,
                icon: category.icon,
                recyclable: category.recyclable,
                tip: category.tip,
                relevance: 'high',
            });
        }
    });

    return results;
};

/**
 * Get conversation starters
 * @returns {Array} Array of conversation starter messages
 */
export const getConversationStarters = () => {
    return [
        "Can I recycle pizza boxes?",
        "What's the difference between #1 and #2 plastic?",
        "How do I recycle electronics?",
        "What can I do with old batteries?",
        "Is styrofoam recyclable?",
        "How to recycle glass bottles?",
        "Can I recycle aluminum foil?",
        "What about food-contaminated paper?",
    ];
};
