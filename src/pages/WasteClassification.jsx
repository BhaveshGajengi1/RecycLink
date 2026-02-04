import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, ArrowLeft, RotateCcw, ExternalLink, Award, Cloud } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import WalletConnect from '../components/WalletConnect';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    classifyWasteWithAI,
    validateImageFile,
    isAIConfigured,
    getCategoryColor
} from '../services/realAiService';
import { classifyWaste } from '../services/aiService'; // Fallback
import { uploadToIPFS, isIPFSConfigured } from '../services/ipfsService';
import {
    mintRecyclingNFT,
    isWalletConnected,
    isContractConfigured
} from '../services/realBlockchainService';
import { calculateCustomerRewards, awardRewards, calculateCO2Savings } from '../services/rewardsService';
import { pageTransition } from '../utils/animations';
import './WasteClassification.css';

const WasteClassification = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isClassifying, setIsClassifying] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [result, setResult] = useState(null);
    const [ipfsData, setIpfsData] = useState(null);
    const [nftData, setNftData] = useState(null);
    const [isFlipped, setIsFlipped] = useState(false);

    // Helper function for creating classification objects
    const createClassification = (category, label, confidence) => ({
        category: category,
        label: label,
        confidence: confidence,
        recyclable: ['plastic', 'paper', 'metal', 'glass', 'organic'].includes(category),
        tip: `This is likely ${label}. Please dispose of it properly.`,
        color: getCategoryColor(category),
        aiModel: 'Simulated AI (Color/Filename)'
    });

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
    const [error, setError] = useState(null);
    const [walletConnected, setWalletConnected] = useState(false);

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            validateImageFile(file);
            setError(null);
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage({ file, url: imageUrl });

            // Auto-classify
            await performClassification(file);
        } catch (err) {
            setError(err.message);
        }
    };

    const performClassification = async (file) => {
        setIsClassifying(true);
        setIsFlipped(false);
        setResult(null);
        setIpfsData(null);
        setNftData(null);

        try {
            let classificationResult;

            // Use real AI if configured, otherwise fallback to simulation
            if (isAIConfigured()) {
                console.log('🤖 Using real Gemini AI...');
                classificationResult = await classifyWasteWithAI(file);

                // Upload to IPFS if configured
                if (isIPFSConfigured()) {
                    setIsUploading(true);
                    try {
                        const ipfsResult = await uploadToIPFS(file);
                        setIpfsData(ipfsResult);
                        console.log('☁️ Uploaded to IPFS:', ipfsResult.cid);
                    } catch (ipfsError) {
                        console.warn('IPFS upload failed:', ipfsError.message);
                    } finally {
                        setIsUploading(false);
                    }
                }
            } else {
                console.log('⚠️ Gemini API not configured, using simulated AI');
                classificationResult = await classifyWaste(file);
            }

            setResult(classificationResult);

            // Award rewards to user
            if (user) {
                const itemCount = 1; // Could be extracted from classification
                const rewards = calculateCustomerRewards(
                    classificationResult.category,
                    itemCount,
                    user.stats
                );

                // Award rewards
                awardRewards(user.userId, rewards, `Classified ${classificationResult.label}`);

                // Update user stats
                const users = JSON.parse(localStorage.getItem('recyclink_users') || '[]');
                const userIndex = users.findIndex(u => u.userId === user.userId);
                if (userIndex !== -1) {
                    users[userIndex].stats.totalItems = (users[userIndex].stats.totalItems || 0) + itemCount;
                    const co2Saved = calculateCO2Savings(classificationResult.category, 1);
                    users[userIndex].stats.totalCO2Saved = (users[userIndex].stats.totalCO2Saved || 0) + co2Saved;
                    localStorage.setItem('recyclink_users', JSON.stringify(users));
                }

                console.log(`🎁 Awarded ${rewards} points for ${classificationResult.label}!`);
            }

            // Flip card to show result
            setTimeout(() => {
                setIsFlipped(true);
            }, 500);
        } catch (err) {
            console.error('Classification error:', err);
            setError(err.message || 'Classification failed. Please try again.');
        } finally {
            setIsClassifying(false);
        }
    };

    const handleMintNFT = async () => {
        if (!isWalletConnected()) {
            setError('Please connect your wallet first');
            return;
        }

        if (!isContractConfigured()) {
            setError('Smart contract not deployed yet. NFT minting coming soon!');
            return;
        }

        setIsMinting(true);
        setError(null);

        try {
            const imageHash = ipfsData?.cid || 'local-image';
            const txData = await mintRecyclingNFT(result, imageHash);

            setNftData(txData);
            console.log('🎉 NFT Minted!', txData);

            // Show success message
            alert(`NFT Minted Successfully!\nTransaction: ${txData.transactionHash.slice(0, 10)}...`);
        } catch (err) {
            console.error('Minting error:', err);
            setError(err.message);
        } finally {
            setIsMinting(false);
        }
    };

    const handleReset = () => {
        setSelectedImage(null);
        setResult(null);
        setIpfsData(null);
        setNftData(null);
        setIsFlipped(false);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCameraCapture = () => {
        alert('Camera feature coming soon! For now, please use file upload.');
    };

    // Get category info for display
    const getCategoryInfo = () => {
        if (!result) return null;

        // If using real AI, result has different structure
        if (result.aiModel) {
            return {
                name: result.category.charAt(0).toUpperCase() + result.category.slice(1),
                icon: getCategoryIcon(result.category),
                recyclable: result.recyclable,
                tip: result.disposalTip,
                color: result.color || getCategoryColor(result.category)
            };
        }

        // Simulated AI structure
        return {
            name: result.category.name,
            icon: result.category.icon,
            recyclable: result.category.recyclable,
            tip: result.category.tip,
            color: result.category.color
        };
    };

    const getCategoryIcon = (category) => {
        const icons = {
            plastic: '♻️',
            paper: '📄',
            metal: '🔩',
            glass: '🍾',
            organic: '🌱',
            electronic: '💻',
            hazardous: '⚠️'
        };
        return icons[category] || '♻️';
    };

    const categoryInfo = getCategoryInfo();

    return (
        <motion.div className="waste-classification-page" {...pageTransition}>
            <div className="container">
                {/* Header with Wallet */}
                <div className="page-header">
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft size={20} />}
                        onClick={() => navigate('/home')}
                    >
                        Back
                    </Button>
                    <h1 className="page-title">
                        {isAIConfigured() ? '🤖 Real AI' : '⚡ Demo'} Waste Classification
                    </h1>
                    <WalletConnect onConnect={(wallet) => setWalletConnected(true)} />
                </div>

                {/* Status Indicators */}
                <div className="status-indicators">
                    <div className={`status-badge ${isAIConfigured() ? 'active' : 'inactive'}`}>
                        {isAIConfigured() ? '✅ AI Classification Active' : '⚠️ Demo Mode'}
                    </div>
                    <div className={`status-badge ${isIPFSConfigured() ? 'active' : 'inactive'}`}>
                        {isIPFSConfigured() ? '✅ IPFS Active' : '⚠️ IPFS Disabled'}
                    </div>
                    <div className={`status-badge ${walletConnected ? 'active' : 'inactive'}`}>
                        {walletConnected ? '✅ Wallet Connected' : '⚠️ Wallet Not Connected'}
                    </div>
                </div>

                {/* Main Content */}
                <div className="classification-content">
                    {!selectedImage ? (
                        /* Upload Section */
                        <motion.div
                            className="upload-section"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="upload-card glass-card">
                                <div className="upload-icon">
                                    <Upload size={64} />
                                </div>
                                <h2>Upload Waste Image</h2>
                                <p>
                                    {isAIConfigured()
                                        ? 'Real AI will analyze your image using Google Gemini Vision'
                                        : 'Demo mode - simulated classification (configure API keys for real AI)'}
                                </p>

                                <div className="upload-buttons">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                    <Button
                                        variant="primary"
                                        size="large"
                                        icon={<Upload size={24} />}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Choose File
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="large"
                                        icon={<Camera size={24} />}
                                        onClick={handleCameraCapture}
                                    >
                                        Use Camera
                                    </Button>
                                </div>

                                {error && (
                                    <div className="error-message">
                                        {error}
                                    </div>
                                )}

                                {!isAIConfigured() && (
                                    <div className="info-message">
                                        💡 To enable real AI: Add VITE_GEMINI_API_KEY to .env file
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        /* Result Section */
                        <div className="result-section">
                            {isClassifying || isUploading ? (
                                <LoadingSpinner
                                    variant="scan"
                                    text={isClassifying ? 'Analyzing with AI...' : 'Uploading to IPFS...'}
                                />
                            ) : (
                                <>
                                    <div className="flip-card-container">
                                        <motion.div
                                            className="flip-card"
                                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                                        >
                                            {/* Front - Image */}
                                            <div className="flip-card-front">
                                                <img
                                                    src={selectedImage.url}
                                                    alt="Waste item"
                                                    className="waste-image"
                                                />
                                            </div>

                                            {/* Back - Result */}
                                            <div className="flip-card-back">
                                                {result && categoryInfo && (
                                                    <div className="result-content">
                                                        <div
                                                            className="category-icon"
                                                            style={{ fontSize: '4rem' }}
                                                        >
                                                            {categoryInfo.icon}
                                                        </div>

                                                        <h2 className="category-name">
                                                            {categoryInfo.name}
                                                        </h2>

                                                        {result.item && (
                                                            <p className="item-name">{result.item}</p>
                                                        )}

                                                        <div className="confidence-section">
                                                            <div className="confidence-label">Confidence</div>
                                                            <div className="confidence-bar">
                                                                <motion.div
                                                                    className="confidence-fill"
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${result.confidence}%` }}
                                                                    transition={{ duration: 1, delay: 0.3 }}
                                                                    style={{
                                                                        background: categoryInfo.recyclable
                                                                            ? 'var(--gradient-primary)'
                                                                            : 'linear-gradient(90deg, #ef4444, #f59e0b)',
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="confidence-value">
                                                                {result.confidence}%
                                                            </div>
                                                        </div>

                                                        <div className="recyclable-badge">
                                                            {categoryInfo.recyclable ? (
                                                                <span className="badge badge-success">
                                                                    ♻️ Recyclable
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-warning">
                                                                    ⚠️ Not Recyclable
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="disposal-tip">
                                                            <h3>Disposal Tip</h3>
                                                            <p>{categoryInfo.tip}</p>
                                                        </div>

                                                        {/* IPFS Info */}
                                                        {ipfsData && (
                                                            <div className="ipfs-info">
                                                                <Cloud size={16} />
                                                                <span>Stored on IPFS</span>
                                                                <a
                                                                    href={ipfsData.ipfsUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="ipfs-link"
                                                                >
                                                                    View <ExternalLink size={12} />
                                                                </a>
                                                            </div>
                                                        )}

                                                        {/* NFT Info */}
                                                        {nftData && (
                                                            <div className="nft-success">
                                                                <Award size={20} />
                                                                <span>NFT Minted!</span>
                                                                <a
                                                                    href={nftData.explorerUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    View on Arbiscan <ExternalLink size={12} />
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="action-buttons">
                                        <Button
                                            variant="primary"
                                            icon={<RotateCcw size={20} />}
                                            onClick={handleReset}
                                        >
                                            Scan Another
                                        </Button>

                                        {walletConnected && !nftData && isContractConfigured() && (
                                            <Button
                                                variant="secondary"
                                                icon={<Award size={20} />}
                                                onClick={handleMintNFT}
                                                loading={isMinting}
                                            >
                                                {isMinting ? 'Minting NFT...' : 'Mint NFT Badge'}
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            onClick={() => navigate('/schedule')}
                                        >
                                            Schedule Pickup
                                        </Button>
                                    </div>

                                    {error && (
                                        <div className="error-message">
                                            {error}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default WasteClassification;
