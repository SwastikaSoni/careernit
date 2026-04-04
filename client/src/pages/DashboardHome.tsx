import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/dashboardService';
import AdminDashboard from './dashboards/AdminDashboard';
import OfficerDashboard from './dashboards/OfficerDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import { Box, CircularProgress } from '@mui/material';

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: '#B39DDB' }} />
      </Box>
    );
  }

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard stats={stats} userName={user.name} />;
    case 'placement_officer':
      return <OfficerDashboard stats={stats} userName={user.name} />;
    case 'student':
      return <StudentDashboard stats={stats} userName={user.name} />;
    default:
      return null;
  }
};

export default DashboardHome;