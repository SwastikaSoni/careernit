import { Box, Grid, Typography, Alert, Chip } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import {
  Work as WorkIcon,
  Description as AppIcon,
  EventNote as InterviewIcon,
  CardGiftcard as OfferIcon,
  Quiz as QuizIcon,
  MenuBook as ResourceIcon,
  Assignment as TestIcon,
  CheckCircle as VerifiedIcon,
  HourglassTop as PendingIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import WelcomeBanner from '../../components/WelcomeBanner';
import StatCard from '../../components/StatCard';
import QuickActionCard from '../../components/QuickActionCard';

interface StudentDashboardProps {
  stats: any;
  userName: string;
}

const StudentDashboard = ({ stats, userName }: StudentDashboardProps) => {
  const verificationStatus = stats?.verificationStatus || 'pending';
  const placementStatus = stats?.placementStatus || 'unplaced';

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

  const getVerificationAlert = () => {
    switch (verificationStatus) {
      case 'pending':
        return (
          <Alert
            severity="warning"
            icon={<PendingIcon />}
            sx={{
              mb: 3,
              borderRadius: '14px',
              alignItems: 'center',
              background: 'rgba(255,243,224,0.7)',
              border: '1px solid rgba(255,152,0,0.2)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Your profile is pending verification. Please complete your profile with all required details so the admin can verify you.
              You won't be able to browse or apply to drives until verified.
            </Typography>
          </Alert>
        );
      case 'rejected':
        return (
          <Alert
            severity="error"
            icon={<RejectedIcon />}
            sx={{
              mb: 3,
              borderRadius: '14px',
              alignItems: 'center',
              background: 'rgba(255,235,238,0.7)',
              border: '1px solid rgba(239,83,80,0.2)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Your profile was rejected. Please update your details and resubmit for verification.
            </Typography>
          </Alert>
        );
      case 'verified':
        return null;
      default:
        return null;
    }
  };

  return (
    <Box>
      <WelcomeBanner name={userName} role="student" />

      {/* Verification & Placement Status */}
      {getVerificationAlert()}

      {placementStatus === 'placed' && (
        <Alert
          severity="success"
          icon={<VerifiedIcon />}
          sx={{
            mb: 3,
            borderRadius: '14px',
            alignItems: 'center',
            background: 'rgba(232,245,233,0.7)',
            border: '1px solid rgba(76,175,80,0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            🎉 Congratulations! You have been placed. Check your offer details below.
          </Typography>
        </Alert>
      )}

      {/* Status Badges */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          icon={
            verificationStatus === 'verified' ? <VerifiedIcon /> :
              verificationStatus === 'rejected' ? <RejectedIcon /> : <PendingIcon />
          }
          label={`Verification: ${verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}`}
          sx={{
            fontWeight: 600,
            backdropFilter: 'blur(8px)',
            background:
              verificationStatus === 'verified' ? '#E8F5E9' :
                verificationStatus === 'rejected' ? '#FFEBEE' : '#FFF3E0',
            color:
              verificationStatus === 'verified' ? '#2E7D32' :
                verificationStatus === 'rejected' ? '#C62828' : '#E65100',
            '& .MuiChip-icon': {
              color:
                verificationStatus === 'verified' ? '#2E7D32' :
                  verificationStatus === 'rejected' ? '#C62828' : '#E65100',
            },
          }}
        />
        <Chip
          label={`Placement: ${placementStatus.charAt(0).toUpperCase() + placementStatus.slice(1)}`}
          sx={{
            fontWeight: 600,
            backdropFilter: 'blur(8px)',
            background: placementStatus === 'placed' ? '#E8F5E9' : '#F3E5F5',
            color: placementStatus === 'placed' ? '#2E7D32' : '#7B1FA2',
          }}
        />
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={{ xs: 2, md: 2.5 }} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard title="My Applications" value={stats?.myApplications || 0} icon={<AppIcon />} gradient="linear-gradient(135deg, #5C6BC0, #7E57C2)" navigateTo="/dashboard/my-applications" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard title="Upcoming Interviews" value={stats?.upcomingInterviews || 0} icon={<InterviewIcon />} gradient="linear-gradient(135deg, #FF9800, #F57C00)" navigateTo="/dashboard/interviews" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard title="Offers" value={stats?.offersReceived || 0} icon={<OfferIcon />} gradient="linear-gradient(135deg, #4CAF50, #2E7D32)" navigateTo="/dashboard/offers" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard title="Mock Tests" value={stats?.mockTestsTaken || 0} icon={<QuizIcon />} gradient="linear-gradient(135deg, #26A69A, #00897B)" navigateTo="/dashboard/mock-tests" subtitle="Tests taken" />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {/* Application Stats Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={glassCard}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1A1A2E' }}>
              Application Status Breakdown
            </Typography>
            {stats?.applicationStats && stats.applicationStats.length > 0 ? (
              <Box sx={{ height: 260 }}>
                <PieChart width={300} height={260} style={{ width: '100%' }}>
                  <Pie
                    data={stats.applicationStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.applicationStats.map((entry: any, index: number) => {
                      const colors: Record<string, string> = {
                        'Applied': '#5C6BC0',
                        'Shortlisted': '#FF9800',
                        'Selected': '#4CAF50',
                        'Rejected': '#F44336',
                        'Offered': '#AB47BC'
                      };
                      return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#999'} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(92,107,192,0.1)',
                      background: 'rgba(255,255,255,0.92)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260, color: '#CCC' }}>
                <Typography>No applications yet</Typography>
              </Box>
            )}
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
                <QuickActionCard title="Browse Drives" description="View open positions" icon={<WorkIcon />} gradient="linear-gradient(135deg, #5C6BC0, #7E57C2)" navigateTo="/dashboard/drives" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickActionCard title="Practice Questions" description="Prepare for interviews" icon={<QuizIcon />} gradient="linear-gradient(135deg, #FF9800, #F57C00)" navigateTo="/dashboard/questions" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickActionCard title="Study Resources" description="Recommended materials" icon={<ResourceIcon />} gradient="linear-gradient(135deg, #26A69A, #00897B)" navigateTo="/dashboard/resources" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickActionCard title="Mock Tests" description="Take practice tests" icon={<TestIcon />} gradient="linear-gradient(135deg, #AB47BC, #8E24AA)" navigateTo="/dashboard/mock-tests" />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;