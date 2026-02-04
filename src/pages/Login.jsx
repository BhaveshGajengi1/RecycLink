import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Truck, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { login as loginUser } from '../services/authService';
import Button from '../components/Button';
import Card from '../components/Card';
import { pageTransition } from '../utils/animations';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await loginUser(formData.email, formData.password);
            login(userData);

            // Redirect based on role
            if (userData.role === 'customer') {
                navigate('/home');
            } else if (userData.role === 'agent') {
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
        <motion.div className="login-page" {...pageTransition}>
            <div className="container">
                <div className="login-content">
                    {/* Header */}
                    <div className="login-header">
                        <div className="logo-container">
                            <div className="logo-icon">♻️</div>
                            <h1 className="logo-text">RecycLink</h1>
                        </div>
                        <p className="login-subtitle">Welcome back! Sign in to continue</p>
                    </div>

                    {/* Login Form */}
                    <Card className="login-card">
                        <form onSubmit={handleSubmit} className="login-form">
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

                            {/* Password */}
                            <div className="form-group">
                                <label className="form-label">
                                    <Lock size={20} />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
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

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                icon={<LogIn size={20} />}
                                loading={loading}
                                fullWidth
                            >
                                Sign In
                            </Button>
                        </form>

                        {/* Signup Link */}
                        <div className="login-footer">
                            <p>Don't have an account?</p>
                            <Link to="/signup" className="signup-link">
                                Create Account
                            </Link>
                        </div>
                    </Card>

                    {/* Role Info */}
                    <div className="role-info">
                        <div className="role-card">
                            <User size={24} />
                            <h3>Customer</h3>
                            <p>Classify waste, schedule pickups, earn rewards</p>
                        </div>
                        <div className="role-card">
                            <Truck size={24} />
                            <h3>Pickup Agent</h3>
                            <p>Verify pickups, complete collections, earn money</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Login;
