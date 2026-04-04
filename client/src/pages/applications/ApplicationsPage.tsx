import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Grid, Chip, CircularProgress, TextField, InputAdornment,
    FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Tooltip, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Avatar,
} from '@mui/material';
import {
    Search as SearchIcon, ThumbUp as ShortlistIcon,
    ThumbDown as RejectIcon, Undo as UndoIcon, Work as WorkIcon,
    People as PeopleIcon, DoNotDisturb as RejectedIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { getAllDrives, getAllApplications, updateApplicationStatus } from '../../services/driveService';

interface Drive { _id: string; title: string; company: { name: string }; status: string; }
interface Student {
    _id: string; name: string; email: string; rollNumber?: string;
    department?: { name: string; code: string }; cgpa?: number; phone?: string; batch?: number;
}
interface Application {
    _id: string; drive: { _id: string; title: string; company: { name: string; logo?: string }; status: string };
    student: Student; status: string; appliedAt: string;
}
interface Counts { total: number; applied: number; shortlisted: number; rejected: number; selected: number; }

const statusColors: Record<string, string> = {
    applied: '#1565C0', shortlisted: '#ED6C02', rejected: '#D32F2F',
};
const statusBg: Record<string, string> = {
    applied: '#E3F2FD', shortlisted: '#FFF3E0', rejected: '#FFEBEE',
};

const ApplicationsPage = () => {
    const [drives, setDrives] = useState<Drive[]>([]);
    const [selectedDrive, setSelectedDrive] = useState('');
    const [applications, setApplications] = useState<Application[]>([]);
    const [counts, setCounts] = useState<Counts>({ total: 0, applied: 0, shortlisted: 0, rejected: 0, selected: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; appId: string; action: string; studentName: string }>({ open: false, appId: '', action: '', studentName: '' });
    const [updating, setUpdating] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchDrives = async () => {
            try {
                const data = await getAllDrives();
                setDrives(data.drives);
            } catch (err) { console.error(err); }
        };
        fetchDrives();
    }, []);

    const fetchApplications = async (driveId?: string) => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (driveId || selectedDrive) params.drive = driveId || selectedDrive;
            if (statusFilter) params.status = statusFilter;
            if (search) params.search = search;
            const data = await getAllApplications(params);
            setApplications(data.applications);
            setCounts(data.counts);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchApplications(); }, [selectedDrive, statusFilter]);

    const handleStatusUpdate = async () => {
        setUpdating(true);
        try {
            await updateApplicationStatus(confirmDialog.appId, confirmDialog.action);
            enqueueSnackbar(`Application ${confirmDialog.action} successfully`, { variant: 'success' });
            setConfirmDialog({ open: false, appId: '', action: '', studentName: '' });
            fetchApplications();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to update', { variant: 'error' });
        } finally { setUpdating(false); }
    };

    const openConfirm = (appId: string, action: string, studentName: string) => {
        setConfirmDialog({ open: true, appId, action, studentName });
    };

    const filtered = applications.filter((a) =>
        a.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.student?.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
        a.student?.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDownloadCSV = () => {
        if (!selectedDrive) {
            enqueueSnackbar('Please filter by a specific drive first to download applicants', { variant: 'warning' });
            return;
        }

        const headers = ['Name', 'Email', 'Roll Number', 'Department', 'Phone', 'Batch', 'CGPA', '10th %', '12th %', 'Active Backlogs', 'Status', 'Resume Link'];
        const rows = filtered.map(app => {
            const s = app.student as any || {};
            const resumeLink = s.resume ? `http://localhost:5000${s.resume}` : 'No Resume';
            return [
                s.name || '',
                s.email || '',
                s.rollNumber || '',
                s.department?.name || '',
                s.phone || '',
                s.batch || '',
                s.cgpa || '',
                s.tenthPercentage || '',
                s.twelfthPercentage || '',
                s.activeBacklogs || '0',
                app.status,
                resumeLink
            ].map(col => `"${String(col).replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);

        const driveTitle = drives.find(d => d._id === selectedDrive)?.title || 'Drive';
        link.setAttribute('download', `Applicants_${driveTitle.replace(/\s+/g, '_')}.csv`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Applications</Typography>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadCSV} sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 600 }}>
                    Download CSV
                </Button>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'Total', value: counts.total, color: '#5C6BC0', icon: <PeopleIcon /> },
                    { label: 'Applied', value: counts.applied, color: '#1565C0', icon: <WorkIcon /> },
                    { label: 'Shortlisted', value: counts.shortlisted, color: '#ED6C02', icon: <ShortlistIcon /> },
                    { label: 'Rejected', value: counts.rejected, color: '#D32F2F', icon: <RejectedIcon /> },
                ].map((s) => (
                    <Grid key={s.label} size={{ xs: 6, sm: 4, md: 2.4 }}>
                        <Card sx={{ p: 2, borderRadius: '16px', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
                            <Box sx={{ color: s.color, mb: 0.5 }}>{s.icon}</Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: s.color }}>{s.value}</Typography>
                            <Typography variant="caption" sx={{ color: '#888', fontWeight: 500 }}>{s.label}</Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Filters */}
            <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 240 }}>
                        <InputLabel>Filter by Drive</InputLabel>
                        <Select value={selectedDrive} label="Filter by Drive" onChange={(e) => setSelectedDrive(e.target.value)}>
                            <MenuItem value="">All Drives</MenuItem>
                            {drives.map((d) => <MenuItem key={d._id} value={d._id}>{d.title} — {d.company?.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Status</InputLabel>
                        <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="applied">Applied</MenuItem>
                            <MenuItem value="shortlisted">Shortlisted</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField sx={{ flex: 1, minWidth: 200 }} placeholder="Search by name, roll number, or email..."
                        value={search} onChange={(e) => setSearch(e.target.value)} size="small"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }}
                    />
                </Box>
            </Card>

            {/* Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>
            ) : filtered.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <PeopleIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No applications found</Typography>
                    <Typography variant="body2" sx={{ color: '#BBB', mt: 0.5 }}>
                        {selectedDrive ? 'No applications for this drive yet' : 'Select a drive or wait for students to apply'}
                    </Typography>
                </Card>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: '#F8F9FE' }}>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Student</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>CGPA</TableCell>
                                {!selectedDrive && <TableCell sx={{ fontWeight: 700, color: '#555' }}>Drive</TableCell>}
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Applied</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((app) => (
                                <TableRow key={app._id} sx={{ '&:hover': { background: '#FAFBFF' } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 34, height: 34, background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', fontSize: '0.85rem', fontWeight: 700 }}>
                                                {app.student?.name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{app.student?.name}</Typography>
                                                <Typography variant="caption" sx={{ color: '#888' }}>{app.student?.rollNumber || app.student?.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={(app.student as any)?.department?.code || '—'} size="small"
                                            sx={{ background: '#EDE7F6', color: '#5C6BC0', fontSize: '0.72rem', height: 22 }} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{app.student?.cgpa ?? '—'}</Typography>
                                    </TableCell>
                                    {!selectedDrive && (
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{app.drive?.title}</Typography>
                                            <Typography variant="caption" sx={{ color: '#888' }}>{app.drive?.company?.name}</Typography>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Typography variant="caption" sx={{ color: '#777' }}>{dayjs(app.appliedAt).format('MMM D, YYYY')}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={app.status} size="small"
                                            sx={{ background: statusBg[app.status], color: statusColors[app.status], fontWeight: 600, fontSize: '0.72rem', height: 24, textTransform: 'capitalize' }} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.3 }}>
                                            {app.status !== 'shortlisted' && (
                                                <Tooltip title="Shortlist">
                                                    <IconButton size="small" onClick={() => openConfirm(app._id, 'shortlisted', app.student?.name)}
                                                        sx={{ color: '#ED6C02' }}><ShortlistIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                            )}
                                            {app.status !== 'rejected' && (
                                                <Tooltip title="Reject">
                                                    <IconButton size="small" onClick={() => openConfirm(app._id, 'rejected', app.student?.name)}
                                                        sx={{ color: '#D32F2F' }}><RejectIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                            )}
                                            {app.status !== 'applied' && (
                                                <Tooltip title="Reset to Applied">
                                                    <IconButton size="small" onClick={() => openConfirm(app._id, 'applied', app.student?.name)}
                                                        sx={{ color: '#888' }}><UndoIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Confirm Dialog */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, appId: '', action: '', studentName: '' })}
                maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Confirm {confirmDialog.action === 'applied' ? 'Reset' : confirmDialog.action.charAt(0).toUpperCase() + confirmDialog.action.slice(1)}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                        {confirmDialog.action === 'applied'
                            ? <>Are you sure you want to reset <strong>{confirmDialog.studentName}</strong>'s application back to "Applied"?</>
                            : <>Are you sure you want to mark <strong>{confirmDialog.studentName}</strong> as <strong>{confirmDialog.action}</strong>?</>
                        }
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setConfirmDialog({ open: false, appId: '', action: '', studentName: '' })} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleStatusUpdate} disabled={updating}
                        sx={{
                            background: confirmDialog.action === 'rejected'
                                ? 'linear-gradient(135deg, #EF5350, #C62828)'
                                : 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
                            '&:hover': {
                                background: confirmDialog.action === 'rejected'
                                    ? 'linear-gradient(135deg, #C62828, #B71C1C)'
                                    : 'linear-gradient(135deg, #7E57C2, #9575CD)',
                            },
                        }}>
                        {updating ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ApplicationsPage;
