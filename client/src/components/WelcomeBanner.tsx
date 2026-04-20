import { Card, Box, Typography } from '@mui/material';

interface WelcomeBannerProps {
  name: string;
  role: string;
  subtitle?: string;
}

const WelcomeBanner = ({ name, role, subtitle }: WelcomeBannerProps) => {
  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'admin': return 'Administrator';
      case 'placement_officer': return 'Placement Officer';
      case 'student': return 'Student';
      default: return r;
    }
  };

  return (
    <Card
      sx={{
        p: { xs: 3, md: 4 },
        mb: 3,
        borderRadius: '20px',
        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(15,52,96,0.35)',
        '&:hover': {
          transform: 'none',
          boxShadow: '0 10px 40px rgba(15,52,96,0.4)',
          background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
          border: 'none'
        },
      }}
    >
      {/* Decorative gradient orbs — matching login */}
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 180, md: 320 },
          height: { xs: 180, md: 320 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(126,87,194,0.25) 0%, transparent 70%)',
          top: -100,
          right: -80,
          animation: 'bannerFloat 6s ease-in-out infinite',
          '@keyframes bannerFloat': {
            '0%,100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-15px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 120, md: 200 },
          height: { xs: 120, md: 200 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(92,107,192,0.2) 0%, transparent 70%)',
          bottom: -60,
          right: { xs: 40, md: 150 },
          animation: 'bannerFloat 8s ease-in-out infinite reverse',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(179,157,219,0.15) 0%, transparent 70%)',
          top: 20,
          right: { xs: 140, md: 380 },
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            mb: 0.5,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.3rem' },
            background: 'linear-gradient(135deg, #fff 30%, #B39DDB 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Welcome back, {name}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.7, fontSize: { xs: '0.85rem', md: '1rem' } }}>
          {subtitle || `${getRoleLabel(role)} Dashboard — CareerNIT Placement Management System`}
        </Typography>
      </Box>
    </Card>
  );
};

export default WelcomeBanner;