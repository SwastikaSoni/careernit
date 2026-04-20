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
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Clean, subtle professional background */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(145deg, #f8f9fc 0%, #f2f4f8 30%, #eef1f7 60%, #f5f6fa 100%)',
          zIndex: 0,
        }}
      />

      {/* Very subtle, barely-visible accent orbs for depth — no color distraction */}
      <Box sx={{
        position: 'fixed', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(92,107,192,0.06) 0%, transparent 70%)',
        top: -200, right: -150, zIndex: 0,
        animation: 'dashFloat 14s ease-in-out infinite',
        '@keyframes dashFloat': { '0%,100%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-20px) scale(1.02)' } },
      }} />
      <Box sx={{
        position: 'fixed', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(126,87,194,0.04) 0%, transparent 70%)',
        bottom: -150, left: '10%', zIndex: 0,
        animation: 'dashFloat 16s ease-in-out infinite reverse',
      }} />
      <Box sx={{
        position: 'fixed', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(92,107,192,0.03) 0%, transparent 70%)',
        top: '45%', left: '50%', zIndex: 0,
        animation: 'dashFloat 18s ease-in-out infinite',
      }} />

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
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;