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
      case 'admin': return 'Admin';
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
        background: 'linear-gradient(180deg, #3A3F7A 0%, #2B2D5E 100%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '4px' },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SchoolIcon sx={{ fontSize: 32, color: '#B39DDB' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1 }}>
          CareerNIT
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, px: 1.5, py: 1 }}>
        {navSections.map((section) => (
          <Box key={section.section} sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.4)',
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
                    color: isActive(item.path) ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                    background: isActive(item.path) ? 'rgba(255,255,255,0.12)' : 'transparent',
                    backdropFilter: isActive(item.path) ? 'blur(10px)' : 'none',
                    '&:hover': {
                      background: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                      color: '#FFFFFF',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? '#B39DDB' : 'rgba(255,255,255,0.5)',
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
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #8594E8, #5C6BC0)',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          {user.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {user.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
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