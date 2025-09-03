import React, { useEffect, useState } from 'react';
import { AuthContext } from '../../provider/Authprovider';
import { IoIosNotifications } from "react-icons/io";
import { FaCheck, FaTrash, FaCalendarAlt, FaSyringe } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'vaccination', 'appointment'

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://cse471-production.up.railway.app/api/notifications', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            setNotifications(data);
        } catch (err) {
            setError('Failed to fetch notifications');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`https://cse471-production.up.railway.app/api/notifications/${notificationId}`, {
                method: 'PATCH',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }

            setNotifications(notifications.filter((notification) => notification._id !== notificationId));
        } catch (err) {
            setError('Failed to mark notification as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`https://cse471-production.up.railway.app/api/notifications/${notificationId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }

            setNotifications(notifications.filter((notification) => notification._id !== notificationId));
        } catch (err) {
            setError('Failed to delete notification');
        }
    };
// naimut start
    const getNotificationType = (message, type) => {
        if (type === 'alert') return 'alert';
        if (message.toLowerCase().includes('vaccination')) return 'vaccination';
        if (message.toLowerCase().includes('appointment')) return 'appointment';
        return 'other';
    };

    const getNotificationIcon = (notificationType) => {
        switch (notificationType) {
            case 'alert':
                return '🚨';
            case 'vaccination':
                return <FaSyringe className="text-white text-lg" />;
            case 'appointment':
                return <FaCalendarAlt className="text-white text-lg" />;
            default:
                return <IoIosNotifications className="text-white text-lg" />;
        }
    };

    const getNotificationColor = (notificationType) => {
        switch (notificationType) {
            case 'alert':
                return 'bg-gradient-to-br from-red-500 to-red-600';
            case 'vaccination':
                return 'bg-gradient-to-br from-blue-500 to-blue-600';
            case 'appointment':
                return 'bg-gradient-to-br from-purple-500 to-purple-600';
            default:
                return 'bg-gradient-to-br from-gray-500 to-gray-600';
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'all') return !notification.isRead;
        return !notification.isRead && getNotificationType(notification.message, notification.type) === activeTab;
    });
// naimur end

    if (error) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">
                {error}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <div className="max-w-4xl px-4 mx-auto">
                {/* Header Section */}
                <div className="p-8 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="flex items-center gap-3 text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                <IoIosNotifications className="text-white text-xl" />
                            </div>
                            Notifications
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100/70 backdrop-blur-sm rounded-full border border-blue-200">
                                {notifications.filter(n => !n.isRead).length} new
                            </span>
                        </div>
                    </div>
                    {/* alvee end */}

                    {/* naimur start Filter Tabs */}
                    <div className="flex gap-1 p-1 bg-blue-50/50 rounded-xl border border-blue-100">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${
                                activeTab === 'all'
                                    ? 'bg-white text-blue-600 shadow-md border border-blue-200'
                                    : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50/50'
                            }`}
                        >
                            All Notifications
                        </button>
                        <button
                            onClick={() => setActiveTab('alert')}
                            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 rounded-lg transition-all duration-200 ${
                                activeTab === 'alert'
                                    ? 'bg-white text-red-600 shadow-md border border-red-200'
                                    : 'text-red-500 hover:text-red-600 hover:bg-red-50/50'
                            }`}
                        >
                            🚨 Lost Pet Alerts
                        </button>
                        <button
                            onClick={() => setActiveTab('vaccination')}
                            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 rounded-lg transition-all duration-200 ${
                                activeTab === 'vaccination'
                                    ? 'bg-white text-blue-600 shadow-md border border-blue-200'
                                    : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50/50'
                            }`}
                        >
                            <FaSyringe /> 
                            Vaccinations
                        </button>
                        <button
                            onClick={() => setActiveTab('appointment')}
                            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 rounded-lg transition-all duration-200 ${
                                activeTab === 'appointment'
                                    ? 'bg-white text-blue-600 shadow-md border border-blue-200'
                                    : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50/50'
                            }`}
                        >
                            <FaCalendarAlt />
                            Appointments
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="py-16 text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100">
                        <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <IoIosNotifications className="text-4xl text-blue-400" />
                        </div>
                        <p className="text-lg text-blue-600/80 font-medium">No notifications available</p>
                        <p className="text-sm text-blue-500/60 mt-2">You're all caught up!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="space-y-4">
                            {filteredNotifications.map((notification) => (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="group overflow-hidden bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`p-3 rounded-xl shadow-md ${getNotificationColor(getNotificationType(notification.message, notification.type))}`}>
                                                    {getNotificationIcon(getNotificationType(notification.message, notification.type))}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-lg font-semibold mb-2 leading-relaxed ${
                                                        getNotificationType(notification.message, notification.type) === 'alert' 
                                                            ? 'text-red-800' 
                                                            : 'text-gray-800'
                                                    }`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-blue-600/70">
                                                        <FaCalendarAlt className="text-blue-400" />
                                                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="p-3 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all duration-200 hover:scale-105 border border-emerald-200"
                                                    title="Mark as read"
                                                >
                                                    <FaCheck className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => deleteNotification(notification._id)}
                                                    className="p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 hover:scale-105 border border-red-200"
                                                    title="Delete notification"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default Notification;
