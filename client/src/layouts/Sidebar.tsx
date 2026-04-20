import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  VerifiedUser as VerifiedIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  EventNote as EventIcon,
  CardGiftcard as OfferIcon,
  School as SchoolIcon,
  Campaign as AnnouncementIcon,
  BarChart as AnalyticsIcon,
  Person as PersonIcon,
  Quiz as QuizIcon,
  MenuBook as ResourceIcon,
  Assignment as TestIcon,
  AccountBalance as DeptIcon,
  BadgeOutlined as OfficerIcon,
  RocketLaunch as RocketIcon,
} from '@mui/icons-material';

export const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const getNavItems = (role: string): { section: string; items: NavItem[] }[] => {
  switch (role) {
    case 'admin':
      return [
        {
          section: 'MAIN',
          items: [
            { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
            { label: 'Student Verification', path: '/dashboard/verification', icon: <VerifiedIcon /> },
            { label: 'Students', path: '/dashboard/students', icon: <PeopleIcon /> },
            { label: 'Placement Officers', path: '/dashboard/officers', icon: <OfficerIcon /> },
            { label: 'Departments', path: '/dashboard/departments', icon: <DeptIcon /> },
          ],
        },
        {
          section: 'MANAGE',
          items: [
            { label: 'Drives', path: '/dashboard/drives', icon: <WorkIcon /> },
            { label: 'Analytics', path: '/dashboard/analytics', icon: <AnalyticsIcon /> },
            { label: 'Announcements', path: '/dashboard/announcements', icon: <AnnouncementIcon /> },
          ],
        },
        {
          section: 'ACCOUNT',
          items: [
            { label: 'Profile', path: '/dashboard/profile', icon: <PersonIcon /> },
          ],
        },
      ];

    case 'placement_officer':
      return [
        {
          section: 'MAIN',
          items: [
            { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
            { label: 'Companies', path: '/dashboard/companies', icon: <BusinessIcon /> },
            { label: 'Drives', path: '/dashboard/drives', icon: <WorkIcon /> },
            { label: 'Applications', path: '/dashboard/applications', icon: <DescriptionIcon /> },
            { label: 'Interviews', path: '/dashboard/interviews', icon: <EventIcon /> },
            { label: 'Offers', path: '/dashboard/offers', icon: <OfferIcon /> },
          ],
        },
        {
          section: 'PREPARATION',
          items: [
            { label: 'Questions', path: '/dashboard/questions', icon: <QuizIcon /> },
            { label: 'Resources', path: '/dashboard/resources', icon: <ResourceIcon /> },
            { label: 'Mock Tests', path: '/dashboard/mock-tests', icon: <TestIcon /> },
          ],
        },
        {
          section: 'OTHERS',
          items: [
            { label: 'Announcements', path: '/dashboard/announcements', icon: <AnnouncementIcon /> },
            { label: 'Profile', path: '/dashboard/profile', icon: <PersonIcon /> },
          ],
        },
      ];

    case 'student':
      return [
        {
          section: 'MAIN',
          items: [
            { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
            { label: 'My Profile', path: '/dashboard/my-profile', icon: <PersonIcon /> },
            { label: 'Browse Drives', path: '/dashboard/drives', icon: <WorkIcon /> },
            { label: 'My Applications', path: '/dashboard/my-applications', icon: <DescriptionIcon /> },
            { label: 'Interviews', path: '/dashboard/interviews', icon: <EventIcon /> },
            { label: 'Offers', path: '/dashboard/offers', icon: <OfferIcon /> },
          ],
        },
        {
          section: 'PREPARATION',
          items: [
            { label: 'Questions', path: '/dashboard/questions', icon: <QuizIcon /> },
            { label: 'Resources', path: '/dashboard/resources', icon: <ResourceIcon /> },
            { label: 'Mock Tests', path: '/dashboard/mock-tests', icon: <TestIcon /> },
          ],
        },
        {
          section: 'OTHERS',
          items: [
            { label: 'Announcements', path: '/dashboard/announcements', icon: <AnnouncementIcon /> },
          ],
        },
      ];

    default:
      return [];
  }
};

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navSections = getNavItems(user.role);

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'placement_officer': return 'Placement Officer';
      case 'student': return 'Student';
      default: return role;
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  return (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 80%, #1a1a2e 100%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.12)', borderRadius: '4px' },
      }}
    >
      {/* Decorative orbs to match login */}
      <Box sx={{
        position: 'absolute', width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(126,87,194,0.15) 0%, transparent 70%)',
        top: -40, right: -60, pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', width: 140, height: 140, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(92,107,192,0.12) 0%, transparent 70%)',
        bottom: 40, left: -40, pointerEvents: 'none',
      }} />

      {/* Logo — matches login branding */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: '12px',
          background: 'linear-gradient(135deg, #7E57C2, #5C6BC0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(126,87,194,0.4)',
        }}>
          <RocketIcon sx={{ fontSize: 20, color: '#fff' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.3, fontSize: '1.15rem' }}>
          CareerNIT
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, px: 1.5, py: 1, position: 'relative', zIndex: 1 }}>
        {navSections.map((section) => (
          <Box key={section.section} sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.3)',
                fontWeight: 700,
                letterSpacing: 1.5,
                px: 1.5,
                py: 1,
                display: 'block',
                fontSize: '0.68rem',
              }}
            >
              {section.section}
            </Typography>
            <List disablePadding>
              {section.items.map((item) => (
                <ListItemButton
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: '12px',
                    mb: 0.3,
                    py: 1,
                    px: 1.5,
                    color: isActive(item.path) ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                    background: isActive(item.path)
                      ? 'linear-gradient(135deg, rgba(126,87,194,0.25), rgba(92,107,192,0.2))'
                      : 'transparent',
                    backdropFilter: isActive(item.path) ? 'blur(10px)' : 'none',
                    border: isActive(item.path) ? '1px solid rgba(179,157,219,0.15)' : '1px solid transparent',
                    boxShadow: isActive(item.path) ? '0 2px 12px rgba(126,87,194,0.15)' : 'none',
                    '&:hover': {
                      background: isActive(item.path)
                        ? 'linear-gradient(135deg, rgba(126,87,194,0.3), rgba(92,107,192,0.25))'
                        : 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? '#B39DDB' : 'rgba(255,255,255,0.4)',
                      minWidth: 38,
                      '& .MuiSvgIcon-root': { fontSize: 20 },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive(item.path) ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* User Card */}
      <Box
        sx={{
          p: 2,
          mx: 1.5,
          mb: 1.5,
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Avatar
          src={user.avatar ? `http://localhost:5000${user.avatar}` : undefined}
          sx={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #7E57C2, #5C6BC0)',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          {!user.avatar && user.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {user.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem' }}>
            {getRoleBadge(user.role)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const Sidebar = ({ mobileOpen, onMobileClose }: SidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            border: 'none',
          },
        }}
      >
        <SidebarContent onItemClick={onMobileClose} />
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      <SidebarContent />
    </Box>
  );
};

export default Sidebar;