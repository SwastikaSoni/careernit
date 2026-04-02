import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true,
        },
    });

    // Authenticate socket connections via cookie JWT
    io.use((socket: Socket, next) => {
        try {
            // Try cookie first (HTTP-only cookie auth), then handshake auth token
            const rawCookie = socket.handshake.headers.cookie;
            let token: string | undefined;

            if (rawCookie) {
                const parsed = cookie.parse(rawCookie);
                token = parsed.token;
            }
            if (!token) {
                token = socket.handshake.auth?.token;
            }

            if (!token) return next(new Error('Authentication required'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
            (socket as any).user = decoded;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const user = (socket as any).user;
        console.log(`Socket connected: ${user?.name} (${user?.role})`);

        // Join rooms based on user identity
        if (user?._id) socket.join(`user:${user._id}`);
        if (user?.role) socket.join(`role:${user.role}`);
        if (user?.department) socket.join(`dept:${user.department}`);

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${user?.name}`);
        });
    });

    console.log('Socket.IO initialized');
    return io;
};

export const getIO = (): Server | null => io;

// Emit helpers
export const emitToAll = (event: string, data: any) => {
    io?.emit(event, data);
};

export const emitToUser = (userId: string, event: string, data: any) => {
    io?.to(`user:${userId}`).emit(event, data);
};

export const sendUserNotification = async (
    userId: string,
    data: { title: string; message: string; type?: string; link?: string }
) => {
    try {
        const Notification = require('../models/Notification').default;
        const notification = await Notification.create({
            user: userId,
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            link: data.link,
        });
        io?.to(`user:${userId}`).emit('new_notification', notification);
    } catch (err) {
        console.error('Failed to send notification', err);
    }
};

export const emitToDepartment = (deptId: string, event: string, data: any) => {
    io?.to(`dept:${deptId}`).emit(event, data);
};

export const emitToRole = (role: string, event: string, data: any) => {
    io?.to(`role:${role}`).emit(event, data);
};
