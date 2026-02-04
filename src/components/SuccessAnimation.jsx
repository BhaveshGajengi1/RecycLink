import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import './SuccessAnimation.css';

const SuccessAnimation = ({ variant = 'checkmark', message = 'Success!' }) => {
    if (variant === 'confetti') {
        return (
            <div className="success-container">
                <div className="confetti-wrapper">
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                backgroundColor: [
                                    '#10b981',
                                    '#14b8a6',
                                    '#3b82f6',
                                    '#f59e0b',
                                    '#ef4444',
                                ][Math.floor(Math.random() * 5)],
                            }}
                            initial={{ y: 0, opacity: 1, rotate: 0 }}
                            animate={{
                                y: [-20, 100],
                                opacity: [1, 0],
                                rotate: [0, Math.random() * 360],
                            }}
                            transition={{
                                duration: 1.5 + Math.random(),
                                delay: Math.random() * 0.5,
                                ease: 'easeOut',
                            }}
                        />
                    ))}
                </div>
                <motion.div
                    className="success-icon-large"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                    <Check size={64} />
                </motion.div>
                <motion.p
                    className="success-message"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {message}
                </motion.p>
            </div>
        );
    }

    if (variant === 'pulse') {
        return (
            <div className="success-container">
                <motion.div
                    className="pulse-circle"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.6 }}
                >
                    <Check size={48} />
                </motion.div>
                <motion.p
                    className="success-message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {message}
                </motion.p>
            </div>
        );
    }

    // Default checkmark
    return (
        <div className="success-container">
            <motion.div
                className="checkmark-circle"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Check size={48} strokeWidth={3} />
                </motion.div>
            </motion.div>
            <motion.p
                className="success-message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                {message}
            </motion.p>
        </div>
    );
};

export default SuccessAnimation;
