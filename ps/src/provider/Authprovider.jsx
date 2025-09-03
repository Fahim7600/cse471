import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

const Authprovider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    // Check session on page load
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('https://cse471-production.up.railway.app/check-session', {
                    credentials: 'include'
                });
                const data = await res.json();

                if (data.loggedIn) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Session check failed:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    // Logout function — calls backend to destroy session
    const logout = async () => {
        try {
            await fetch('https://cse471-production.up.railway.app/logout', {
                method: 'GET',
                credentials: 'include'
            });
            setUser(null);
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const authInfo = {
        user,
        setUser,
        loading,
        logout,
        userInfo,
        setUserInfo
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default Authprovider;
