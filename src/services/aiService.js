import { WASTE_CATEGORIES } from '../utils/constants';

/**
 * Simulated AI service for waste classification
 * In production, this would call a real ML model API
 */

// Simulate processing delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random confidence score between min and max
const generateConfidence = (min = 85, max = 98) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Simple keyword-based classification for demo
const classifyByKeywords = (imageName) => {
    const name = imageName.toLowerCase();

    if (name.includes('bottle') || name.includes('plastic') || name.includes('bag') || name.includes('container')) {
        return WASTE_CATEGORIES.PLASTIC;
    }
    if (name.includes('can') || name.includes('metal') || name.includes('aluminum') || name.includes('tin')) {
        return WASTE_CATEGORIES.METAL;
    }
    if (name.includes('paper') || name.includes('cardboard') || name.includes('newspaper') || name.includes('magazine')) {
        return WASTE_CATEGORIES.PAPER;
    }
    if (name.includes('glass') || name.includes('jar') || name.includes('wine') || name.includes('beer')) {
        return WASTE_CATEGORIES.GLASS;
    }
    if (name.includes('food') || name.includes('organic') || name.includes('fruit') || name.includes('vegetable')) {
        return WASTE_CATEGORIES.ORGANIC;
    }

    // Default to non-recyclable if no match
    return WASTE_CATEGORIES.NON_RECYCLABLE;
};

/**
 * Classify waste from image
 * @param {File} imageFile - The uploaded image file
 * @returns {Promise<Object>} Classification result
 */
export const classifyWaste = async (imageFile) => {
    // Simulate API call delay
    await delay(2000);

    // In a real app, you would:
    // 1. Upload image to server
    // 2. Send to ML model (TensorFlow, PyTorch, etc.)
    // 3. Get classification result

    // For demo, classify based on filename
    const category = classifyByKeywords(imageFile.name);
    const confidence = generateConfidence();

    return {
        success: true,
        category: category,
        confidence: confidence,
        timestamp: new Date().toISOString(),
        metadata: {
            fileName: imageFile.name,
            fileSize: imageFile.size,
            fileType: imageFile.type,
        },
    };
};

/**
 * Classify waste from camera capture
 * @param {Blob} imageBlob - The captured image blob
 * @returns {Promise<Object>} Classification result
 */
export const classifyFromCamera = async (imageBlob) => {
    await delay(2000);

    // Random category for camera captures
    const categories = Object.values(WASTE_CATEGORIES);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const confidence = generateConfidence();

    return {
        success: true,
        category: randomCategory,
        confidence: confidence,
        timestamp: new Date().toISOString(),
        metadata: {
            source: 'camera',
            fileSize: imageBlob.size,
            fileType: imageBlob.type,
        },
    };
};

/**
 * Get disposal instructions for a category
 * @param {string} categoryId - The waste category ID
 * @returns {Object} Detailed disposal instructions
 */
export const getDisposalInstructions = (categoryId) => {
    const category = Object.values(WASTE_CATEGORIES).find(cat => cat.id === categoryId);

    if (!category) {
        return {
            category: 'Unknown',
            instructions: 'Unable to determine disposal method. Please consult local waste management guidelines.',
        };
    }

    return {
        category: category.name,
        recyclable: category.recyclable,
        tip: category.tip,
        icon: category.icon,
        color: category.color,
    };
};

/**
 * Batch classify multiple items
 * @param {Array<File>} imageFiles - Array of image files
 * @returns {Promise<Array>} Array of classification results
 */
export const batchClassify = async (imageFiles) => {
    const results = await Promise.all(
        imageFiles.map(file => classifyWaste(file))
    );

    return results;
};

/**
 * Get classification statistics
 * @param {Array} classifications - Array of past classifications
 * @returns {Object} Statistics summary
 */
export const getClassificationStats = (classifications) => {
    const stats = {
        total: classifications.length,
        byCategory: {},
        recyclableCount: 0,
        nonRecyclableCount: 0,
        averageConfidence: 0,
    };

    let totalConfidence = 0;

    classifications.forEach(classification => {
        const categoryId = classification.category.id;

        // Count by category
        stats.byCategory[categoryId] = (stats.byCategory[categoryId] || 0) + 1;

        // Count recyclable vs non-recyclable
        if (classification.category.recyclable) {
            stats.recyclableCount++;
        } else {
            stats.nonRecyclableCount++;
        }

        // Sum confidence for average
        totalConfidence += classification.confidence;
    });

    // Calculate average confidence
    stats.averageConfidence = classifications.length > 0
        ? Math.round(totalConfidence / classifications.length)
        : 0;

    return stats;
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {Object} Validation result
 */
export const validateImageFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'File too large. Maximum size is 10MB.' };
    }

    return { valid: true };
};
