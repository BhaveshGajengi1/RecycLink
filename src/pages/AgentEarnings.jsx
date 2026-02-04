import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign,
    TrendingUp,
    Calendar,
    Award,
    ArrowLeft,
    Package,
    CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { pageTransition } from '../utils/animations';
import './AgentEarnings.css';

const AgentEarnings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [earnings, setEarnings] = useState({
        total: 0,
        thisMonth: 0,
        thisWeek: 0,
        today: 0
    });
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        loadEarningsData();
    }, [user]);

    const loadEarningsData = () => {
        const pickups = JSON.parse(localStorage.getItem('recyclink_pickups') || '[]');
        const agentPickups = pickups.filter(p =>
            p.agentId === user?.userId && p.status === 'completed'
        );

        // Calculate earnings (50 points per completed pickup)
        const total = agentPickups.length * 50;

        // Calculate time-based earnings
        const now = new Date();
        const today = now.toDateString();
        const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayEarnings = agentPickups.filter(p =>
            new Date(p.completedAt).toDateString() === today
        ).length * 50;

        const thisWeekEarnings = agentPickups.filter(p =>
            new Date(p.completedAt) >= thisWeekStart
        ).length * 50;

        const thisMonthEarnings = agentPickups.filter(p =>
            new Date(p.completedAt) >= thisMonthStart
        ).length * 50;

        setEarnings({
            total,
            thisMonth: thisMonthEarnings,
            thisWeek: thisWeekEarnings,
            today: todayEarnings
        });

        // Create transaction history
        const txHistory = agentPickups
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, 20)
            .map(pickup => ({
                id: pickup.pickupId,
                date: pickup.completedAt,
                amount: 50,
                description: `Pickup #${pickup.pickupId.slice(0, 8)}`,
                address: pickup.address
            }));

        setTransactions(txHistory);
    };

    return (
        <motion.div className="agent-earnings-page" {...pageTransition}>
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft size={20} />}
                        onClick={() => navigate('/agent/dashboard')}
                    >
                        Back
                    </Button>
                    <h1 className="page-title">My Earnings</h1>
                </div>

                {/* Earnings Summary */}
                <div className="earnings-grid">
                    <Card className="earnings-card total">
                        <div className="earnings-icon">
                            <DollarSign size={32} />
                        </div>
                        <div className="earnings-content">
                            <p className="earnings-label">Total Earnings</p>
                            <p className="earnings-value">{earnings.total} pts</p>
                        </div>
                    </Card>

                    <Card className="earnings-card month">
                        <div className="earnings-icon">
                            <Calendar size={32} />
                        </div>
                        <div className="earnings-content">
                            <p className="earnings-label">This Month</p>
                            <p className="earnings-value">{earnings.thisMonth} pts</p>
                        </div>
                    </Card>

                    <Card className="earnings-card week">
                        <div className="earnings-icon">
                            <TrendingUp size={32} />
                        </div>
                        <div className="earnings-content">
                            <p className="earnings-label">This Week</p>
                            <p className="earnings-value">{earnings.thisWeek} pts</p>
                        </div>
                    </Card>

                    <Card className="earnings-card today">
                        <div className="earnings-icon">
                            <Award size={32} />
                        </div>
                        <div className="earnings-content">
                            <p className="earnings-label">Today</p>
                            <p className="earnings-value">{earnings.today} pts</p>
                        </div>
                    </Card>
                </div>

                {/* Transaction History */}
                <div className="transactions-section">
                    <h2 className="section-title">Transaction History</h2>
                    {transactions.length === 0 ? (
                        <Card className="empty-state">
                            <Package size={48} />
                            <p>No completed pickups yet</p>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/agent/dashboard')}
                            >
                                View Available Pickups
                            </Button>
                        </Card>
                    ) : (
                        <div className="transactions-list">
                            {transactions.map((tx) => (
                                <motion.div
                                    key={tx.id}
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <Card className="transaction-card">
                                        <div className="transaction-icon">
                                            <CheckCircle size={24} />
                                        </div>
                                        <div className="transaction-details">
                                            <p className="transaction-description">{tx.description}</p>
                                            <p className="transaction-address">{tx.address}</p>
                                            <p className="transaction-date">
                                                {new Date(tx.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="transaction-amount">
                                            +{tx.amount} pts
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AgentEarnings;
