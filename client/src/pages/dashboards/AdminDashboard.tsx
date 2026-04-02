import { Box, Grid, Card, Typography } from '@mui/material';
import {
  People as PeopleIcon,
  VerifiedUser as VerifiedIcon,
  HourglassTop as PendingIcon,
  BadgeOutlined as OfficerIcon,
  AccountBalance as DeptIcon,
  Work as WorkIcon,
  TrendingUp as TrendIcon,
  PersonOff as RejectedIcon,
  Campaign as AnnouncementIcon,
  PersonAdd as AddOfficerIcon,
  BarChart as AnalyticsIcon,
} from '@mui/icons-material';
import WelcomeBanner from '../../components/WelcomeBanner';
import StatCard from '../../components/StatCard';
import QuickActionCard from '../../components/QuickActionCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AdminDashboardProps {
  stats: any;
  userName: string;
}

const COLORS = ['#5C6BC0', '#7E57C2', '#EF5350', '#B0BEC5'];

const AdminDashboard = ({ stats, userName }: AdminDashboardProps) => {
  const verificationDataRaw = [
    { name: 'Verified', value: stats?.verifiedStudents || 0 },
    { name: 'Pending', value: stats?.pendingVerifications || 0 },
    { name: 'Rejected', value: stats?.rejectedStudents || 0 },
  ].filter((d) => d.value > 0);

  const verificationData = verificationDataRaw.length > 0
    ? verificationDataRaw
    : [{ name: 'No Data', value: 1 }];

  return (
    <Box>
      <WelcomeBanner name={userName} role="admin" />

      {/* Stat Cards */}
      {/* Stat Cards */}
      <Grid container spacing={{ xs: 2, md: 2.5 }} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            icon={<PeopleIcon />}
            gradient="linear-gradient(135deg, #5C6BC0, #7E57C2)"
            navigateTo="/dashboard/students"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard
            title="Pending Verification"
            value={stats?.pendingVerifications || 0}
            icon={<PendingIcon />}
            gradient="linear-gradient(135deg, #FF9800, #F57C00)"
            navigateTo="/dashboard/verification"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard
            title="Verified"
            value={stats?.verifiedStudents || 0}
            icon={<VerifiedIcon />}
            gradient="linear-gradient(135deg, #4CAF50, #2E7D32)"
            navigateTo="/dashboard/students"
            subtitle="Eligible for drives"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard
            title="Rejected"
            value={stats?.rejectedStudents || 0}
            icon={<RejectedIcon />}
            gradient="linear-gradient(135deg, #EF5350, #C62828)"
            navigateTo="/dashboard/students"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard
            title="Officers"
            value={stats?.totalOfficers || 0}
            icon={<OfficerIcon />}
            gradient="linear-gradient(135deg, #26A69A, #00897B)"
            navigateTo="/dashboard/officers"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
          <StatCard
            title="Placement Rate"
            value={`${stats?.placementRate || 0}%`}
            icon={<TrendIcon />}
            gradient="linear-gradient(135deg, #AB47BC, #8E24AA)"
            navigateTo="/dashboard/analytics"
            subtitle={`${stats?.placedStudents || 0} placed`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {/* Verification Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '18px', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1A1A2E' }}>
              Student Verification Overview
            </Typography>
            {verificationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={verificationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {verificationData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260, color: '#CCC' }}>
                <Typography>No student data yet</Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '18px', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1A1A2E' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <QuickActionCard
                  title="Verify Students"
                  description="Review pending profiles"
                  icon={<VerifiedIcon />}
                  gradient="linear-gradient(135deg, #FF9800, #F57C00)"
                  navigateTo="/dashboard/verification"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickActionCard
                  title="Add Officer"
                  description="Create new account"
                  icon={<AddOfficerIcon />}
                  gradient="linear-gradient(135deg, #26A69A, #00897B)"
                  navigateTo="/dashboard/officers"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickActionCard
                  title="Departments"
                  description="Manage departments"
                  icon={<DeptIcon />}
                  gradient="linear-gradient(135deg, #5C6BC0, #7E57C2)"
                  navigateTo="/dashboard/departments"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickActionCard
                  title="Announcements"
                  description="Post updates"
                  icon={<AnnouncementIcon />}
                  gradient="linear-gradient(135deg, #EF5350, #C62828)"
                  navigateTo="/dashboard/announcements"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;