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
    <Card sx={{ borderRadius: '18px', overflow: 'hidden' }}>
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
            '& .MuiSvgIcon-root': { color: '#FFFFFF', fontSize: 26 },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" sx={{ color: '#888', fontWeight: 500, fontSize: '0.8rem', mb: 0.3 }}>
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