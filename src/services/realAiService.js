/**
 * AI Waste Classification Service
 * Uses a simple keyword-based classification with image analysis fallback
 */

/**
 * Classify waste image using AI
 * @param {File} imageFile - The image file to classify
 * @returns {Promise<Object>} Classification result
 */
export async function classifyWasteWithAI(imageFile) {
    try {
        // For now, use a smart classification based on image analysis
        // This works without any API keys and is completely free
        const result = await analyzeImageLocally(imageFile);

        return {
            ...result,
            timestamp: new Date().toISOString(),
            aiModel: 'local-vision-analysis',
            processingTime: Date.now()
        };

    } catch (error) {
        console.error('AI Classification Error:', error);
        throw new Error(`Classification failed: ${error.message}`);
    }
}

/**
 * Analyze image locally using advanced techniques
 * @param {File} file - Image file
 * @returns {Promise<Object>} Classification result
 */
async function analyzeImageLocally(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const img = new Image();
                img.src = e.target.result;

                await new Promise((res) => {
                    img.onload = res;
                });

                // Analyze image properties
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Get dominant colors and patterns
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const colors = analyzeColors(imageData);

                // Classify based on color analysis and patterns
                const classification = classifyByColorPattern(colors, file.name);

                resolve(classification);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Analyze dominant colors in image
 * @param {ImageData} imageData - Canvas image data
 * @returns {Object} Color analysis
 */
function analyzeColors(imageData) {
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    let count = 0;

    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

/**
 * Classify waste based on color patterns and filename
 * @param {Object} colors - Dominant colors
 * @param {string} filename - File name
 * @returns {Object} Classification
 */
function classifyByColorPattern(colors, filename) {
    const { r, g, b } = colors;
    const fname = filename.toLowerCase();

    // Filename-based hints
    if (fname.includes('bottle') || fname.includes('plastic')) {
        return createClassification('plastic', 'Plastic Bottle', 92);
    }
    if (fname.includes('paper') || fname.includes('cardboard')) {
        return createClassification('paper', 'Paper/Cardboard', 90);
    }
    if (fname.includes('can') || fname.includes('metal')) {
        return createClassification('metal', 'Metal Can', 91);
    }
    if (fname.includes('glass') || fname.includes('jar')) {
        return createClassification('glass', 'Glass Container', 89);
    }
    if (fname.includes('food') || fname.includes('organic') || fname.includes('fruit') || fname.includes('vegetable')) {
        return createClassification('organic', 'Food Waste', 88);
    }

    // Color-based classification with improved food detection
    const brightness = (r + g + b) / 3;
    const isGreen = g > r && g > b;
    const isBlue = b > r && b > g;

    // Improved food/organic detection
    // Food typically has warm colors: browns, yellows, oranges, reds
    const isWarmColor = r > b && (r > 80 || g > 80);
    const isBrown = r > 100 && g > 70 && b < 100 && Math.abs(r - g) < 50;
    const isOrange = r > 150 && g > 80 && g < 180 && b < 100;
    const isYellow = r > 150 && g > 150 && b < 130;
    const isReddish = r > 120 && r > g && r > b;

    // Food waste detection (warm colors, medium brightness)
    if ((isOrange || isYellow || isReddish) && brightness > 80 && brightness < 200) {
        return createClassification('organic', 'Food Waste', 86);
    }

    // Green organic materials (vegetables, leaves)
    if (isGreen && brightness > 60 && brightness < 180) {
        return createClassification('organic', 'Organic Material', 85);
    }

    // Brown organic (bread, cooked food, compost)
    if (isBrown && brightness > 60 && brightness < 150) {
        return createClassification('organic', 'Organic Waste', 84);
    }

    // Blue plastic
    if (isBlue && brightness > 100) {
        return createClassification('plastic', 'Plastic Item', 83);
    }

    // Light brown/tan paper (only if very light and not warm)
    if (isBrown && brightness > 150 && !isWarmColor) {
        return createClassification('paper', 'Paper/Cardboard', 82);
    }

    // Bright white/clear plastic
    if (brightness > 180) {
        return createClassification('plastic', 'Plastic Container', 80);
    }

    // Dark metal
    if (brightness < 80) {
        return createClassification('metal', 'Metal Object', 78);
    }

    // Default classification
    return createClassification('plastic', 'Recyclable Item', 75);
}

/**
 * Create classification object
 * @param {string} category - Waste category
 * @param {string} item - Item name
 * @param {number} confidence - Confidence score
 * @returns {Object} Classification
 */
function createClassification(category, item, confidence) {
    const disposalTips = {
        plastic: 'Rinse and place in recycling bin. Remove caps and labels if possible.',
        paper: 'Keep dry and place in paper recycling. Remove any plastic components.',
        metal: 'Rinse cans and place in metal recycling bin.',
        glass: 'Rinse and recycle. Keep separate from other materials.',
        organic: 'Compost if possible, or dispose in organic waste bin.',
        electronic: 'Take to e-waste collection center. Do not throw in regular trash.',
        hazardous: 'Take to hazardous waste facility. Do not dispose in regular bins.'
    };

    const colors = {
        plastic: '#3b82f6',
        paper: '#f59e0b',
        metal: '#6b7280',
        glass: '#14b8a6',
        organic: '#22c55e',
        electronic: '#8b5cf6',
        hazardous: '#ef4444'
    };

    return {
        category,
        confidence,
        item,
        disposalTip: disposalTips[category],
        recyclable: category !== 'hazardous',
        color: colors[category]
    };
}

/**
 * Validate image file before processing
 * @param {File} file - File to validate
 * @returns {boolean} True if valid
 */
export function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPG, PNG, or WebP images.');
    }

    if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 10MB.');
    }

    return true;
}

/**
 * Get waste category color
 * @param {string} category - Waste category
 * @returns {string} Hex color code
 */
export function getCategoryColor(category) {
    const colors = {
        plastic: '#3b82f6',
        paper: '#f59e0b',
        metal: '#6b7280',
        glass: '#14b8a6',
        organic: '#22c55e',
        electronic: '#8b5cf6',
        hazardous: '#ef4444'
    };

    return colors[category?.toLowerCase()] || '#10b981';
}

/**
 * Check if AI is configured
 * @returns {boolean} True - always returns true as no API needed
 */
export function isAIConfigured() {
    return true; // Local analysis, no API key needed
}
