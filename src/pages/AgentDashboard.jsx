import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    TrendingUp,
    MapPin,
    Clock,
    DollarSign,
    Award,
    CheckCircle,
    User,
    LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { pageTransition } from '../utils/animations';
import './AgentDashboard.css';

const AgentDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        todayPickups: 0,
        totalEarnings: 0,
        completedPickups: 0,
        rating: 4.8
    });
    const [availablePickups, setAvailablePickups] = useState([]);
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        // Load agent stats and available pickups
        loadAgentData();
    }, []);

    const loadAgentData = () => {
        // Get pickups from localStorage
        const pickups = JSON.parse(localStorage.getItem('recyclink_pickups') || '[]');

        // Filter available pickups (not assigned or assigned to this agent)
        const available = pickups.filter(p =>
            p.status === 'scheduled' ||
            (p.status === 'in-progress' && p.agentId === user.userId)
        );

        setAvailablePickups(available.slice(0, 5)); // Show top 5

        // Calculate stats
        const completed = pickups.filter(p =>
            p.agentId === user.userId && p.status === 'completed'
        );

        const today = new Date().toDateString();
        const todayCompleted = completed.filter(p =>
            new Date(p.completedAt).toDateString() === today
        );

        setStats({
            todayPickups: todayCompleted.length,
            totalEarnings: user.rewards || 0,
            completedPickups: completed.length,
            rating: 4.8 // Could be calculated from customer ratings
        });
    };

    const handleAcceptPickup = (pickupId) => {
        // Update pickup status
        const pickups = JSON.parse(localStorage.getItem('recyclink_pickups') || '[]');
        const updatedPickups = pickups.map(p => {
            if (p.pickupId === pickupId) {
                return {
                    ...p,
                    agentId: user.userId,
                    status: 'in-progress',
                    acceptedAt: new Date().toISOString()
                };
            }
            return p;
        });
        localStorage.setItem('recyclink_pickups', JSON.stringify(updatedPickups));
        loadAgentData();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.div className="agent-dashboard-page" {...pageTransition}>
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="page-title">Agent Dashboard</h1>
                        <p className="page-subtitle">Welcome back, {user.name}!</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="profile-button"
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            <User size={20} />
                            <span>Profile</span>
                        </button>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/agent/verify')}
                        >
                            Verify Pickup
                        </Button>
                    </div>
                </div>

                {/* Profile Dropdown */}
                {showProfile && (
                    <motion.div
                        className="profile-dropdown"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="profile-card">
                            <div className="profile-info">
                                <div className="profile-avatar">
                                    <User size={32} />
                                </div>
                                <div className="profile-details">
                                    <p className="profile-name">{user?.name}</p>
                                    <p className="profile-email">{user?.email}</p>
                                    <p className="profile-role agent-role">Pickup Agent</p>
                                </div>
                            </div>
                            <div className="profile-stats">
                                <div className="stat-item">
                                    <Award size={20} />
                                    <span>{stats.totalEarnings} points</span>
                                </div>
                                <div className="stat-item">
                                    <Package size={20} />
                                    <span>{stats.completedPickups} pickups</span>
                                </div>
                            </div>
                            <Button
                                variant="danger"
                                icon={<LogOut size={20} />}
                                onClick={handleLogout}
                                fullWidth
                            >
                                Logout
                            </Button>
                        </Card>
                    </motion.div>
                )}

                {/* Stats Grid */}
                <div className="stats-grid">
                    <Card className="stat-card">
                        <div className="stat-icon today">
                            <CheckCircle size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Today's Pickups</p>
                            <p className="stat-value">{stats.todayPickups}</p>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon earnings">
                            <DollarSign size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Earnings</p>
                            <p className="stat-value">{stats.totalEarnings} pts</p>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon completed">
                            <Package size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Completed Pickups</p>
                            <p className="stat-value">{stats.completedPickups}</p>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon rating">
                            <Award size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Rating</p>
                            <p className="stat-value">{stats.rating} ⭐</p>
                        </div>
                    </Card>
                </div>

                {/* Available Pickups */}
                <div className="available-pickups-section">
                    <h2 className="section-title">Available Pickups</h2>

                    {availablePickups.length === 0 ? (
                        <Card className="empty-state">
                            <Package size={48} />
                            <p>No pickups available at the moment</p>
                            <p className="empty-subtitle">Check back later for new pickup requests</p>
                        </Card>
                    ) : (
                        <div className="pickups-list">
                            {availablePickups.map((pickup) => (
                                <Card key={pickup.pickupId} className="pickup-card">
                                    <div className="pickup-header">
                                        <div className="pickup-id">
                                            <Package size={20} />
                                            <span>{pickup.pickupId}</span>
                                        </div>
                                        <div className={`pickup-status ${pickup.status}`}>
                                            {pickup.status === 'in-progress' ? 'In Progress' : 'Available'}
                                        </div>
                                    </div>

                                    <div className="pickup-details">
                                        <div className="detail-row">
                                            <Clock size={18} />
                                            <span>{new Date(pickup.date).toLocaleDateString()} - {pickup.timeSlot}</span>
                                        </div>
                                        <div className="detail-row">
                                            <MapPin size={18} />
                                            <span>{pickup.address}</span>
                                        </div>
                                        <div className="detail-row">
                                            <TrendingUp size={18} />
                                            <span>Reward: 50 points</span>
                                        </div>
                                    </div>

                                    <div className="pickup-actions">
                                        {pickup.status === 'scheduled' ? (
                                            <Button
                                                variant="primary"
                                                onClick={() => handleAcceptPickup(pickup.pickupId)}
                                                fullWidth
                                            >
                                                Accept Pickup
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="secondary"
                                                onClick={() => navigate('/agent/verify')}
                                                fullWidth
                                            >
                                                Complete Pickup
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="actions-grid">
                        <Card
                            className="action-card"
                            onClick={() => navigate('/agent/verify')}
                        >
                            <CheckCircle size={32} />
                            <h3>Verify Pickup</h3>
                            <p>Scan QR or enter code</p>
                        </Card>
                        <Card
                            className="action-card"
                            onClick={() => navigate('/agent/earnings')}
                        >
                            <DollarSign size={32} />
                            <h3>View Earnings</h3>
                            <p>Track your income</p>
                        </Card>
                        <Card
                            className="action-card"
                            onClick={() => navigate('/agent/performance')}
                        >
                            <Award size={32} />
                            <h3>Performance</h3>
                            <p>View your stats</p>
                        </Card>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AgentDashboard;
