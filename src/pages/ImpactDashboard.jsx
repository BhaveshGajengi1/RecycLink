import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Award, Leaf, Droplet, Zap } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';
import './ImpactDashboard.css';

const ImpactDashboard = () => {
    const navigate = useNavigate();
    const [animatedStats, setAnimatedStats] = useState({
        totalItems: 0,
        co2Saved: 0,
        waterSaved: 0,
        treesEquivalent: 0,
    });

    // Mock data
    const targetStats = {
        totalItems: 47,
        co2Saved: 125.5,
        waterSaved: 890,
        treesEquivalent: 6,
    };

    const badges = [
        {
            id: 1,
            name: 'Eco Starter',
            icon: '🌱',
            earned: true,
            date: '2026-01-15',
            description: 'First recycling action',
        },
        {
            id: 2,
            name: 'Green Warrior',
            icon: '♻️',
            earned: true,
            date: '2026-01-20',
            description: '10+ items recycled',
        },
        {
            id: 3,
            name: 'Sustainability Champion',
            icon: '🏆',
            earned: false,
            description: 'Recycle 50 items',
            progress: 94,
        },
        {
            id: 4,
            name: 'Planet Hero',
            icon: '🌍',
            earned: false,
            description: 'Recycle 100 items',
            progress: 47,
        },
    ];

    const recentActivity = [
        { date: '2026-01-28', items: 5, category: 'Plastic', co2: 12.5 },
        { date: '2026-01-25', items: 8, category: 'Paper', co2: 9.6 },
        { date: '2026-01-22', items: 3, category: 'Glass', co2: 2.4 },
        { date: '2026-01-20', items: 6, category: 'Metal', co2: 10.8 },
    ];

    // Animate counters
    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setAnimatedStats({
                totalItems: Math.floor(targetStats.totalItems * progress),
                co2Saved: (targetStats.co2Saved * progress).toFixed(1),
                waterSaved: Math.floor(targetStats.waterSaved * progress),
                treesEquivalent: Math.floor(targetStats.treesEquivalent * progress),
            });

            if (currentStep >= steps) {
                clearInterval(interval);
                setAnimatedStats(targetStats);
            }
        }, stepDuration);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div className="impact-dashboard-page" {...pageTransition}>
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft size={20} />}
                        onClick={() => navigate('/home')}
                    >
                        Back
                    </Button>
                    <h1 className="page-title">Impact Dashboard</h1>
                </div>

                {/* Stats Grid */}
                <motion.div
                    className="stats-grid"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div variants={staggerItem}>
                        <Card className="stat-card">
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
                                <TrendingUp size={32} />
                            </div>
                            <div className="stat-value">{animatedStats.totalItems}</div>
                            <div className="stat-label">Items Recycled</div>
                        </Card>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <Card className="stat-card">
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                <Leaf size={32} />
                            </div>
                            <div className="stat-value">{animatedStats.co2Saved} kg</div>
                            <div className="stat-label">CO₂ Saved</div>
                        </Card>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <Card className="stat-card">
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #14b8a6, #06b6d4)' }}>
                                <Droplet size={32} />
                            </div>
                            <div className="stat-value">{animatedStats.waterSaved} L</div>
                            <div className="stat-label">Water Saved</div>
                        </Card>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <Card className="stat-card">
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}>
                                <Zap size={32} />
                            </div>
                            <div className="stat-value">{animatedStats.treesEquivalent}</div>
                            <div className="stat-label">Trees Equivalent</div>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Badges Section */}
                <section className="badges-section">
                    <h2 className="section-title">
                        <Award size={28} />
                        Your Badges
                    </h2>

                    <div className="badges-grid">
                        {badges.map((badge, index) => (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}>
                                    <div className="badge-icon-large">
                                        {badge.earned ? badge.icon : '🔒'}
                                    </div>
                                    <h3 className="badge-name">{badge.name}</h3>
                                    <p className="badge-description">{badge.description}</p>

                                    {badge.earned ? (
                                        <div className="badge-date">
                                            Earned: {new Date(badge.date).toLocaleDateString()}
                                        </div>
                                    ) : (
                                        <div className="badge-progress">
                                            <div className="progress-bar-small">
                                                <motion.div
                                                    className="progress-fill-small"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${badge.progress}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                />
                                            </div>
                                            <div className="progress-text-small">{badge.progress}%</div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="activity-section">
                    <h2 className="section-title">Recent Activity</h2>

                    <Card className="activity-card">
                        <div className="activity-list">
                            {recentActivity.map((activity, index) => (
                                <motion.div
                                    key={index}
                                    className="activity-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="activity-date">
                                        {new Date(activity.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </div>
                                    <div className="activity-details">
                                        <div className="activity-category">{activity.category}</div>
                                        <div className="activity-items">{activity.items} items</div>
                                    </div>
                                    <div className="activity-impact">
                                        <Leaf size={16} />
                                        {activity.co2} kg CO₂
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </section>

                {/* CTA */}
                <motion.div
                    className="dashboard-cta"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Button
                        variant="primary"
                        size="large"
                        onClick={() => navigate('/classify')}
                    >
                        Recycle More Items
                    </Button>
                    <Button
                        variant="secondary"
                        size="large"
                        onClick={() => navigate('/schedule')}
                    >
                        Schedule Pickup
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ImpactDashboard;
