import { Card, CardActionArea, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  navigateTo: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, gradient, navigateTo, subtitle }: StatCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        borderRadius: '18px',
        overflow: 'hidden',
        height: '100%',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(92,107,192,0.06)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 32px rgba(92,107,192,0.12)',
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(92,107,192,0.12)',
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(navigateTo)}
        sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 2 }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '14px',
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
            '& .MuiSvgIcon-root': { color: '#FFFFFF', fontSize: 26 },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" sx={{ color: '#777', fontWeight: 500, fontSize: '0.8rem', mb: 0.3 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E', lineHeight: 1.2 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#AAA', fontSize: '0.72rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default StatCard;