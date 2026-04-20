import { Card, CardActionArea, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  navigateTo: string;
}

const QuickActionCard = ({ title, description, icon, gradient, navigateTo }: QuickActionCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        borderRadius: '18px',
        overflow: 'hidden',
        height: '100%',
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 30px rgba(92,107,192,0.12)',
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(92,107,192,0.15)',
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(navigateTo)}
        sx={{
          p: { xs: 2, md: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 1,
          height: '100%',
          minHeight: 130,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
            '& .MuiSvgIcon-root': { color: '#FFFFFF', fontSize: 24 },
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A1A2E', mb: 0.3 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#888' }}>
            {description}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default QuickActionCard;