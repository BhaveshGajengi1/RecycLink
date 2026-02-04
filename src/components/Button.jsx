import { motion } from 'framer-motion';
import { hoverScale } from '../utils/animations';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    onClick,
    disabled = false,
    type = 'button',
    icon,
    loading = false,
    className = '',
    ...props
}) => {
    const buttonClass = `btn btn-${variant} btn-${size} ${className}`;

    return (
        <motion.button
            className={buttonClass}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            {...hoverScale}
            {...props}
        >
            {loading ? (
                <>
                    <span className="btn-spinner"></span>
                    Loading...
                </>
            ) : (
                <>
                    {icon && <span className="btn-icon">{icon}</span>}
                    {children}
                </>
            )}
        </motion.button>
    );
};

export default Button;
