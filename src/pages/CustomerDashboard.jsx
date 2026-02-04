import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Award,
    TrendingUp,
    Package,
    Leaf,
    Calendar,
    Trophy,
    Target,
    Zap,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { pageTransition } from '../utils/animations';
import { getLeaderboard, getRecyclingStreak } from '../services/rewardsService';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalRewards: 0,
        totalPickups: 0,
        totalItems: 0,
        co2Saved: 0,
        currentStreak: 0
    });
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, [user]);

    const loadDashboardData = () => {
        if (!user) return;

        // Get user's pickups
        const pickups = JSON.parse(localStorage.getItem('recyclink_pickups') || '[]');
        const userPickups = pickups.filter(p => p.customerId === user.userId);
        const completedPickups = userPickups.filter(p => p.status === 'completed');

        // Calculate streak
        const streak = getRecyclingStreak(user.userId);

        // Get leaderboard
        const topUsers = getLeaderboard('customer', 10);
        setLeaderboard(topUsers);

        // Find user's rank
        const rank = topUsers.findIndex(u => u.name === user.name) + 1;
        setUserRank(rank || null);

        setStats({
            totalRewards: user.rewards || 0,
            totalPickups: completedPickups.length,
            totalItems: user.stats?.totalItems || 0,
            co2Saved: user.stats?.totalCO2Saved || 0,
            currentStreak: streak
        });
    };

    return (
        <motion.div className="customer-dashboard-page" {...pageTransition}>
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <Button
                            variant="ghost"
                            icon={<ArrowLeft size={20} />}
                            onClick={() => navigate('/home')}
                        >
                            Back
                        </Button>
                        <h1 className="page-title">My Rewards</h1>
                        <p className="page-subtitle">Welcome back, {user?.name}!</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/scan')}
                    >
                        Classify Waste
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <Card className="stat-card highlight">
                        <div className="stat-icon rewards">
                            <Award size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Rewards</p>
                            <p className="stat-value">{stats.totalRewards} pts</p>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon pickups">
                            <Package size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Completed Pickups</p>
                            <p className="stat-value">{stats.totalPickups}</p>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon items">
                            <TrendingUp size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Items Recycled</p>
                            <p className="stat-value">{stats.totalItems}</p>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon co2">
                            <Leaf size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">CO₂ Saved</p>
                            <p className="stat-value">{stats.co2Saved.toFixed(1)} kg</p>
                        </div>
                    </Card>
                </div>

                {/* Streak & Rank */}
                <div className="achievements-grid">
                    <Card className="achievement-card">
                        <div className="achievement-icon streak">
                            <Zap size={40} />
                        </div>
                        <h3>Current Streak</h3>
                        <p className="achievement-value">{stats.currentStreak} days</p>
                        <p className="achievement-hint">
                            {stats.currentStreak >= 7 ? '🔥 On fire! 20% bonus active!' : 'Recycle 7 days in a row for bonus!'}
                        </p>
                    </Card>

                    <Card className="achievement-card">
                        <div className="achievement-icon rank">
                            <Trophy size={40} />
                        </div>
                        <h3>Your Rank</h3>
                        <p className="achievement-value">
                            {userRank ? `#${userRank}` : 'Unranked'}
                        </p>
                        <p className="achievement-hint">
                            {userRank ? 'Keep recycling to climb!' : 'Start recycling to get ranked!'}
                        </p>
                    </Card>
                </div>

                {/* Leaderboard */}
                <div className="leaderboard-section">
                    <h2 className="section-title">🏆 Top Recyclers</h2>
                    <Card className="leaderboard-card">
                        {leaderboard.length === 0 ? (
                            <div className="empty-state">
                                <Trophy size={48} />
                                <p>No rankings yet</p>
                                <p className="empty-subtitle">Be the first to recycle!</p>
                            </div>
                        ) : (
                            <div className="leaderboard-list">
                                {leaderboard.map((entry, index) => (
                                    <div
                                        key={index}
                                        className={`leaderboard-item ${entry.name === user?.name ? 'current-user' : ''}`}
                                    >
                                        <div className="rank-badge">
                                            {index === 0 && '🥇'}
                                            {index === 1 && '🥈'}
                                            {index === 2 && '🥉'}
                                            {index > 2 && `#${index + 1}`}
                                        </div>
                                        <div className="user-info">
                                            <p className="user-name">{entry.name}</p>
                                            <p className="user-stats">
                                                {entry.stats?.totalItems || 0} items recycled
                                            </p>
                                        </div>
                                        <div className="user-rewards">
                                            <Award size={20} />
                                            <span>{entry.rewards} pts</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="actions-grid">
                        <Card
                            className="action-card"
                            onClick={() => navigate('/scan')}
                        >
                            <TrendingUp size={32} />
                            <h3>Classify Waste</h3>
                            <p>Scan and identify waste</p>
                        </Card>
                        <Card
                            className="action-card"
                            onClick={() => navigate('/schedule')}
                        >
                            <Calendar size={32} />
                            <h3>Schedule Pickup</h3>
                            <p>Book a collection</p>
                        </Card>
                        <Card
                            className="action-card"
                            onClick={() => navigate('/dashboard')}
                        >
                            <Target size={32} />
                            <h3>View Impact</h3>
                            <p>See your environmental impact</p>
                        </Card>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CustomerDashboard;
