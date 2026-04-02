import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Button, Grid, Chip, CircularProgress, TextField, InputAdornment,
    Avatar, FormControlLabel, Switch, Tooltip,
} from '@mui/material';
import {
    Work as WorkIcon, Search as SearchIcon, LocationOn as LocationIcon,
    CurrencyRupee as SalaryIcon, CalendarToday as CalendarIcon,
    CheckCircle as EligibleIcon, Cancel as IneligibleIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { getAllDrives, applyToDrive } from '../../services/driveService';
import DriveDetailDialog from './DriveDetailDialog';

interface Drive {
    _id: string; title: string;
    company: { _id: string; name: string; industry: string; logo?: string; location?: string };
    description?: string; location?: string; driveDate?: string; lastDateToApply: string;
    packageLPA?: number; jobType: string;
    eligibility: { departments?: { _id: string; name: string; code: string }[]; minCGPA?: number; maxBacklogs?: number; minTenthPercentage?: number; minTwelfthPercentage?: number; batch?: number; };
    status: string; applicantCount?: number;
    isEligible?: boolean; eligibilityReasons?: string[]; hasApplied?: boolean; applicationStatus?: string;
}

const jobTypeLabel: Record<string, string> = { full_time: 'Full Time', internship: 'Internship', both: 'Full Time + Internship' };
const statusColors: Record<string, string> = { upcoming: '#5C6BC0', ongoing: '#2E7D32', completed: '#777', cancelled: '#D32F2F' };

const BrowseDrivesPage = () => {
    const [drives, setDrives] = useState<Drive[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [onlyEligible, setOnlyEligible] = useState(false);
    const [detailDrive, setDetailDrive] = useState<Drive | null>(null);
    const [applying, setApplying] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchDrives = async () => {
        try {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            const data = await getAllDrives(params);
            setDrives(data.drives);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDrives(); }, []);

    const handleApply = async (driveId: string) => {
        setApplying(true);
        try {
            await applyToDrive(driveId);
            enqueueSnackbar('Applied successfully!', { variant: 'success' });
            setDetailDrive(null);
            fetchDrives();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to apply', { variant: 'error' });
        } finally { setApplying(false); }
    };

    let filtered = drives.filter((d) =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
        (d.location || '').toLowerCase().includes(search.toLowerCase())
    );
    if (onlyEligible) filtered = filtered.filter((d) => d.isEligible);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Browse Drives</Typography>
            </Box>

            {/* Search & Filter */}
            <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField sx={{ flex: 1, minWidth: 220 }} placeholder="Search drives by title, company, or location..." value={search}
                        onChange={(e) => setSearch(e.target.value)} size="small"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }}
                    />
                    <FormControlLabel
                        control={<Switch checked={onlyEligible} onChange={(e) => setOnlyEligible(e.target.checked)} color="primary" />}
                        label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Eligible only</Typography>}
                    />
                </Box>
            </Card>

            {filtered.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <WorkIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No drives found</Typography>
                    <Typography variant="body2" sx={{ color: '#BBB', mt: 0.5 }}>
                        {onlyEligible ? 'No eligible drives at the moment. Try turning off the filter.' : search ? 'Try a different search term' : 'No placement drives available right now'}
                    </Typography>
                </Card>
            ) : (
                <Grid container spacing={{ xs: 2, md: 2.5 }}>
                    {filtered.map((d) => {
                        const deadlinePassed = new Date() > new Date(d.lastDateToApply);
                        return (
                            <Grid key={d._id} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{
                                    borderRadius: '18px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer',
                                    border: d.hasApplied ? '2px solid #4CAF50' : d.isEligible ? '2px solid transparent' : '2px solid transparent',
                                    opacity: (d.status === 'cancelled' || d.status === 'completed') ? 0.65 : 1,
                                }} onClick={() => setDetailDrive(d)}>
                                    <Box sx={{ p: 2.5, flex: 1 }}>
                                        {/* Header */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                                            <Avatar sx={{ width: 44, height: 44, background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', fontSize: '1.1rem', fontWeight: 700 }}>
                                                {d.company?.name?.charAt(0) || 'D'}
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</Typography>
                                                <Typography variant="caption" sx={{ color: '#777' }}>{d.company?.name}</Typography>
                                            </Box>
                                        </Box>

                                        {/* Status & Eligibility badges */}
                                        <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5, flexWrap: 'wrap' }}>
                                            <Chip label={d.status.replace('_', ' ')} size="small"
                                                sx={{ background: statusColors[d.status] + '18', color: statusColors[d.status], fontWeight: 600, fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }} />
                                            <Chip label={jobTypeLabel[d.jobType] || d.jobType} size="small"
                                                sx={{ background: '#E3F2FD', color: '#1565C0', fontWeight: 500, fontSize: '0.7rem', height: 22 }} />
                                            {d.hasApplied ? (
                                                <Chip icon={<EligibleIcon sx={{ fontSize: '14px !important' }} />} label={`Applied · ${d.applicationStatus}`} size="small"
                                                    sx={{ background: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }} />
                                            ) : d.isEligible ? (
                                                <Chip icon={<EligibleIcon sx={{ fontSize: '14px !important' }} />} label="Eligible" size="small"
                                                    sx={{ background: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                                            ) : (
                                                <Tooltip title={d.eligibilityReasons?.join(', ') || 'Not eligible'} arrow>
                                                    <Chip icon={<IneligibleIcon sx={{ fontSize: '14px !important' }} />} label="Not Eligible" size="small"
                                                        sx={{ background: '#FFEBEE', color: '#C62828', fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                                                </Tooltip>
                                            )}
                                        </Box>

                                        {/* Details */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {d.packageLPA != null && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                    <SalaryIcon sx={{ fontSize: 16, color: '#2E7D32' }} />
                                                    <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600 }}>{d.packageLPA} LPA</Typography>
                                                </Box>
                                            )}
                                            {d.location && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                    <LocationIcon sx={{ fontSize: 16, color: '#999' }} />
                                                    <Typography variant="caption" sx={{ color: '#777' }}>{d.location}</Typography>
                                                </Box>
                                            )}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                <CalendarIcon sx={{ fontSize: 16, color: deadlinePassed ? '#D32F2F' : '#999' }} />
                                                <Typography variant="caption" sx={{ color: deadlinePassed ? '#D32F2F' : '#777', fontWeight: deadlinePassed ? 600 : 400 }}>
                                                    {deadlinePassed ? 'Deadline passed' : `Deadline: ${dayjs(d.lastDateToApply).format('MMM D, YYYY')}`}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Eligible departments */}
                                        {d.eligibility?.departments && d.eligibility.departments.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1.5 }}>
                                                {d.eligibility.departments.map((dept) => (
                                                    <Chip key={dept._id} label={dept.code} size="small" sx={{ height: 20, fontSize: '0.68rem', background: '#EDE7F6', color: '#5C6BC0' }} />
                                                ))}
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Apply Button Footer */}
                                    {d.isEligible && !d.hasApplied && !deadlinePassed && d.status !== 'cancelled' && d.status !== 'completed' && (
                                        <Box sx={{ px: 2.5, pb: 2 }} onClick={(e) => e.stopPropagation()}>
                                            <Button fullWidth variant="contained" size="small"
                                                onClick={() => handleApply(d._id)}
                                                sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' }, borderRadius: '12px', py: 0.8 }}>
                                                Apply Now
                                            </Button>
                                        </Box>
                                    )}
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Detail Dialog */}
            <DriveDetailDialog
                open={!!detailDrive} drive={detailDrive} onClose={() => setDetailDrive(null)}
                onApply={handleApply} applying={applying} showStudentActions
            />
        </Box>
    );
};

export default BrowseDrivesPage;
