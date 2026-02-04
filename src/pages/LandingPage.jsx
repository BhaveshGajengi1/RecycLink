import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Recycle, Scan, MessageCircle, Calendar, Award, TrendingUp, Leaf, Droplet, Wind } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { pageTransition, staggerContainer, staggerItem, floatAnimation } from '../utils/animations';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // Redirect authenticated users to their dashboard
    useEffect(() => {
        if (isAuthenticated()) {
            if (user.role === 'customer') {
                navigate('/scan');
            } else if (user.role === 'agent') {
                navigate('/agent/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const features = [
        {
            icon: <Scan size={32} />,
            title: 'AI Classification',
            description: 'Instantly identify waste categories with 95%+ accuracy using advanced AI',
        },
        {
            icon: <MessageCircle size={32} />,
            title: 'Smart Assistant',
            description: 'Get instant answers about recycling from our AI-powered chatbot',
        },
        {
            icon: <Calendar size={32} />,
            title: 'Easy Scheduling',
            description: 'Schedule pickups with a few taps and track them in real-time',
        },
        {
            icon: <Award size={32} />,
            title: 'Blockchain Proof',
            description: 'Earn NFT badges as verifiable proof of your environmental impact',
        },
    ];

    const howItWorks = [
        {
            step: '01',
            title: 'Scan Your Waste',
            description: 'Upload or capture an image of your waste item',
            icon: <Scan size={40} />,
        },
        {
            step: '02',
            title: 'Get AI Classification',
            description: 'Our AI identifies the category and provides disposal tips',
            icon: <TrendingUp size={40} />,
        },
        {
            step: '03',
            title: 'Schedule Pickup',
            description: 'Choose a convenient time for waste collection',
            icon: <Calendar size={40} />,
        },
        {
            step: '04',
            title: 'Earn NFT Badges',
            description: 'Get blockchain-verified proof of your recycling impact',
            icon: <Award size={40} />,
        },
    ];

    const floatingIcons = [
        { Icon: Recycle, delay: 0, x: '10%', y: '20%' },
        { Icon: Leaf, delay: 1, x: '80%', y: '30%' },
        { Icon: Droplet, delay: 2, x: '15%', y: '70%' },
        { Icon: Wind, delay: 1.5, x: '85%', y: '75%' },
        { Icon: Recycle, delay: 0.5, x: '50%', y: '15%' },
    ];

    return (
        <motion.div
            className="landing-page"
            {...pageTransition}
        >
            {/* Floating Icons */}
            <div className="floating-icons">
                {floatingIcons.map(({ Icon, delay, x, y }, index) => (
                    <motion.div
                        key={index}
                        className="floating-icon"
                        style={{ left: x, top: y }}
                        {...floatAnimation}
                        transition={{
                            ...floatAnimation.animate.transition,
                            delay,
                        }}
                    >
                        <Icon size={40} />
                    </motion.div>
                ))}
            </div>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <motion.div
                        className="hero-content"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.h1 variants={staggerItem} className="hero-title">
                            Recycle <span className="text-gradient">Smarter</span>.
                            <br />
                            Prove <span className="text-gradient">Impact</span>.
                        </motion.h1>

                        <motion.p variants={staggerItem} className="hero-subtitle">
                            AI-powered waste classification meets blockchain verification.
                            <br />
                            Transform recycling into verifiable environmental action.
                        </motion.p>

                        <motion.div variants={staggerItem} className="hero-cta">
                            <Button
                                variant="primary"
                                size="large"
                                icon={<Scan size={24} />}
                                onClick={() => navigate('/classify')}
                            >
                                Scan Waste
                            </Button>
                            <Button
                                variant="secondary"
                                size="large"
                                onClick={() => scrollToSection('how-it-works')}
                            >
                                How It Works
                            </Button>
                        </motion.div>

                        <motion.div variants={staggerItem} className="hero-stats">
                            <div className="stat">
                                <div className="stat-number">95%+</div>
                                <div className="stat-label">AI Accuracy</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <div className="stat-number">100%</div>
                                <div className="stat-label">Blockchain Verified</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <div className="stat-number">24/7</div>
                                <div className="stat-label">Smart Assistant</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section section">
                <div className="container">
                    <motion.h2
                        className="section-title text-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Powerful Features
                    </motion.h2>

                    <motion.div
                        className="features-grid"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        {features.map((feature, index) => (
                            <motion.div key={index} variants={staggerItem}>
                                <Card hoverable className="feature-card">
                                    <div className="feature-icon">{feature.icon}</div>
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-description">{feature.description}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="how-it-works-section section">
                <div className="container">
                    <motion.h2
                        className="section-title text-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        How It Works
                    </motion.h2>

                    <div className="timeline">
                        {howItWorks.map((item, index) => (
                            <motion.div
                                key={index}
                                className="timeline-item"
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="timeline-step">{item.step}</div>
                                <Card className="timeline-card">
                                    <div className="timeline-icon">{item.icon}</div>
                                    <h3 className="timeline-title">{item.title}</h3>
                                    <p className="timeline-description">{item.description}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section section">
                <div className="container">
                    <motion.div
                        className="cta-content"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="cta-title">Ready to Make an Impact?</h2>
                        <p className="cta-subtitle">
                            Join thousands making a difference with verified recycling
                        </p>
                        <div className="cta-buttons">
                            <Button
                                variant="primary"
                                size="large"
                                icon={<Scan size={24} />}
                                onClick={() => navigate('/classify')}
                            >
                                Start Recycling
                            </Button>
                            <Button
                                variant="ghost"
                                size="large"
                                icon={<MessageCircle size={24} />}
                                onClick={() => navigate('/chat')}
                            >
                                Ask Assistant
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    );
};

export default LandingPage;
