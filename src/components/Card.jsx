import { motion } from 'framer-motion';
import { hoverGlow } from '../utils/animations';
import './Card.css';

const Card = ({
    children,
    variant = 'default',
    hoverable = true,
    className = '',
    onClick,
    ...props
}) => {
    const cardClass = `card card-${variant} ${hoverable ? 'card-hoverable' : ''} ${className}`;

    const CardComponent = onClick ? motion.div : motion.div;

    return (
        <CardComponent
            className={cardClass}
            onClick={onClick}
            {...(hoverable && hoverGlow)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            {...props}
        >
            {children}
        </CardComponent>
    );
};

export default Card;
