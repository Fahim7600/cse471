import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaPaw, FaUserPlus, FaChartLine, FaComments, FaHeart, FaMapMarkerAlt, FaCalendarAlt, FaStar } from 'react-icons/fa';
import '../AdminCSS/AdminHome.css';

const AdminHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPets: 0,
        newUsers24h: 0,
        userGrowth: 0,
        activeSessions: 0,
        totalChats: 0,
        lostFoundReports: 0,
        reviewsCount: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('https://cse471-production.up.railway.app/admin/metrics', {
                credentials: 'include',
            });
            const data = await response.json();
            
            setStats({
                totalUsers: data.totalUsers || 0,
                totalPets: data.totalPets || 0,
                newUsers24h: data.newUsers24h || 0,
                newPets24h: data.newPets24h || 0,
                userGrowth: data.newUsers24h > 0 ? ((data.newUsers24h / data.totalUsers) * 100).toFixed(1) : 0,
                activeSessions: data.activeSessions || 0,
                totalChats: data.totalChats || 0,
                newChats24h: data.newChats24h || 0,
                lostFoundReports: data.lostFoundReports || 0,
                newLostFound24h: data.newLostFound24h || 0,
                reviewsCount: data.totalReviews || 0,
                newReviews24h: data.newReviews24h || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };
    return (
        <div className="admin-dashboard relative overflow-hidden">
            {/* ===== DARK SOPHISTICATED PET BACKGROUND ===== */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')"
                }}
            ></div>
            
            {/* Dark overlay for sophisticated look */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80"></div>
            
            {/* Warm accent overlay for the dog-like warmth */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-500/10"></div>
            
            {/* Subtle floating elements for admin dashboard */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 text-4xl animate-pulse text-orange-400 opacity-60">🐾</div>
                <div className="absolute top-40 right-20 text-3xl animate-pulse delay-1000 text-amber-400 opacity-50">⭐</div>
                <div className="absolute top-60 left-1/3 text-4xl animate-pulse delay-500 text-orange-300 opacity-40">💖</div>
                <div className="absolute top-80 right-1/3 text-3xl animate-pulse delay-1500 text-amber-300 opacity-50">🐕</div>
                <div className="absolute top-1/2 left-16 text-4xl animate-pulse delay-2000 text-orange-400 opacity-60">🐱</div>
                <div className="absolute bottom-40 left-20 text-3xl animate-pulse delay-3000 text-amber-400 opacity-50">⭐</div>
            </div>
            {/* ===== END DARK SOPHISTICATED PET BACKGROUND ===== */}

            <div className="admin-container relative z-10">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="welcome-card">
                        <div className="admin-badge">
                            <div className="admin-avatar">A</div>
                            <span className="text-white">Admin Dashboard</span>
                        </div>
                        <div className="date-display text-white">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Left Column - Metrics Grid */}
                    <div className="metrics-section">
                        <h3 className="text-2xl font-bold text-white mb-6">System Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="stat-card bg-slate-800 border border-slate-700 shadow-lg">
                                <div className="stat-icon text-blue-400">
                                    <FaUsers />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-title text-slate-200">Total Users</div>
                                    <div className="stat-value text-white">{stats.totalUsers}</div>
                                    <div className="stat-change text-green-400">
                                        <FaUserPlus className="mr-1" />
                                        +{stats.newUsers24h} new today
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card bg-slate-800 border border-slate-700 shadow-lg">
                                <div className="stat-icon text-green-400">
                                    <FaPaw />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-title text-slate-200">Total Pets</div>
                                    <div className="stat-value text-white">{stats.totalPets}</div>
                                    <div className="stat-change text-green-400">
                                        <FaUserPlus className="mr-1" />
                                        +{stats.newPets24h || 0} added today
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card bg-slate-800 border border-slate-700 shadow-lg">
                                <div className="stat-icon text-purple-400">
                                    <FaChartLine />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-title text-slate-200">User Growth</div>
                                    <div className="stat-value text-white">{stats.userGrowth}%</div>
                                    <div className="stat-change text-green-400">
                                        Last 24 hours
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card bg-slate-800 border border-slate-700 shadow-lg">
                                <div className="stat-icon text-orange-400">
                                    <FaHeart />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-title text-slate-200">Total Reviews</div>
                                    <div className="stat-value text-white">{stats.reviewsCount}</div>
                                    <div className="stat-change text-green-400">
                                        <FaUserPlus className="mr-1" />
                                        +{stats.newReviews24h || 0} added today
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card bg-slate-800 border border-slate-700 shadow-lg">
                                <div className="stat-icon text-blue-400">
                                    <FaComments />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-title text-slate-200">Total Chats</div>
                                    <div className="stat-value text-white">{stats.totalChats}</div>
                                    <div className="stat-change text-green-400">
                                        <FaUserPlus className="mr-1" />
                                        +{stats.newChats24h || 0} started today
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card bg-slate-800 border border-slate-700 shadow-lg">
                                <div className="stat-icon text-purple-400">
                                    <FaMapMarkerAlt />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-title text-slate-200">Lost/Found Reports</div>
                                    <div className="stat-value text-white">{stats.lostFoundReports}</div>
                                    <div className="stat-change text-green-400">
                                        <FaUserPlus className="mr-1" />
                                        +{stats.newLostFound24h || 0} added today
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Quick Actions Grid */}
                    <div className="actions-section">
                        <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="action-card bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors shadow-lg" onClick={() => navigate('/users')}>
                                <FaUsers className="action-icon text-blue-400" />
                                <span className="text-slate-200">Manage Users</span>
                            </div>
                            <div className="action-card bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors shadow-lg" onClick={() => navigate('/admin/reviews')}>
                                <FaStar className="action-icon text-blue-400" />
                                <span className="text-slate-200">Manage Reviews</span>
                            </div>
                            <div className="action-card bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors shadow-lg" onClick={() => navigate('/adoption')}>
                                <FaHeart className="action-icon text-blue-400" />
                                <span className="text-slate-200">View Adoption List</span>
                            </div>
                            <div className="action-card bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors shadow-lg" onClick={() => navigate('/lostorfound')}>
                                <FaMapMarkerAlt className="action-icon text-blue-400" />
                                <span className="text-slate-200">View Lost & Found List</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
