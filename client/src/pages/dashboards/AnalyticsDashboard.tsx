import { Box, Typography, Card, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import WelcomeBanner from '../../components/WelcomeBanner';

const AnalyticsDashboard = () => {
    const { user } = useAuth();

    // Basic mock analytics data for placement trends
    const trendData = [
        { year: '2020', placed: 120 },
        { year: '2021', placed: 150 },
        { year: '2022', placed: 200 },
        { year: '2023', placed: 250 },
        { year: '2024', placed: 310 },
    ];

    return (
        <Box>
            <WelcomeBanner name={user?.name || 'Admin'} role="admin" />
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 1 }}>
                    Placement Analytics
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                    Overview of placement rates and trends across the institution.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '18px', height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A2E' }}>
                                Yearly Placements Trend
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                                <RechartsTooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Bar dataKey="placed" fill="#7E57C2" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 3, borderRadius: '18px', height: '100%', background: 'linear-gradient(135deg, #1A1A2E, #16213E)', color: '#fff' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Quick Insights
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ color: '#ccc', mb: 0.5 }}>Top Core Sector Rate</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#4CAF50' }}>84%</Typography>
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ color: '#ccc', mb: 0.5 }}>Average Package Growth</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#42A5F5' }}>+12%</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: '#ccc', mb: 0.5 }}>Total Hiring Partners</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#AB47BC' }}>142</Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnalyticsDashboard;
