import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  InputBase,
  Avatar,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Badge,
  Typography,
  ListItemIcon,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  NotificationsNoneOutlined as BellIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { DRAWER_WIDTH } from './Sidebar';

import { getMyNotifications, markAsRead } from '../services/notificationService';

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

const Topbar = ({ onMobileMenuToggle }: TopbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getMyNotifications().then(data => {
        setUnreadCount(data.unreadCount || 0);
        setRecentNotifications(data.notifications?.slice(0, 5) || []);
      }).catch(console.error);

      const handleNewNotification = (e: any) => {
        const n = e.detail;
        setUnreadCount(prev => prev + 1);
        setRecentNotifications(prev => [n, ...prev].slice(0, 5));
      };

      window.addEventListener('app_new_notification', handleNewNotification);
      return () => window.removeEventListener('app_new_notification', handleNewNotification);
    }
  }, [user]);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      await markAsRead(n._id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setRecentNotifications(prev => prev.map(item => item._id === n._id ? { ...item, isRead: true } : item));
    }
    setNotificationAnchor(null);
    if (n.link) navigate(n.link);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return { label: 'Admin', color: '#EDE7F6', textColor: '#5C6BC0' };
      case 'placement_officer': return { label: 'Officer', color: '#E8EAF6', textColor: '#3949AB' };
      case 'student': return { label: 'Student', color: '#FFF3E0', textColor: '#E65100' };
      default: return { label: role, color: '#F5F5F5', textColor: '#333' };
    }
  };

  const roleBadge = getRoleBadge(user?.role || '');

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: isMobile ? 0 : DRAWER_WIDTH,
        right: 0,
        height: 64,
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(92,107,192,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 1.5, sm: 2, md: 3 },
        zIndex: 1100,
      }}
    >
      {/* Left Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
        {isMobile && (
          <IconButton onClick={onMobileMenuToggle} sx={{ color: '#5C6BC0' }}>
            <MenuIcon />
          </IconButton>
        )}

        {!isSmall && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(92,107,192,0.06)',
              border: '1px solid rgba(92,107,192,0.08)',
              borderRadius: '14px',
              px: 2,
              py: 0.5,
              width: { sm: 250, md: 350 },
              maxWidth: '100%',
              transition: 'all 0.3s',
              '&:focus-within': {
                background: 'rgba(92,107,192,0.1)',
                border: '1px solid rgba(92,107,192,0.2)',
                boxShadow: '0 2px 12px rgba(92,107,192,0.1)',
              },
            }}
          >
            <SearchIcon sx={{ color: '#9FA8DA', fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Search..."
              sx={{ flex: 1, fontSize: '0.9rem', color: '#333' }}
            />
          </Box>
        )}
      </Box>

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1, md: 2 } }}>
        {!isSmall && (
          <Chip
            label={roleBadge.label}
            size="small"
            sx={{
              background: roleBadge.color,
              color: roleBadge.textColor,
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 28,
            }}
          />
        )}

        <IconButton size="small" onClick={(e) => setNotificationAnchor(e.currentTarget)}>
          <Badge badgeContent={unreadCount} color="error" variant={unreadCount > 0 ? 'standard' : 'dot'} invisible={unreadCount === 0}>
            <BellIcon sx={{ color: '#555', fontSize: 22 }} />
          </Badge>
        </IconButton>

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            borderRadius: '12px',
            px: 1,
            py: 0.5,
            '&:hover': { background: 'rgba(92,107,192,0.06)' },
            transition: 'background 0.2s',
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: '2px solid rgba(255,255,255,0.8)',
              boxShadow: '0 2px 8px rgba(92,107,192,0.3)',
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          {!isSmall && (
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
              {user?.name}
            </Typography>
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(92,107,192,0.15)',
              mt: 1,
              minWidth: 180,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(92,107,192,0.1)',
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate(user?.role === 'student' ? '/dashboard/my-profile' : '/dashboard/profile');
            }}
          >
            <ListItemIcon><PersonIcon fontSize="small" sx={{ color: '#5C6BC0' }} /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#EF5350' }} /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={() => setNotificationAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(92,107,192,0.15)',
              mt: 1,
              width: 320,
              maxHeight: 400,
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(92,107,192,0.1)',
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(92,107,192,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A2E' }}>Notifications</Typography>
            {unreadCount > 0 && <Chip label={`${unreadCount} New`} size="small" color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />}
          </Box>
          {recentNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#999' }}>No recent notifications</Typography>
            </Box>
          ) : (
            recentNotifications.map(n => (
              <MenuItem
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderBottom: '1px solid rgba(92,107,192,0.05)',
                  background: n.isRead ? 'transparent' : 'rgba(92,107,192,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  whiteSpace: 'normal',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: n.isRead ? 500 : 700, color: '#333' }}>
                  {n.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', mt: 0.5, lineHeight: 1.3 }}>
                  {n.message}
                </Typography>
              </MenuItem>
            ))
          )}
          <Box sx={{ p: 1, borderTop: '1px solid rgba(92,107,192,0.08)', textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{ color: '#5C6BC0', fontWeight: 600, cursor: 'pointer', p: 1, '&:hover': { background: 'rgba(92,107,192,0.06)', borderRadius: '8px' } }}
              onClick={() => { setNotificationAnchor(null); navigate('/dashboard/notifications'); }}
            >
              View All Notifications
            </Typography>
          </Box>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;