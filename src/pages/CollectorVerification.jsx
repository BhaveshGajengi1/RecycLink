import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, CheckCircle, ExternalLink } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import SuccessAnimation from '../components/SuccessAnimation';
import { verifyPickup, mintRecyclingBadge, simulateMintingProgress } from '../services/blockchainService';
import { pageTransition } from '../utils/animations';
import './CollectorVerification.css';

const CollectorVerification = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isMinting, setIsMinting] = useState(false);
    const [mintingProgress, setMintingProgress] = useState(0);
    const [mintingStatus, setMintingStatus] = useState('');
    const [mintResult, setMintResult] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleVerify = async () => {
        setShowSuccess(true);

        // Simulate verification
        await verifyPickup('DEMO-QR-CODE');

        setTimeout(() => {
            setShowSuccess(false);
            setStep(2);
            handleMint();
        }, 2000);
    };

    const handleMint = async () => {
        setIsMinting(true);

        // Simulate minting progress
        await simulateMintingProgress((progress) => {
            setMintingProgress(progress.progress);
            setMintingStatus(progress.status);
        });

        // Mint NFT
        const result = await mintRecyclingBadge({
            itemCount: 5,
            category: 'Mixed',
            co2Saved: 12.5,
        });

        setMintResult(result);
        setIsMinting(false);
        setStep(3);
    };

    return (
        <motion.div className="collector-verification-page" {...pageTransition}>
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft size={20} />}
                        onClick={() => navigate('/')}
                    >
                        Back
                    </Button>
                    <h1 className="page-title">Verify Pickup</h1>
                </div>

                {/* Content */}
                <div className="verification-content">
                    {showSuccess ? (
                        <SuccessAnimation variant="pulse" message="Pickup Verified!" />
                    ) : step === 1 ? (
                        /* Step 1: Scan QR */
                        <motion.div
                            className="scan-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="scan-card">
                                <div className="qr-icon">
                                    <QrCode size={80} />
                                </div>

                                <h2 className="scan-title">Scan Pickup QR Code</h2>
                                <p className="scan-subtitle">
                                    Collector will scan the QR code to verify pickup
                                </p>

                                <div className="scan-placeholder">
                                    <div className="scan-frame">
                                        <div className="scan-corner top-left"></div>
                                        <div className="scan-corner top-right"></div>
                                        <div className="scan-corner bottom-left"></div>
                                        <div className="scan-corner bottom-right"></div>
                                        <motion.div
                                            className="scan-beam"
                                            animate={{
                                                y: ['-100%', '100%'],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                        />
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    size="large"
                                    icon={<CheckCircle size={24} />}
                                    onClick={handleVerify}
                                >
                                    Simulate Verification
                                </Button>
                            </Card>
                        </motion.div>
                    ) : step === 2 ? (
                        /* Step 2: Minting Progress */
                        <motion.div
                            className="minting-section"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="minting-card">
                                <h2 className="minting-title">Minting NFT Badge</h2>
                                <p className="minting-subtitle">
                                    Creating blockchain proof of your recycling impact
                                </p>

                                <div className="progress-container">
                                    <div className="progress-bar">
                                        <motion.div
                                            className="progress-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${mintingProgress}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                    <div className="progress-text">{mintingProgress}%</div>
                                </div>

                                <div className="minting-status">{mintingStatus}</div>

                                <div className="blockchain-animation">
                                    <motion.div
                                        className="block"
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 180, 360],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    >
                                        ⛓️
                                    </motion.div>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        /* Step 3: Success */
                        <motion.div
                            className="success-section"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="success-card">
                                <SuccessAnimation variant="checkmark" message="" />

                                <h2 className="success-title">NFT Badge Minted!</h2>
                                <p className="success-subtitle">
                                    Your recycling impact is now verified on the blockchain
                                </p>

                                {mintResult && (
                                    <div className="transaction-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Network:</span>
                                            <span className="detail-value">{mintResult.network}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Transaction Hash:</span>
                                            <span className="detail-value hash">
                                                {mintResult.transactionHash.slice(0, 10)}...
                                                {mintResult.transactionHash.slice(-8)}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Block Number:</span>
                                            <span className="detail-value">
                                                {mintResult.blockNumber.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Gas Used:</span>
                                            <span className="detail-value">{mintResult.gasUsed} MATIC</span>
                                        </div>
                                    </div>
                                )}

                                <div className="nft-preview">
                                    <div className="nft-badge">
                                        <div className="badge-shine"></div>
                                        <div className="badge-content">
                                            <div className="badge-icon">🏆</div>
                                            <div className="badge-name">Recycling Champion</div>
                                            <div className="badge-stats">
                                                <div>5 Items</div>
                                                <div>12.5kg CO₂ Saved</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="success-actions">
                                    {mintResult && (
                                        <Button
                                            variant="secondary"
                                            icon={<ExternalLink size={20} />}
                                            onClick={() => window.open(mintResult.explorerUrl, '_blank')}
                                        >
                                            View on Explorer
                                        </Button>
                                    )}
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        View Dashboard
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default CollectorVerification;
