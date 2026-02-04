import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, MapPin, ArrowLeft, Check, Download, Home } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import SuccessAnimation from '../components/SuccessAnimation';
import { generatePickupQR } from '../services/blockchainService';
import { TIME_SLOTS } from '../utils/constants';
import { pageTransition } from '../utils/animations';
import './SchedulePickup.css';

// Generate 6-digit verification code
const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const SchedulePickup = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        date: '',
        timeSlot: '',
        address: '',
        items: '',
    });
    const [qrData, setQrData] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Generate verification code
        const code = generateVerificationCode();
        setVerificationCode(code);

        // Create pickup data
        const pickupData = {
            pickupId: `PICKUP-${Date.now()}`,
            verificationCode: code,
            customerId: user?.userId || 'guest',
            customerName: user?.name || 'Guest',
            agentId: null,
            status: 'scheduled', // scheduled, in-progress, completed
            date: formData.date,
            timeSlot: formData.timeSlot,
            address: formData.address,
            items: formData.items,
            createdAt: new Date().toISOString(),
            acceptedAt: null,
            completedAt: null
        };

        // Save to localStorage
        const pickups = JSON.parse(localStorage.getItem('recyclink_pickups') || '[]');
        pickups.push(pickupData);
        localStorage.setItem('recyclink_pickups', JSON.stringify(pickups));

        // Generate QR code with verification code
        const qrCodeData = generatePickupQR({ ...formData, verificationCode: code, pickupId: pickupData.pickupId });
        setQrData(pickupData);

        // Show success animation
        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
            setStep(2);
        }, 2000);
    };

    // Download QR code as image
    const downloadQR = () => {
        const svg = document.getElementById('pickup-qr-code');
        if (!svg) return;

        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Download as PNG
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `pickup-qr-${qrData.pickupId}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const isFormValid = formData.date && formData.timeSlot && formData.address;

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <motion.div className="schedule-pickup-page" {...pageTransition}>
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft size={20} />}
                        onClick={() => navigate('/home')}
                    >
                        Back
                    </Button>
                    <h1 className="page-title">Schedule Pickup</h1>
                </div>

                {/* Content */}
                <div className="schedule-content">
                    {showSuccess ? (
                        <SuccessAnimation variant="confetti" message="Pickup Scheduled!" />
                    ) : step === 1 ? (
                        /* Step 1: Schedule Form */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="schedule-form-card">
                                <h2 className="form-title">Schedule Your Pickup</h2>
                                <p className="form-subtitle">
                                    Choose a convenient time for waste collection
                                </p>

                                <form onSubmit={handleSubmit} className="schedule-form">
                                    {/* Date Selection */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <CalendarIcon size={20} />
                                            Pickup Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            min={today}
                                            value={formData.date}
                                            onChange={(e) => handleInputChange('date', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Time Slot Selection */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <Clock size={20} />
                                            Time Slot
                                        </label>
                                        <div className="time-slots">
                                            {TIME_SLOTS.map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    className={`time-slot ${formData.timeSlot === slot.value ? 'active' : ''
                                                        }`}
                                                    onClick={() => handleInputChange('timeSlot', slot.value)}
                                                >
                                                    {slot.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <MapPin size={20} />
                                            Pickup Address
                                        </label>
                                        <textarea
                                            className="form-input"
                                            rows={3}
                                            placeholder="Enter your full address..."
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Items Description */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            Items Description (Optional)
                                        </label>
                                        <textarea
                                            className="form-input"
                                            rows={2}
                                            placeholder="E.g., 5 plastic bottles, 3 cardboard boxes..."
                                            value={formData.items}
                                            onChange={(e) => handleInputChange('items', e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="large"
                                        disabled={!isFormValid}
                                        icon={<Check size={20} />}
                                    >
                                        Confirm Pickup
                                    </Button>
                                </form>
                            </Card>
                        </motion.div>
                    ) : (
                        /* Step 2: QR Code Display */
                        <motion.div
                            className="qr-section"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="qr-card">
                                <div className="success-icon">
                                    <Check size={48} />
                                </div>

                                <h2 className="qr-title">Pickup Confirmed!</h2>
                                <p className="qr-subtitle">
                                    Show this QR code to the collector
                                </p>

                                <div className="qr-code-container">
                                    {qrData && (
                                        <QRCodeSVG
                                            id="pickup-qr-code"
                                            value={JSON.stringify(qrData)}
                                            size={256}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    )}
                                </div>

                                {/* Verification Code Display */}
                                <div className="verification-code-display">
                                    <p className="code-label">Verification Code</p>
                                    <p className="code-value">{verificationCode}</p>
                                    <p className="code-hint">Use this code if QR scan doesn't work</p>
                                </div>

                                <div className="pickup-details">
                                    <div className="detail-item">
                                        <CalendarIcon size={20} />
                                        <span>{new Date(formData.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Clock size={20} />
                                        <span>{TIME_SLOTS.find(s => s.value === formData.timeSlot)?.label}</span>
                                    </div>
                                    <div className="detail-item">
                                        <MapPin size={20} />
                                        <span>{formData.address}</span>
                                    </div>
                                </div>

                                <div className="qr-actions">
                                    <Button
                                        variant="primary"
                                        icon={<Download size={20} />}
                                        onClick={downloadQR}
                                        fullWidth
                                    >
                                        Download QR Code
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        icon={<Home size={20} />}
                                        onClick={() => navigate('/home')}
                                        fullWidth
                                    >
                                        Go to Home
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setStep(1);
                                            setFormData({ date: '', timeSlot: '', address: '', items: '' });
                                            setQrData(null);
                                            setVerificationCode('');
                                        }}
                                        fullWidth
                                    >
                                        Schedule Another Pickup
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

export default SchedulePickup;
