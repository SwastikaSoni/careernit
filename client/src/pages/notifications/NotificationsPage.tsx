import { useState, useEffect } from 'react';
import {
    Box, Typography, Card, IconButton, CircularProgress, Tooltip, Button
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    CheckCircleOutline as CheckIcon,
    DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getMyNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getMyNotifications();
            setNotifications(data.notifications);
        } catch (error) {
            enqueueSnackbar('Failed to load notifications', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            enqueueSnackbar('All notifications marked as read', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to mark all as read', { variant: 'error' });
        }
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.isRead) {
            handleMarkAsRead(n._id);
        }
        if (n.link) {
            navigate(n.link);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return '#4CAF50';
            case 'error': return '#F44336';
            case 'warning': return '#FF9800';
            default: return '#5C6BC0';
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <NotificationsIcon sx={{ fontSize: 32, color: '#5C6BC0' }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Notifications History</Typography>
                </Box>
                {notifications.some(n => !n.isRead) && (
                    <Button
                        startIcon={<DoneAllIcon />}
                        onClick={handleMarkAllAsRead}
                        sx={{ textTransform: 'none', fontWeight: 600, color: '#5C6BC0', bgcolor: '#F4F6FA', '&:hover': { bgcolor: '#E8EAF6' } }}
                    >
                        Mark all as read
                    </Button>
                )}
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#5C6BC0' }} />
                </Box>
            ) : notifications.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px', boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                    <NotificationsIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No notifications found</Typography>
                    <Typography variant="body2" sx={{ color: '#BBB' }}>You're all caught up!</Typography>
                </Card>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {notifications.map((n) => (
                        <Card
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            sx={{
                                p: 2.5,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2,
                                borderRadius: '14px',
                                boxShadow: 'none',
                                border: '1px solid #E0E0E0',
                                backgroundColor: n.isRead ? '#FFFFFF' : '#F9FBFF',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <Box sx={{
                                mt: 0.5,
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: n.isRead ? 'transparent' : '#5C6BC0',
                                flexShrink: 0
                            }} />
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: n.isRead ? 600 : 700, color: getTypeColor(n.type) }}>
                                        {n.title}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#888', whiteSpace: 'nowrap', ml: 2 }}>
                                        {dayjs(n.createdAt).fromNow()}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.5, fontWeight: n.isRead ? 400 : 500 }}>
                                    {n.message}
                                </Typography>
                            </Box>
                            <Box>
                                {!n.isRead && (
                                    <Tooltip title="Mark as read">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n._id); }}
                                            sx={{ color: '#5C6BC0' }}
                                        >
                                            <CheckIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default NotificationsPage;
