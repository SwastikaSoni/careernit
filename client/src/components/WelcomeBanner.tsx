import { Card, Box, Typography } from '@mui/material';
import {
  TrendingUp as GrowthIcon,
  Business as CompanyIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';

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
        background: 'linear-gradient(135deg, #5C6BC0 0%, #7E57C2 40%, #AB47BC 100%)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(92,107,192,0.3)',
        '&:hover': { 
          transform: 'none', 
          boxShadow: '0 10px 40px rgba(92,107,192,0.35)',
          background: 'linear-gradient(135deg, #5C6BC0 0%, #7E57C2 40%, #AB47BC 100%)',
          border: 'none'
        },
      }}
    >
      {/* Decorative gradient orbs */}
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 150, md: 280 },
          height: { xs: 150, md: 280 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
          top: -80,
          right: -60,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 100, md: 180 },
          height: { xs: 100, md: 180 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          bottom: -50,
          right: { xs: 30, md: 120 },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          top: 30,
          right: { xs: 120, md: 350 },
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.3rem' },
              color: '#fff',
            }}
          >
            Welcome back, {name} 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, fontSize: { xs: '0.85rem', md: '1rem' } }}>
            {subtitle || `${getRoleLabel(role)} Dashboard — CareerNIT Placement Management System`}
          </Typography>
        </Box>

        {/* Quick stats in banner */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { icon: <CompanyIcon sx={{ fontSize: 18 }} />, label: '200+', sub: 'Companies' },
            { icon: <GroupsIcon sx={{ fontSize: 18 }} />, label: '95%', sub: 'Placed' },
            { icon: <GrowthIcon sx={{ fontSize: 18 }} />, label: '₹42L', sub: 'Highest CTC' },
          ].map((stat, i) => (
            <Box key={i} sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 1, borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s',
              '&:hover': { background: 'rgba(255,255,255,0.22)', transform: 'translateY(-1px)' },
            }}>
              <Box sx={{ color: 'rgba(255,255,255,0.9)' }}>{stat.icon}</Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1, color: '#fff' }}>{stat.label}</Typography>
                <Typography sx={{ fontSize: '0.65rem', opacity: 0.75 }}>{stat.sub}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
};

export default WelcomeBanner;