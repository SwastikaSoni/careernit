import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#F4F6FA' }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Topbar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
          mt: '64px',
          p: { xs: 1.5, sm: 2, md: 3 },
          minHeight: 'calc(100vh - 64px)',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;