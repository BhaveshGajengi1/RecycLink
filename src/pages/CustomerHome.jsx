import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Home as HomeIcon,
    Package,
    Calendar,
    Award,
    TrendingUp,
    LogOut,
    User,
    ChevronRight,
    Clock,
    MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import MintBadge from '../components/MintBadge';
import { pageTransition } from '../utils/animations';
import './CustomerHome.css';

const CustomerHome = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [recentPickups, setRecentPickups] = useState([]);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showMintModal, setShowMintModal] = useState(false);

    useEffect(() => {
        loadRecentPickups();
    }, [user]);

    const loadRecentPickups = () => {
        const pickups = JSON.parse(localStorage.getItem('recyclink_pickups') || '[]');
        const userPickups = pickups
            .filter(p => p.customerId === user?.userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        setRecentPickups(userPickups);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return '#3b82f6';
            case 'in-progress': return '#f59e0b';
            case 'completed': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'scheduled': return 'Scheduled';
            case 'in-progress': return 'In Progress';
            case 'completed': return 'Completed';
            default: return status;
        }
    };

    return (
        <motion.div className="customer-home-page" {...pageTransition}>
            <div className="container">
                {/* Header with Profile */}
                <div className="home-header">
                    <div className="header-content">
                        <h1 className="page-title">Welcome, {user?.name}!</h1>
                        <p className="page-subtitle">Manage your recycling journey</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="profile-button"
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            <User size={20} />
                            <span>Profile</span>
                        </button>
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
                                    <p className="profile-role">Customer</p>
                                </div>
                            </div>
                            <div className="profile-stats">
                                <div className="stat-item">
                                    <Award size={20} />
                                    <span>{user?.rewards || 0} points</span>
                                </div>
                                <div className="stat-item">
                                    <Package size={20} />
                                    <span>{recentPickups.filter(p => p.status === 'completed').length} pickups</span>
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

                {/* Quick Actions */}
                <div className="quick-actions-grid">
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
                        onClick={() => navigate('/rewards')}
                    >
                        <Award size={32} />
                        <h3>My Rewards</h3>
                        <p>View dashboard</p>
                    </Card>
                    <Card
                        className="action-card"
                        onClick={() => navigate('/dashboard')}
                    >
                        <HomeIcon size={32} />
                        <h3>Impact Dashboard</h3>
                        <p>See your impact</p>
                    </Card>
                    <Card
                        className="action-card mint-card"
                        onClick={() => setShowMintModal(true)}
                    >
                        <Award size={32} />
                        <h3>Mint NFT Badge</h3>
                        <p>Claim on-chain proof</p>
                    </Card>
                </div>

                {/* Recent Pickups */}
                <div className="recent-pickups-section">
                    <h2 className="section-title">Recent Pickups</h2>
                    {recentPickups.length === 0 ? (
                        <Card className="empty-state">
                            <Package size={48} />
                            <p>No pickups scheduled yet</p>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/schedule')}
                            >
                                Schedule Your First Pickup
                            </Button>
                        </Card>
                    ) : (
                        <div className="pickups-list">
                            {recentPickups.map((pickup) => (
                                <motion.div
                                    key={pickup.pickupId}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Card
                                        className="pickup-card"
                                        onClick={() => setSelectedPickup(pickup)}
                                    >
                                        <div className="pickup-header">
                                            <div className="pickup-id">
                                                <Package size={20} />
                                                <span>#{pickup.pickupId.slice(0, 8)}</span>
                                            </div>
                                            <div
                                                className="pickup-status"
                                                style={{ backgroundColor: getStatusColor(pickup.status) }}
                                            >
                                                {getStatusLabel(pickup.status)}
                                            </div>
                                        </div>
                                        <div className="pickup-details">
                                            <div className="detail-row">
                                                <Calendar size={16} />
                                                <span>{new Date(pickup.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="detail-row">
                                                <Clock size={16} />
                                                <span>{pickup.timeSlot}</span>
                                            </div>
                                            <div className="detail-row">
                                                <MapPin size={16} />
                                                <span>{pickup.address}</span>
                                            </div>
                                        </div>
                                        <div className="pickup-footer">
                                            <span className="view-details">View Details</span>
                                            <ChevronRight size={20} />
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Pickup Details Modal */}
            {selectedPickup && (
                <div className="modal-overlay" onClick={() => setSelectedPickup(null)}>
                    <motion.div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <Card className="pickup-details-card">
                            <h2>Pickup Details</h2>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Pickup ID</label>
                                    <p>{selectedPickup.pickupId}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Status</label>
                                    <p style={{ color: getStatusColor(selectedPickup.status) }}>
                                        {getStatusLabel(selectedPickup.status)}
                                    </p>
                                </div>
                                <div className="detail-item">
                                    <label>Date</label>
                                    <p>{new Date(selectedPickup.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Time Slot</label>
                                    <p>{selectedPickup.timeSlot}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Address</label>
                                    <p>{selectedPickup.address}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Items</label>
                                    <p>{selectedPickup.items || 'Not specified'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Verification Code</label>
                                    <p className="verification-code">{selectedPickup.verificationCode}</p>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => setSelectedPickup(null)}
                                fullWidth
                            >
                                Close
                            </Button>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Mint Badge Modal */}
            {showMintModal && (
                <MintBadge
                    user={user}
                    onClose={() => setShowMintModal(false)}
                    onSuccess={() => {
                        setShowMintModal(false);
                        loadRecentPickups();
                    }}
                />
            )}
        </motion.div>
    );
};

export default CustomerHome;
