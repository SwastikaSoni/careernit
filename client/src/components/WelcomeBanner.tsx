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
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #3A3F7A 0%, #5C6BC0 60%, #B39DDB 100%)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': { transform: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 120, md: 200 },
          height: { xs: 120, md: 200 },
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          top: -60,
          right: -40,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 80, md: 120 },
          height: { xs: 80, md: 120 },
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          bottom: -30,
          right: { xs: 20, md: 80 },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          top: 20,
          right: { xs: 100, md: 250 },
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.125rem' } }}
        >
          Welcome back, {name}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85, fontSize: { xs: '0.85rem', md: '1rem' } }}>
          {subtitle || `${getRoleLabel(role)} Dashboard — CareerNIT Placement Management System`}
        </Typography>
      </Box>
    </Card>
  );
};

export default WelcomeBanner;