import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useSnackbar } from 'notistack';

interface SocketContextValue {
    socket: Socket | null;
    connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Only connect if logged in
        if (!user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

        const newSocket = io(serverUrl, {
            withCredentials: true, // Sends HTTP-only cookies with handshake
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        // ── Real-time event listeners ──
        newSocket.on('new_announcement', (announcement: any) => {
            const emoji: Record<string, string> = { urgent: '🔴', important: '🟠', normal: '🔵' };
            enqueueSnackbar(
                `${emoji[announcement.priority] || '📢'} ${announcement.title}`,
                { variant: announcement.priority === 'urgent' ? 'error' : announcement.priority === 'important' ? 'warning' : 'info' }
            );
        });

        newSocket.on('drive_created', (drive: any) => {
            enqueueSnackbar(`🏢 New drive: ${drive.title}`, { variant: 'info' });
        });

        newSocket.on('new_notification', (n: any) => {
            const variantMap: Record<string, "info" | "success" | "warning" | "error"> = {
                info: 'info', success: 'success', warning: 'warning', error: 'error'
            };
            enqueueSnackbar(n.title + ': ' + n.message, { variant: variantMap[n.type] || 'info' });

            // Dispatch a custom window event so Topbar can also catch this to increment its counter
            window.dispatchEvent(new CustomEvent('app_new_notification', { detail: n }));
        });

        newSocket.on('test_published', (test: any) => {
            enqueueSnackbar(`📝 New mock test available: ${test.title}`, { variant: 'info' });
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            socketRef.current = null;
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
