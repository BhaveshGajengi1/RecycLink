import { useState, useEffect, useRef } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';
import './QRScanner.css';

/**
 * QR Scanner Component
 * Uses browser's getUserMedia API to access camera and scan QR codes
 * Falls back to manual code entry if camera access fails
 */
const QRScanner = ({ onScan, onError, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            setError(null);

            // Request camera access
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
                setIsScanning(true);

                // Start scanning loop
                scanQRCode();
            }
        } catch (err) {
            console.error('Camera access error:', err);
            const errorMessage = err.name === 'NotAllowedError'
                ? 'Camera access denied. Please allow camera access and try again.'
                : 'Failed to access camera. Please use manual code entry instead.';
            setError(errorMessage);
            if (onError) onError(errorMessage);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsScanning(false);
    };

    const scanQRCode = () => {
        if (!isScanning || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Try to decode QR code
        // Note: For production, use a library like jsQR or zxing
        // This is a placeholder that would need a real QR decoder
        try {
            // Placeholder: In production, use jsQR library
            // const code = jsQR(imageData.data, imageData.width, imageData.height);
            // if (code) {
            //     onScan(code.data);
            //     stopCamera();
            //     return;
            // }
        } catch (err) {
            console.error('QR decode error:', err);
        }

        // Continue scanning
        if (isScanning) {
            requestAnimationFrame(scanQRCode);
        }
    };

    const handleClose = () => {
        stopCamera();
        if (onClose) onClose();
    };

    return (
        <div className="qr-scanner-overlay">
            <div className="qr-scanner-container">
                <div className="scanner-header">
                    <h3>Scan QR Code</h3>
                    <button className="close-button" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="scanner-body">
                    {error ? (
                        <div className="scanner-error">
                            <AlertCircle size={48} />
                            <p>{error}</p>
                            <button className="retry-button" onClick={startCamera}>
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="scanner-video-container">
                            <video
                                ref={videoRef}
                                className="scanner-video"
                                playsInline
                                muted
                            />
                            <canvas
                                ref={canvasRef}
                                className="scanner-canvas"
                                style={{ display: 'none' }}
                            />
                            <div className="scanner-overlay-frame">
                                <div className="scanner-corner tl"></div>
                                <div className="scanner-corner tr"></div>
                                <div className="scanner-corner bl"></div>
                                <div className="scanner-corner br"></div>
                                <div className="scanner-line"></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="scanner-footer">
                    <p className="scanner-hint">
                        <Camera size={16} />
                        Position the QR code within the frame
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
