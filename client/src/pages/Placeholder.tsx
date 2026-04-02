import { useLocation } from 'react-router-dom';
import { Box, Typography, Card } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';

const Placeholder = () => {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Page';

  return (
    <Card
      sx={{
        p: 6,
        textAlign: 'center',
        borderRadius: '18px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <ConstructionIcon sx={{ fontSize: 64, color: '#CCC', mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#333', textTransform: 'capitalize', mb: 1 }}>
        {pageName}
      </Typography>
      <Typography variant="body1" sx={{ color: '#888' }}>
        This module is coming soon. It will be built in a future step.
      </Typography>
    </Card>
  );
};

export default Placeholder;