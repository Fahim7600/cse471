// Users Component - Admin Panel for User Management

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../provider/Authprovider';
import { useNavigate } from 'react-router-dom';

const Users = () => {
    // State management for users list, loading state, error handling, and search
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userInfo } = useContext(AuthContext);
    const navigate = useNavigate();

    // Check admin access on component mount
    useEffect(() => {
        // Redirect non-admin users to home page
        if (!userInfo || userInfo.role !== 'admin') {
            navigate('/');
            return;
        }

        fetchUsers();
    }, [userInfo, navigate]);

    // Filter users based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [users, searchTerm]);

    // Fetch all users from the backend
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/users', {
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data); // Initialize filtered users
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
            // Show error message to user
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle ban/unban user action
    const handleBanUser = async (userId, isBanned) => {
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}/ban`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ banned: !isBanned })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user status');
            }

            // Refresh the users list after successful ban/unban
            await fetchUsers();
        } catch (err) {
            console.error('Error banning user:', err);
            setError(err.message);
            // Show error message to user
            alert(err.message);
        }
    };

    // Loading state UI
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
                <div className="flex justify-center items-center h-[80vh]">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-blue-600 text-lg font-medium">Loading users...</div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state UI
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
                <div className="flex justify-center items-center h-[80vh]">
                    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-xl max-w-md w-full text-center">
                        <div className="text-red-500 text-4xl mb-2">⚠️</div>
                        <div className="text-red-600 text-lg font-medium mb-1">Error Loading Users</div>
                        <div className="text-gray-600">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    // Main users table UI
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Registered Users</h1>
                        <div className="text-sm text-gray-600">
                            Total: {users.length} | Showing: {filteredUsers.length}
                        </div>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {searchTerm && (
                            <div className="mt-2 text-sm text-gray-600">
                                {filteredUsers.length === 0 
                                    ? `No users found matching "${searchTerm}"` 
                                    : `Found ${filteredUsers.length} user(s) matching "${searchTerm}"`
                                }
                            </div>
                        )}
                    </div>
                    
                    {/* Users table with columns for name, email, role, status, and actions */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden table-fixed">
                            <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                <tr>
                                    <th className="w-1/4 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Name</th>
                                    <th className="w-1/3 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Email</th>
                                    <th className="w-1/6 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Role</th>
                                    <th className="w-1/6 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="w-1/6 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            {searchTerm 
                                                ? `No users found matching "${searchTerm}"` 
                                                : 'No users found'
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                                        {/* User name cell */}
                                        <td className="w-1/4 px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                                        </td>
                                        {/* User email cell */}
                                        <td className="w-1/3 px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 truncate">{user.email}</div>
                                        </td>
                                        {/* User role cell with role-specific styling */}
                                        <td className="w-1/6 px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.role === 'admin' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        {/* User status cell with ban status styling */}
                                        <td className="w-1/6 px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.banned 
                                                    ? 'bg-red-100 text-red-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {user.banned ? 'Banned' : 'Active'}
                                            </span>
                                        </td>
                                        {/* Actions cell with ban/unban button */}
                                        <td className="w-1/6 px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleBanUser(user._id, user.banned)}
                                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                        user.banned
                                                            ? 'bg-green-500 hover:bg-green-600 text-white'
                                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                                    }`}
                                                >
                                                    {user.banned ? 'Unban' : 'Ban'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users; 