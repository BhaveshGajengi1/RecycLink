import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Award,
    Target,
    Star,
    ArrowLeft,
    Package,
    Clock,
    CheckCircle,
    Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { pageTransition } from '../utils/animations';
import './AgentPerformance.css';

const AgentPerformance = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalPickups: 0,
        completedPickups: 0,
        rating: 4.8,
        completionRate: 0,
        avgResponseTime: '15 min',
        thisMonthPickups: 0,
        lastMonthPickups: 0
    });
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        loadPerformanceData();
    }, [user]);

    const loadPerformanceData = () => {
        const pickups = JSON.parse(localStorage.getItem('recyclink_pickups') || '[]');
        const agentPickups = pickups.filter(p => p.agentId === user?.userId);
        const completed = agentPickups.filter(p => p.status === 'completed');

        // Calculate completion rate
        const completionRate = agentPickups.length > 0
            ? Math.round((completed.length / agentPickups.length) * 100)
            : 0;

        // Calculate this month and last month pickups
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const thisMonthPickups = completed.filter(p =>
            new Date(p.completedAt) >= thisMonthStart
        ).length;

        const lastMonthPickups = completed.filter(p => {
            const date = new Date(p.completedAt);
            return date >= lastMonthStart && date <= lastMonthEnd;
        }).length;

        setStats({
            totalPickups: agentPickups.length,
            completedPickups: completed.length,
            rating: 4.8, // Could be calculated from customer ratings
            completionRate,
            avgResponseTime: '15 min',
            thisMonthPickups,
            lastMonthPickups
        });

        // Generate monthly data for the last 6 months
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthPickups = completed.filter(p => {
                const date = new Date(p.completedAt);
                return date >= monthDate && date <= monthEnd;
            }).length;

            months.push({
                month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                pickups: monthPickups
            });
        }
        setMonthlyData(months);
    };

    const getPerformanceLevel = () => {
        if (stats.completedPickups >= 100) return { level: 'Elite', color: '#f59e0b' };
        if (stats.completedPickups >= 50) return { level: 'Expert', color: '#8b5cf6' };
        if (stats.completedPickups >= 20) return { level: 'Professional', color: '#3b82f6' };
        if (stats.completedPickups >= 5) return { level: 'Intermediate', color: '#10b981' };
        return { level: 'Beginner', color: '#6b7280' };
    };

    const performance = getPerformanceLevel();
    const maxPickups = Math.max(...monthlyData.map(m => m.pickups), 1);

    return (
        <motion.div className="agent-performance-page" {...pageTransition}>
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
                    <h1 className="page-title">Performance</h1>
                </div>

                {/* Performance Level */}
                <Card className="performance-level-card">
                    <div className="level-badge" style={{ backgroundColor: performance.color }}>
                        <Award size={32} />
                    </div>
                    <div className="level-content">
                        <h2>Performance Level</h2>
                        <p className="level-name" style={{ color: performance.color }}>
                            {performance.level}
                        </p>
                        <p className="level-description">
                            {stats.completedPickups} completed pickups
                        </p>
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <Card className="stat-card">
                        <div className="stat-icon">
                            <Package size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Pickups</p>
                            <p className="stat-value">{stats.totalPickups}</p>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Completed</p>
                            <p className="stat-value">{stats.completedPickups}</p>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon">
                            <Target size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Completion Rate</p>
                            <p className="stat-value">{stats.completionRate}%</p>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon">
                            <Star size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Rating</p>
                            <p className="stat-value">{stats.rating} ⭐</p>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon">
                            <Clock size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Avg Response</p>
                            <p className="stat-value">{stats.avgResponseTime}</p>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon">
                            <Calendar size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">This Month</p>
                            <p className="stat-value">{stats.thisMonthPickups}</p>
                        </div>
                    </Card>
                </div>

                {/* Monthly Performance Chart */}
                <Card className="chart-card">
                    <h2 className="chart-title">Monthly Performance</h2>
                    <div className="chart-container">
                        {monthlyData.map((data, index) => (
                            <div key={index} className="chart-bar-container">
                                <div className="chart-bar-wrapper">
                                    <motion.div
                                        className="chart-bar"
                                        initial={{ height: 0 }}
                                        animate={{
                                            height: `${(data.pickups / maxPickups) * 100}%`
                                        }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <span className="bar-value">{data.pickups}</span>
                                    </motion.div>
                                </div>
                                <p className="chart-label">{data.month}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Performance Comparison */}
                <Card className="comparison-card">
                    <h2>Month-over-Month Comparison</h2>
                    <div className="comparison-content">
                        <div className="comparison-item">
                            <p className="comparison-label">This Month</p>
                            <p className="comparison-value current">{stats.thisMonthPickups} pickups</p>
                        </div>
                        <div className="comparison-arrow">
                            {stats.thisMonthPickups >= stats.lastMonthPickups ? (
                                <TrendingUp size={32} color="#10b981" />
                            ) : (
                                <TrendingUp size={32} color="#ef4444" style={{ transform: 'rotate(180deg)' }} />
                            )}
                        </div>
                        <div className="comparison-item">
                            <p className="comparison-label">Last Month</p>
                            <p className="comparison-value previous">{stats.lastMonthPickups} pickups</p>
                        </div>
                    </div>
                    {stats.thisMonthPickups > stats.lastMonthPickups && (
                        <p className="comparison-message success">
                            Great job! You're {stats.thisMonthPickups - stats.lastMonthPickups} pickups ahead of last month! 🎉
                        </p>
                    )}
                    {stats.thisMonthPickups < stats.lastMonthPickups && (
                        <p className="comparison-message warning">
                            You're {stats.lastMonthPickups - stats.thisMonthPickups} pickups behind last month. Keep going! 💪
                        </p>
                    )}
                    {stats.thisMonthPickups === stats.lastMonthPickups && stats.thisMonthPickups > 0 && (
                        <p className="comparison-message neutral">
                            You're maintaining the same pace as last month. 👍
                        </p>
                    )}
                </Card>
            </div>
        </motion.div>
    );
};

export default AgentPerformance;
