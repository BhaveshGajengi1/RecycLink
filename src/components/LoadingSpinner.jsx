import { motion } from 'framer-motion';
import './LoadingSpinner.css';

const LoadingSpinner = ({ variant = 'default', text = 'Loading...' }) => {
    if (variant === 'scan') {
        return (
            <div className="loading-container">
                <div className="scan-container">
                    <div className="scan-box">
                        <motion.div
                            className="scan-line"
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
                    <p className="loading-text">{text}</p>
                </div>
            </div>
        );
    }

    if (variant === 'shimmer') {
        return (
            <div className="loading-container">
                <div className="shimmer-container">
                    <div className="shimmer-line"></div>
                    <div className="shimmer-line"></div>
                    <div className="shimmer-line"></div>
                </div>
                <p className="loading-text">{text}</p>
            </div>
        );
    }

    // Default spinner
    return (
        <div className="loading-container">
            <div className="spinner-container">
                <motion.div
                    className="spinner"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            </div>
            <p className="loading-text">{text}</p>
        </div>
    );
};

export default LoadingSpinner;
