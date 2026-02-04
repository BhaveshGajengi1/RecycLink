import { motion } from 'framer-motion';
import './AnimatedBackground.css';

const AnimatedBackground = ({ variant = 'default' }) => {
    // Safe window dimensions with fallback
    const getWindowDimensions = () => {
        if (typeof window !== 'undefined') {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }
        return { width: 1920, height: 1080 }; // Default fallback
    };

    const { width, height } = getWindowDimensions();

    return (
        <div className="animated-background">
            {/* Gradient waves */}
            <div className="gradient-wave wave-1"></div>
            <div className="gradient-wave wave-2"></div>
            <div className="gradient-wave wave-3"></div>

            {/* Floating particles */}
            <div className="particles">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="particle"
                        initial={{
                            x: Math.random() * width,
                            y: Math.random() * height,
                            scale: Math.random() * 0.5 + 0.5,
                        }}
                        animate={{
                            y: [null, Math.random() * height],
                            x: [null, Math.random() * width],
                        }}
                        transition={{
                            duration: Math.random() * 20 + 10,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'linear',
                        }}
                    />
                ))}
            </div>

            {/* Glow effects */}
            <div className="glow glow-1"></div>
            <div className="glow glow-2"></div>
            <div className="glow glow-3"></div>
        </div>
    );
};

export default AnimatedBackground;
