// Framer Motion animation variants for consistent animations across the app

export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeInOut' },
};

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const slideUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
};

export const slideDown = {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};

export const flipCard = {
    initial: { rotateY: 0 },
    flipped: { rotateY: 180 },
    transition: { duration: 0.6, ease: 'easeInOut' },
};

export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

export const hoverScale = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
};

export const hoverGlow = {
    whileHover: {
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)',
        transition: { duration: 0.2 },
    },
};

export const floatAnimation = {
    animate: {
        y: [0, -20, 0],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

export const pulseAnimation = {
    animate: {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

export const scanAnimation = {
    animate: {
        y: ['-100%', '100%'],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

export const successAnimation = {
    initial: { scale: 0, opacity: 0 },
    animate: {
        scale: [0, 1.2, 1],
        opacity: [0, 1, 1],
        transition: {
            duration: 0.6,
            times: [0, 0.6, 1],
            ease: 'easeOut',
        },
    },
};

export const confettiAnimation = {
    animate: {
        y: [0, -100],
        opacity: [1, 0],
        rotate: [0, 360],
        transition: {
            duration: 1.5,
            ease: 'easeOut',
        },
    },
};

export const typingAnimation = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
        },
    },
};

export const letterAnimation = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export const progressAnimation = {
    initial: { width: 0 },
    animate: (progress) => ({
        width: `${progress}%`,
        transition: { duration: 0.5, ease: 'easeOut' },
    }),
};

export const shimmerAnimation = {
    animate: {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

export const rotateAnimation = {
    animate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

export const bounceAnimation = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};
