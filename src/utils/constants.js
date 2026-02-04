// Waste Categories
export const WASTE_CATEGORIES = {
    PLASTIC: {
        id: 'plastic',
        name: 'Plastic',
        icon: '♻️',
        color: '#3b82f6',
        recyclable: true,
        tip: 'Clean and dry plastic items before recycling. Remove caps and labels when possible.',
    },
    METAL: {
        id: 'metal',
        name: 'Metal',
        icon: '🔩',
        color: '#64748b',
        recyclable: true,
        tip: 'Rinse metal cans and containers. Aluminum and steel are highly recyclable.',
    },
    PAPER: {
        id: 'paper',
        name: 'Paper',
        icon: '📄',
        color: '#f59e0b',
        recyclable: true,
        tip: 'Keep paper dry and clean. Remove any plastic windows or metal clips.',
    },
    GLASS: {
        id: 'glass',
        name: 'Glass',
        icon: '🍾',
        color: '#14b8a6',
        recyclable: true,
        tip: 'Rinse glass containers. Remove lids and caps before recycling.',
    },
    ORGANIC: {
        id: 'organic',
        name: 'Organic',
        icon: '🌱',
        color: '#22c55e',
        recyclable: false,
        tip: 'Compost organic waste to create nutrient-rich soil for plants.',
    },
    NON_RECYCLABLE: {
        id: 'non-recyclable',
        name: 'Non-Recyclable',
        icon: '🗑️',
        color: '#ef4444',
        recyclable: false,
        tip: 'Dispose in general waste. Consider reducing usage of non-recyclable items.',
    },
};

// Color Palette
export const COLORS = {
    primary: '#10b981',
    primaryDark: '#059669',
    primaryLight: '#34d399',
    secondary: '#14b8a6',
    secondaryDark: '#0d9488',
    secondaryLight: '#2dd4bf',
    accent: '#3b82f6',
    accentDark: '#2563eb',
    accentLight: '#60a5fa',
    dark: '#0f172a',
    light: '#f8fafc',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
};

// Animation Timings
export const ANIMATION_TIMINGS = {
    fast: 150,
    base: 200,
    slow: 300,
    scan: 2000,
    typing: 50,
};

// API Endpoints (Simulated)
export const API_ENDPOINTS = {
    classify: '/api/classify',
    chat: '/api/chat',
    schedule: '/api/schedule',
    verify: '/api/verify',
    mint: '/api/mint',
};

// Blockchain Networks
export const BLOCKCHAIN_NETWORKS = {
    POLYGON_MUMBAI: {
        name: 'Polygon Mumbai Testnet',
        chainId: 80001,
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        explorer: 'https://mumbai.polygonscan.com',
    },
};

// Impact Metrics
export const IMPACT_METRICS = {
    CO2_PER_KG: {
        plastic: 2.5,
        metal: 1.8,
        paper: 1.2,
        glass: 0.8,
        organic: 0.3,
    },
    WATER_SAVED_PER_KG: {
        plastic: 15,
        metal: 20,
        paper: 50,
        glass: 10,
    },
};

// Badge Levels
export const BADGE_LEVELS = [
    { name: 'Eco Starter', threshold: 0, color: '#94a3b8' },
    { name: 'Green Warrior', threshold: 10, color: '#22c55e' },
    { name: 'Sustainability Champion', threshold: 50, color: '#10b981' },
    { name: 'Planet Hero', threshold: 100, color: '#14b8a6' },
    { name: 'Eco Legend', threshold: 250, color: '#3b82f6' },
];

// Chat Responses
export const CHAT_RESPONSES = {
    greeting: [
        "Hello! I'm your recycling assistant. How can I help you recycle smarter today?",
        "Hi there! Ready to make a positive impact? Ask me anything about recycling!",
        "Welcome! I'm here to help you understand what can be recycled. What would you like to know?",
    ],
    recyclable: [
        "Great news! This item is recyclable. Make sure to clean it before placing it in the recycling bin.",
        "Yes, you can recycle this! Remember to remove any non-recyclable parts first.",
        "Absolutely recyclable! Clean and dry items recycle better.",
    ],
    notRecyclable: [
        "Unfortunately, this item isn't recyclable through standard programs. Consider reducing usage or finding alternative disposal methods.",
        "This can't be recycled in most programs, but check if there are specialized recycling centers in your area.",
        "Not recyclable through curbside pickup, but some facilities may accept it. Check locally!",
    ],
    tips: [
        "💡 Tip: Rinse containers before recycling to prevent contamination.",
        "💡 Tip: Flatten cardboard boxes to save space in recycling bins.",
        "💡 Tip: Remove caps and lids from bottles - they're often made of different materials.",
        "💡 Tip: Keep recyclables dry - wet paper and cardboard can't be recycled.",
        "💡 Tip: When in doubt, check with your local recycling program!",
    ],
};

// Time Slots for Pickup
export const TIME_SLOTS = [
    { id: 'morning', label: 'Morning (8 AM - 12 PM)', value: '08:00-12:00' },
    { id: 'afternoon', label: 'Afternoon (12 PM - 4 PM)', value: '12:00-16:00' },
    { id: 'evening', label: 'Evening (4 PM - 8 PM)', value: '16:00-20:00' },
];

// Sample Waste Items for Demo
export const SAMPLE_WASTE_ITEMS = [
    { name: 'Plastic Bottle', category: 'plastic', image: '/samples/plastic-bottle.jpg' },
    { name: 'Aluminum Can', category: 'metal', image: '/samples/aluminum-can.jpg' },
    { name: 'Newspaper', category: 'paper', image: '/samples/newspaper.jpg' },
    { name: 'Glass Jar', category: 'glass', image: '/samples/glass-jar.jpg' },
    { name: 'Food Scraps', category: 'organic', image: '/samples/food-scraps.jpg' },
    { name: 'Styrofoam', category: 'non-recyclable', image: '/samples/styrofoam.jpg' },
];
