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
      {/* Warm, uplifting gradient background */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(145deg, #f0e6ff 0%, #e8f4fd 25%, #fef6e8 50%, #fce4ec 75%, #ede7f6 100%)',
          zIndex: 0,
        }}
      />

      {/* Soft floating pastel orbs for warmth */}
      <Box sx={{
        position: 'fixed', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(179,157,219,0.25) 0%, transparent 70%)',
        top: -150, right: -100, zIndex: 0,
        animation: 'dashFloat 10s ease-in-out infinite',
        '@keyframes dashFloat': { '0%,100%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-30px) scale(1.04)' } },
      }} />
      <Box sx={{
        position: 'fixed', width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,183,77,0.18) 0%, transparent 70%)',
        bottom: -120, left: '15%', zIndex: 0,
        animation: 'dashFloat 12s ease-in-out infinite reverse',
      }} />
      <Box sx={{
        position: 'fixed', width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(129,212,250,0.2) 0%, transparent 70%)',
        top: '40%', left: '55%', zIndex: 0,
        animation: 'dashFloat 14s ease-in-out infinite',
      }} />
      <Box sx={{
        position: 'fixed', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240,98,146,0.12) 0%, transparent 70%)',
        top: '10%', left: '25%', zIndex: 0,
        animation: 'dashFloat 11s ease-in-out infinite reverse',
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