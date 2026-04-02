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
    <Card sx={{ borderRadius: '18px', overflow: 'hidden' }}>
      <CardActionArea
        onClick={() => navigate(navigateTo)}
        sx={{
          p: { xs: 2.5, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 1.5,
          minHeight: 140,
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