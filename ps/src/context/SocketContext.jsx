import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const newSocket = io('http://localhost:3000', {
            withCredentials: true,
            autoConnect: false
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const connectSocket = () => {
        if (socket && !isConnected) {
            socket.connect();
        }
    };

    const disconnectSocket = () => {
        if (socket && isConnected) {
            socket.disconnect();
        }
    };

    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
            connectSocket,
            disconnectSocket
        }}>
            {children}
        </SocketContext.Provider>
    );
};
