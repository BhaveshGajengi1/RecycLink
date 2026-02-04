import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Hash, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateRewards } from '../services/authService';
import Button from '../components/Button';
import Card from '../components/Card';
import QRScanner from '../components/QRScanner';
import SuccessAnimation from '../components/SuccessAnimation';
import { pageTransition } from '../utils/animations';
import './VerifyPickup.css';

const VerifyPickup = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [method, setMethod] = useState('code'); // 'qr' or 'code'
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [pickupData, setPickupData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    const handleVerifyCode = () => {
        setError('');
        setLoading(true);

        // Simulate verification delay
        setTimeout(() => {
            // Get all pickups
            const pickups = JSON.parse(localStorage.getItem('recyclink_pickups') || '[]');

            // Find pickup by verification code
            const pickup = pickups.find(p =>
                p.verificationCode?.toUpperCase() === verificationCode.toUpperCase()
            );

            if (!pickup) {
                setError('Invalid verification code. Please check and try again.');
                setLoading(false);
                return;
            }

            if (pickup.status === 'completed') {
                setError('This pickup has already been completed.');
                setLoading(false);
                return;
            }

            // Complete the pickup
            completePickup(pickup);
        }, 1000);
    };

    const completePickup = async (pickup) => {
        // Update pickup status
        const pickups = JSON.parse(localStorage.getItem('recyclink_pickups') || '[]');
        const updatedPickups = pickups.map(p => {
            if (p.pickupId === pickup.pickupId) {
                return {
                    ...p,
                    status: 'completed',
                    agentId: user.userId,
                    completedAt: new Date().toISOString()
                };
            }
            return p;
        });
        localStorage.setItem('recyclink_pickups', JSON.stringify(updatedPickups));

        // Award rewards to agent
        const agentReward = 50; // Points per pickup
        await updateRewards(user.userId, agentReward);

        // Award rewards to customer (if we had customer ID)
        // const customerReward = 100;
        // await updateRewards(pickup.customerId, customerReward);

        setPickupData(pickup);
        setSuccess(true);
        setLoading(false);

        // Redirect after success
        setTimeout(() => {
            navigate('/agent/dashboard');
        }, 3000);
    };

    const handleQRScan = (data) => {
        try {
            const qrData = JSON.parse(data);
            if (qrData.verificationCode) {
                setVerificationCode(qrData.verificationCode);
                handleVerifyCode();
            }
        } catch (err) {
            setError('Invalid QR code format');
        }
    };

    if (success) {
        return (
            <motion.div className="verify-pickup-page" {...pageTransition}>
                <div className="container">
                    <SuccessAnimation
                        variant="confetti"
                        message="Pickup Verified Successfully!"
                    />
                    <Card className="success-card">
                        <div className="success-icon">
                            <CheckCircle size={64} />
                        </div>
                        <h2>Great Job!</h2>
                        <p>You've earned 50 points for completing this pickup</p>
                        {pickupData && (
                            <div className="pickup-summary">
                                <p><strong>Pickup ID:</strong> {pickupData.pickupId}</p>
                                <p><strong>Location:</strong> {pickupData.address}</p>
                            </div>
                        )}
                    </Card>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div className="verify-pickup-page" {...pageTransition}>
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft size={20} />}
                        onClick={() => navigate('/agent/dashboard')}
                    >
                        Back
                    </Button>
                    <h1 className="page-title">Verify Pickup</h1>
                </div>

                {/* Method Selection */}
                <div className="method-selection">
                    <button
                        className={`method-button ${method === 'code' ? 'active' : ''}`}
                        onClick={() => setMethod('code')}
                    >
                        <Hash size={24} />
                        <span>Enter Code</span>
                    </button>
                    <button
                        className={`method-button ${method === 'qr' ? 'active' : ''}`}
                        onClick={() => setMethod('qr')}
                    >
                        <Camera size={24} />
                        <span>Scan QR</span>
                    </button>
                </div>

                {/* Verification Content */}
                <Card className="verification-card">
                    {method === 'code' ? (
                        /* Manual Code Entry */
                        <div className="code-entry">
                            <div className="entry-icon">
                                <Hash size={48} />
                            </div>
                            <h2>Enter Verification Code</h2>
                            <p className="entry-subtitle">
                                Ask the customer for their 6-digit verification code
                            </p>

                            <div className="code-input-container">
                                <input
                                    type="text"
                                    className="code-input"
                                    placeholder="ABC123"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        setVerificationCode(e.target.value.toUpperCase());
                                        setError('');
                                    }}
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="error-message">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                variant="primary"
                                onClick={handleVerifyCode}
                                loading={loading}
                                disabled={verificationCode.length !== 6}
                                fullWidth
                            >
                                Verify Pickup
                            </Button>
                        </div>
                    ) : (
                        /* QR Scanner */
                        <div className="qr-scanner">
                            <div className="scanner-icon">
                                <Camera size={48} />
                            </div>
                            <h2>Scan QR Code</h2>
                            <p className="scanner-subtitle">
                                Point your camera at the customer's QR code
                            </p>

                            <Button
                                variant="primary"
                                icon={<Camera size={20} />}
                                onClick={() => setShowScanner(true)}
                                fullWidth
                            >
                                Open Camera Scanner
                            </Button>

                            <p className="scanner-note">
                                Or use manual code entry below
                            </p>

                            <Button
                                variant="secondary"
                                onClick={() => setMethod('code')}
                                fullWidth
                            >
                                Use Code Instead
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Instructions */}
                <Card className="instructions-card">
                    <h3>Verification Steps</h3>
                    <ol>
                        <li>Ask the customer for their verification code or QR code</li>
                        <li>Enter the 6-digit code or scan the QR code</li>
                        <li>Verify the pickup details match</li>
                        <li>Collect the waste items</li>
                        <li>Complete the verification to earn rewards</li>
                    </ol>
                </Card>
            </div>

            {/* QR Scanner Modal */}
            {showScanner && (
                <QRScanner
                    onScan={handleQRScan}
                    onError={(err) => setError(err)}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </motion.div>
    );
};

export default VerifyPickup;
