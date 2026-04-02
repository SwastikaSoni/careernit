import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Grid, Chip, CircularProgress, Avatar,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
    Work as WorkIcon, CalendarToday as CalendarIcon, CurrencyRupee as SalaryIcon,
    LocationOn as LocationIcon, Cancel as WithdrawIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { getMyApplications, withdrawApplication } from '../../services/driveService';

interface Application {
    _id: string;
    drive: {
        _id: string; title: string; packageLPA?: number; jobType: string; lastDateToApply: string;
        location?: string; status: string;
        company: { _id: string; name: string; industry: string; logo?: string };
    };
    status: string;
    appliedAt: string;
}

const statusColors: Record<string, string> = {
    applied: '#1565C0', shortlisted: '#ED6C02', rejected: '#D32F2F', selected: '#2E7D32',
};
const statusBg: Record<string, string> = {
    applied: '#E3F2FD', shortlisted: '#FFF3E0', rejected: '#FFEBEE', selected: '#E8F5E9',
};
const statusLabels: Record<string, string> = {
    applied: 'Applied', shortlisted: 'Shortlisted', rejected: 'Rejected', selected: 'Selected',
};
const jobTypeLabel: Record<string, string> = { full_time: 'Full Time', internship: 'Internship', both: 'Full Time + Internship' };

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [withdrawDialog, setWithdrawDialog] = useState<{ open: boolean; app: Application | null }>({ open: false, app: null });
    const [withdrawing, setWithdrawing] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetch = async () => {
        try {
            const data = await getMyApplications();
            setApplications(data.applications);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const handleWithdraw = async () => {
        if (!withdrawDialog.app) return;
        setWithdrawing(true);
        try {
            await withdrawApplication(withdrawDialog.app._id);
            enqueueSnackbar('Application withdrawn successfully', { variant: 'success' });
            setWithdrawDialog({ open: false, app: null });
            fetch();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to withdraw', { variant: 'error' });
        } finally { setWithdrawing(false); }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>;
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 3 }}>My Applications</Typography>

            {/* Summary */}
            {applications.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                    {(['applied', 'shortlisted', 'selected', 'rejected'] as const).map((s) => {
                        const count = applications.filter((a) => a.status === s).length;
                        if (count === 0) return null;
                        return (
                            <Chip key={s} label={`${statusLabels[s]}: ${count}`}
                                sx={{ background: statusBg[s], color: statusColors[s], fontWeight: 600, fontSize: '0.8rem', height: 30 }} />
                        );
                    })}
                    <Chip label={`Total: ${applications.length}`}
                        sx={{ background: '#F3E5F5', color: '#7E57C2', fontWeight: 600, fontSize: '0.8rem', height: 30 }} />
                </Box>
            )}

            {applications.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <WorkIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No applications yet</Typography>
                    <Typography variant="body2" sx={{ color: '#BBB', mt: 0.5 }}>
                        Browse drives and apply to get started!
                    </Typography>
                </Card>
            ) : (
                <Grid container spacing={{ xs: 2, md: 2.5 }}>
                    {applications.map((app) => (
                        <Grid key={app._id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card sx={{
                                borderRadius: '18px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
                                borderLeft: `4px solid ${statusColors[app.status]}`
                            }}>
                                <Box sx={{ p: 2.5, flex: 1 }}>
                                    {/* Header */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                                        <Avatar sx={{ width: 44, height: 44, background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', fontSize: '1.1rem', fontWeight: 700 }}>
                                            {app.drive?.company?.name?.charAt(0) || 'C'}
                                        </Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {app.drive?.title}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#777' }}>{app.drive?.company?.name}</Typography>
                                        </Box>
                                    </Box>

                                    {/* Status Badge */}
                                    <Box sx={{ mb: 1.5 }}>
                                        <Chip label={statusLabels[app.status]} size="small"
                                            sx={{ background: statusBg[app.status], color: statusColors[app.status], fontWeight: 700, fontSize: '0.75rem', height: 26 }} />
                                    </Box>

                                    {/* Details */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {app.drive?.packageLPA != null && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                <SalaryIcon sx={{ fontSize: 16, color: '#2E7D32' }} />
                                                <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600 }}>{app.drive.packageLPA} LPA</Typography>
                                            </Box>
                                        )}
                                        {app.drive?.location && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                <LocationIcon sx={{ fontSize: 16, color: '#999' }} />
                                                <Typography variant="caption" sx={{ color: '#777' }}>{app.drive.location}</Typography>
                                            </Box>
                                        )}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                            <CalendarIcon sx={{ fontSize: 16, color: '#999' }} />
                                            <Typography variant="caption" sx={{ color: '#777' }}>Applied: {dayjs(app.appliedAt).format('MMM D, YYYY')}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                            <WorkIcon sx={{ fontSize: 16, color: '#999' }} />
                                            <Typography variant="caption" sx={{ color: '#777' }}>{jobTypeLabel[app.drive?.jobType] || app.drive?.jobType}</Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Withdraw button — only if status is applied */}
                                {app.status === 'applied' && (
                                    <Box sx={{ px: 2.5, pb: 2 }}>
                                        <Button fullWidth variant="outlined" size="small" startIcon={<WithdrawIcon sx={{ fontSize: '16px !important' }} />}
                                            onClick={() => setWithdrawDialog({ open: true, app })}
                                            sx={{ color: '#D32F2F', borderColor: '#FFCDD2', '&:hover': { borderColor: '#EF5350', background: '#FFF5F5' }, borderRadius: '12px', py: 0.7 }}>
                                            Withdraw
                                        </Button>
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Withdraw Confirmation Dialog */}
            <Dialog open={withdrawDialog.open} onClose={() => setWithdrawDialog({ open: false, app: null })}
                maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Withdraw Application</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                        Are you sure you want to withdraw your application for <strong>{withdrawDialog.app?.drive?.title}</strong> at{' '}
                        <strong>{withdrawDialog.app?.drive?.company?.name}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setWithdrawDialog({ open: false, app: null })} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleWithdraw} disabled={withdrawing}
                        sx={{ background: 'linear-gradient(135deg, #EF5350, #C62828)', '&:hover': { background: 'linear-gradient(135deg, #C62828, #B71C1C)' } }}>
                        {withdrawing ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Withdraw'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyApplicationsPage;
