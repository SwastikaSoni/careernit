import { Box, Grid, Typography } from '@mui/material';
import {
  Business as BusinessIcon,
  Work as WorkIcon,
  Description as AppIcon,
  EventNote as InterviewIcon,
  CardGiftcard as OfferIcon,
  TrendingUp as TrendIcon,
  Quiz as QuizIcon,
  Add as AddIcon,
  Campaign as AnnouncementIcon,
} from '@mui/icons-material';
import WelcomeBanner from '../../components/WelcomeBanner';
import StatCard from '../../components/StatCard';
import QuickActionCard from '../../components/QuickActionCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OfficerDashboardProps {
  stats: any;
  userName: string;
}

const placeholderChartData = [
  { name: 'No Data', Applications: 0 },
];

const OfficerDashboard = ({ stats, userName }: OfficerDashboardProps) => {
  const glassCard = {
    p: { xs: 2.5, md: 3 },
    borderRadius: '20px',
    height: '100%',
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.6)',
    boxShadow: '0 4px 20px rgba(92,107,192,0.08)',
  };

  return (
    <Box>
      <WelcomeBanner name={userName} role="placement_officer" />

      <Grid container spacing={{ xs: 2, md: 2.5 }} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard title="Companies" value={stats?.totalCompanies || 0} icon={<BusinessIcon />} gradient="linear-gradient(135deg, #5C6BC0, #7E57C2)" navigateTo="/dashboard/companies" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard title="Active Drives" value={stats?.activeDrives || 0} icon={<WorkIcon />} gradient="linear-gradient(135deg, #FF9800, #F57C00)" navigateTo="/dashboard/drives" subtitle={`${stats?.totalDrives || 0} total`} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard title="Applications" value={stats?.totalApplications || 0} icon={<AppIcon />} gradient="linear-gradient(135deg, #26A69A, #00897B)" navigateTo="/dashboard/applications" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard title="Interviews" value={stats?.upcomingInterviews || 0} icon={<InterviewIcon />} gradient="linear-gradient(135deg, #42A5F5, #1E88E5)" navigateTo="/dashboard/interviews" subtitle="Upcoming" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard title="Pending Offers" value={stats?.pendingOffers || 0} icon={<OfferIcon />} gradient="linear-gradient(135deg, #EF5350, #C62828)" navigateTo="/dashboard/offers" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard title="Placed" value={stats?.placedStudents || 0} icon={<TrendIcon />} gradient="linear-gradient(135deg, #AB47BC, #8E24AA)" navigateTo="/dashboard/reports" subtitle={`of ${stats?.totalStudents || 0} verified`} />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {/* Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={glassCard}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A2E' }}>
                Applications Overview
              </Typography>
              <Typography variant="caption" sx={{ color: '#AAA' }}>
                Monthly trend
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats?.driveStats && stats.driveStats.length > 0 ? stats.driveStats : placeholderChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(92,107,192,0.08)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(92,107,192,0.1)',
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="Applications" fill="#5C6BC0" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={glassCard}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1A1A2E' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <QuickActionCard title="New Drive" description="Create job posting" icon={<AddIcon />} gradient="linear-gradient(135deg, #5C6BC0, #7E57C2)" navigateTo="/dashboard/drives" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickActionCard title="Add Company" description="Register company" icon={<BusinessIcon />} gradient="linear-gradient(135deg, #26A69A, #00897B)" navigateTo="/dashboard/companies" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickActionCard title="Add Questions" description="Build question bank" icon={<QuizIcon />} gradient="linear-gradient(135deg, #FF9800, #F57C00)" navigateTo="/dashboard/questions" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickActionCard title="Announcement" description="Notify students" icon={<AnnouncementIcon />} gradient="linear-gradient(135deg, #EF5350, #C62828)" navigateTo="/dashboard/announcements" />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OfficerDashboard;