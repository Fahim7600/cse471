import React, { useContext, useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../provider/Authprovider';
import { FaBeer } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";


const Nav = () => {
    const navigate = useNavigate();
    const { user, logout, userInfo, setUserInfo } = useContext(AuthContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // To manage dropdown state

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (user?.id) {
                try {
                    const res = await fetch(`http://localhost:3000/user/${user.id}`, {
                        credentials: 'include'
                    });
                    const data = await res.json();
                    setUserInfo(data);
                } catch (err) {
                    console.error('Failed to load user info:', err);
                }
            }
        };

        fetchUserInfo();
    }, [user]);

    const handleLogout = async () => {
        await logout();
        window.location.href = "/";
    };

    const loggedInLinks = (
        <>
            {/* Profile button */}
            <li>
                <button
                    onClick={() => navigate('/userprofile')}
                    className="px-4 py-2 text-sm text-orange-600 transition-all duration-300 border-2 border-orange-600 rounded-md shadow-lg btn hover:bg-orange-600 hover:text-white"
                >
                    Profile
                </button>
            </li>

            {/* Pets button (only for logged-in users) */}
            <li>
                <NavLink to="/pets" className="px-4 py-2 text-sm text-orange-600 transition-all duration-300 border-2 border-orange-600 rounded-md shadow-lg btn hover:bg-orange-600 hover:text-white">
                    Pets
                </NavLink>
            </li>
            

            {/* Logout */}
            <li>
                <button onClick={handleLogout} className="px-4 py-2 text-sm text-white transition-all duration-300 transform rounded-md shadow-lg btn btn-ghost hover:scale-105 hover:bg-red-600 bg-gradient-to-r from-red-500 via-red-600 to-red-700">
                    Logout
                </button>
            </li>
        </>
    );

    const loggedOutLinks = (
        <>
            <li><NavLink to="/login" className="px-4 py-2 text-sm text-orange-600 transition-all duration-300 border-2 border-orange-600 rounded-md shadow-lg btn hover:bg-orange-600 hover:text-white">Login</NavLink></li>
            <li><NavLink to="/register" className="px-4 py-2 text-sm text-white transition-all duration-300 bg-orange-600 rounded-md shadow-lg btn hover:bg-orange-700">Register</NavLink></li>
        </>
    );

    const menuItems = user ? loggedInLinks : loggedOutLinks;

    return (
        <div className="p-0 m-0">
            <div className="w-full px-8 py-5 navbar bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-2xl border-b border-blue-900/30 backdrop-blur-lg">
                <div className="navbar-start">
                    <Link
                        onClick={(e) => {
                            e.preventDefault();
                            if (user) {
                                if (userInfo?.role === 'admin') {
                                    navigate('/admin-home');
                                } else {
                                    navigate('/user-home');
                                }
                            } else {
                                navigate('/');
                            }
                        }}
                        className="text-3xl font-bold text-white normal-case btn btn-ghost hover:bg-blue-600/50 rounded-2xl transition-all duration-300 transform hover:scale-105"
                        to="#"
                    >
                        <span className="text-white drop-shadow-lg">
                            PetSphere
                        </span>
                        <span className="ml-2 animate-pulse">🐾</span>
                    </Link>
                </div>

                {/* Removed all buttons from the middle section (navbar-center) */}
                <div className="hidden navbar-center lg:flex">
                    {/* No buttons should be visible here at any point */}
                </div>

                {/* Added responsive behavior for collapsing buttons on smaller screens */}
                <div className="hidden space-x-3 navbar-end lg:flex">
                    {/* Show Login and Register buttons only when the user is logged out */}
                    {!user && (
                        <>
                            <NavLink to="/login" className="px-6 py-3 text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/20 hover:text-white hover:border-white/30 transition-all duration-300 transform hover:scale-105">
                                Login
                            </NavLink>
                            <NavLink to="/register" className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                                Register
                            </NavLink>
                        </>
                    )}

                    {/* Show Profile, Pets, Logout buttons only when the user is logged in */}
                    {user && userInfo?.role === 'admin' && (
                        <>
                            <NavLink to="/userprofile" className="px-5 py-2.5 text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/20 hover:text-white hover:border-white/30 transition-all duration-300 transform hover:scale-105">
                                Profile
                            </NavLink>
                            <button onClick={handleLogout} className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                                Logout
                            </button>
                        </>
                    )}
                    {user && userInfo?.role !== 'admin' && (
                        <>
                            <NavLink to="/userprofile" className="px-5 py-2.5 text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/20 hover:text-white hover:border-white/30 transition-all duration-300 transform hover:scale-105">
                                Profile
                            </NavLink>
                            <NavLink to="/pets" className="px-5 py-2.5 text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/20 hover:text-white hover:border-white/30 transition-all duration-300 transform hover:scale-105">
                                Pets
                            </NavLink>
                            <NavLink to="/chats" className="px-5 py-2.5 text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/20 hover:text-white hover:border-white/30 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>Chats</span>
                            </NavLink>
                            <NavLink to="/adoption" className="px-5 py-2.5 text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/20 hover:text-white hover:border-white/30 transition-all duration-300 transform hover:scale-105">
                                Adoption List
                            </NavLink>
                            <NavLink to="/lostorfound" className="px-5 py-2.5 text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/20 hover:text-white hover:border-white/30 transition-all duration-300 transform hover:scale-105">
                                Lost & Found
                            </NavLink>
                            <NavLink to="/notification" className="px-4 py-2.5 text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-white/20 hover:text-white hover:border-white/30 transition-all duration-300 transform hover:scale-105 flex items-center">
                                <IoIosNotifications className="w-5 h-5" />
                            </NavLink>
                            <button onClick={handleLogout} className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                                Logout
                            </button>
                        </>
                    )}
                </div>                {/* Dropdown menu for smaller screens */}
                <div className="navbar-end lg:hidden">
                    <div className="dropdown">
                        <label tabIndex={0} className="p-3 text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl btn btn-ghost hover:bg-white/20 transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </label>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-4 shadow-2xl bg-white/95 backdrop-blur-md border border-white/30 rounded-3xl w-64">
                            {!user && (
                                <>
                                    <li><NavLink to="/login" className="px-4 py-3 mb-2 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300">Login</NavLink></li>
                                    <li><NavLink to="/register" className="px-4 py-3 mb-2 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300">Register</NavLink></li>
                                </>
                            )}
                            {user && userInfo?.role === 'admin' && (
                                <>
                                    <li><NavLink to="/userprofile" className="px-4 py-3 mb-2 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300">Profile</NavLink></li>
                                    <li><button onClick={handleLogout} className="px-4 py-3 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300">Logout</button></li>
                                </>
                            )}
                            {user && userInfo?.role !== 'admin' && (
                                <>
                                    <li><NavLink to="/userprofile" className="px-4 py-3 mb-2 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300">Profile</NavLink></li>
                                    <li><NavLink to="/pets" className="px-4 py-3 mb-2 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300">Pets</NavLink></li>
                                    <li><NavLink to="/chats" className="px-4 py-3 mb-2 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300 flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>Chats</span>
                                    </NavLink></li>
                                    <li><NavLink to="/adoption" className="px-4 py-3 mb-2 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300">Adoption List</NavLink></li>
                                    <li><NavLink to="/lostorfound" className="px-4 py-3 mb-2 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300">Lost or Found</NavLink></li>
                                    <li><NavLink to="/notification" className="px-4 py-3 mb-2 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300 flex items-center space-x-2">
                                        <IoIosNotifications className="w-4 h-4" />
                                        <span>Notifications</span>
                                    </NavLink></li>
                                    <li><button onClick={handleLogout} className="px-4 py-3 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300">Logout</button></li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Nav;

