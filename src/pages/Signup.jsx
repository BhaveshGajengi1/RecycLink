import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Truck, Mail, Lock, Phone, Car, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { register } from '../services/authService';
import Button from '../components/Button';
import Card from '../components/Card';
import { pageTransition } from '../utils/animations';
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [step, setStep] = useState(1); // 1: role selection, 2: form
    const [role, setRole] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        vehicleInfo: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const userData = await register({
                ...formData,
                role
            });

            // Auto-login after registration
            login(userData);

            // Redirect based on role
            if (role === 'customer') {
                navigate('/home');
            } else {
                navigate('/agent/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    return (
        <motion.div className="signup-page" {...pageTransition}>
            <div className="container">
                <div className="signup-content">
                    {/* Header */}
                    <div className="signup-header">
                        <div className="logo-container">
                            <div className="logo-icon">♻️</div>
                            <h1 className="logo-text">RecycLink</h1>
                        </div>
                        <p className="signup-subtitle">
                            {step === 1 ? 'Choose your role to get started' : `Sign up as ${role === 'customer' ? 'Customer' : 'Pickup Agent'}`}
                        </p>
                    </div>

                    {step === 1 ? (
                        /* Step 1: Role Selection */
                        <motion.div
                            className="role-selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card
                                className="role-option"
                                onClick={() => handleRoleSelect('customer')}
                            >
                                <div className="role-icon customer">
                                    <User size={48} />
                                </div>
                                <h2>Sign up as Customer</h2>
                                <p>Classify waste, schedule pickups, and earn rewards for recycling</p>
                                <ul className="role-features">
                                    <li>✓ AI-powered waste classification</li>
                                    <li>✓ Easy pickup scheduling</li>
                                    <li>✓ Earn rewards & NFT badges</li>
                                    <li>✓ Track your environmental impact</li>
                                </ul>
                                <Button variant="primary" fullWidth>
                                    Continue as Customer
                                </Button>
                            </Card>

                            <Card
                                className="role-option"
                                onClick={() => handleRoleSelect('agent')}
                            >
                                <div className="role-icon agent">
                                    <Truck size={48} />
                                </div>
                                <h2>Sign up as Pickup Agent</h2>
                                <p>Verify pickups, complete collections, and earn money</p>
                                <ul className="role-features">
                                    <li>✓ View available pickups nearby</li>
                                    <li>✓ QR code verification system</li>
                                    <li>✓ Earn rewards per pickup</li>
                                    <li>✓ Track earnings & performance</li>
                                </ul>
                                <Button variant="secondary" fullWidth>
                                    Continue as Agent
                                </Button>
                            </Card>
                        </motion.div>
                    ) : (
                        /* Step 2: Registration Form */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="signup-card">
                                <form onSubmit={handleSubmit} className="signup-form">
                                    {/* Name */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <User size={20} />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <Mail size={20} />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="your.email@example.com"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <Phone size={20} />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="+1 (555) 123-4567"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                        />
                                    </div>

                                    {/* Vehicle Info (Agents only) */}
                                    {role === 'agent' && (
                                        <div className="form-group">
                                            <label className="form-label">
                                                <Car size={20} />
                                                Vehicle Information
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="e.g., Toyota Truck, License: ABC123"
                                                value={formData.vehicleInfo}
                                                onChange={(e) => handleChange('vehicleInfo', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {/* Password */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <Lock size={20} />
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            placeholder="At least 6 characters"
                                            value={formData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <Lock size={20} />
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            placeholder="Re-enter your password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="error-message">
                                            <AlertCircle size={20} />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="form-actions">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setStep(1)}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            icon={<UserPlus size={20} />}
                                            loading={loading}
                                        >
                                            Create Account
                                        </Button>
                                    </div>
                                </form>

                                {/* Login Link */}
                                <div className="signup-footer">
                                    <p>Already have an account?</p>
                                    <Link to="/login" className="login-link">
                                        Sign In
                                    </Link>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Signup;
