import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Grid, Chip, CircularProgress, TextField, InputAdornment,
    FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Tooltip, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Avatar, Stepper, Step, StepLabel,
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Delete as DeleteIcon,
    Event as EventIcon, CheckCircle as PassIcon, Cancel as FailIcon,
    HourglassEmpty as PendingIcon, Visibility as ViewIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { getAllInterviews, createInterview, updateInterviewRound, addInterviewRound, deleteInterview } from '../../services/interviewService';
import { getDriveApplicants, getAllDrives } from '../../services/driveService';

const roundTypeLabels: Record<string, string> = {
    technical: 'Technical', hr: 'HR', group_discussion: 'Group Discussion',
    aptitude: 'Aptitude', coding: 'Coding', other: 'Other',
};
const roundTypes = ['technical', 'hr', 'group_discussion', 'aptitude', 'coding', 'other'];
const resultColors: Record<string, string> = { pending: '#757575', passed: '#2E7D32', failed: '#D32F2F' };
const statusColors: Record<string, string> = { scheduled: '#1565C0', in_progress: '#ED6C02', completed: '#2E7D32', cancelled: '#9E9E9E' };
const statusLabels: Record<string, string> = { scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };

interface Drive { _id: string; title: string; company: { name: string }; }
interface Applicant { _id: string; student: { _id: string; name: string; email: string; rollNumber?: string; department?: { name: string; code: string }; cgpa?: number }; status: string; }
interface Round { roundNumber: number; roundType: string; scheduledDate?: string; venue?: string; interviewerName?: string; result: string; feedback?: string; }
interface Interview {
    _id: string; drive: { _id: string; title: string; company: { name: string; logo?: string } };
    student: { _id: string; name: string; email: string; rollNumber?: string; department?: { name: string; code: string }; cgpa?: number };
    rounds: Round[]; status: string; createdAt: string;
}

const emptyRound = { roundType: 'technical', scheduledDate: '', venue: '', interviewerName: '', result: 'pending', feedback: '' };

const InterviewsPage = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [drives, setDrives] = useState<Drive[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDrive, setFilterDrive] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Schedule dialog
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [selectedDriveId, setSelectedDriveId] = useState('');
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [selectedAppId, setSelectedAppId] = useState('');
    const [rounds, setRounds] = useState<any[]>([{ ...emptyRound }]);
    const [submitting, setSubmitting] = useState(false);

    // Round update dialog
    const [roundDialog, setRoundDialog] = useState<{ open: boolean; interview: Interview | null; roundIdx: number }>({ open: false, interview: null, roundIdx: -1 });
    const [roundForm, setRoundForm] = useState<any>({});

    // View dialog
    const [viewDialog, setViewDialog] = useState<{ open: boolean; interview: Interview | null }>({ open: false, interview: null });

    // Add next round dialog
    const [addRoundDialog, setAddRoundDialog] = useState<{ open: boolean; interviewId: string; nextRoundNum: number }>({ open: false, interviewId: '', nextRoundNum: 1 });
    const [addRoundForm, setAddRoundForm] = useState<any>({ roundType: 'technical', scheduledDate: '', venue: '', interviewerName: '' });

    // Delete dialog
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });

    const { enqueueSnackbar } = useSnackbar();

    const fetchAll = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (filterDrive) params.drive = filterDrive;
            if (filterStatus) params.status = filterStatus;
            const data = await getAllInterviews(params);
            setInterviews(data.interviews);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const fetchDrives = async () => {
            try { const d = await getAllDrives(); setDrives(d.drives); } catch (e) { console.error(e); }
        };
        fetchDrives();
    }, []);

    useEffect(() => { fetchAll(); }, [filterDrive, filterStatus]);

    const handleDriveSelect = async (driveId: string) => {
        setSelectedDriveId(driveId);
        setSelectedAppId('');
        if (driveId) {
            try {
                const data = await getDriveApplicants(driveId);
                setApplicants(data.applicants);
            } catch (e) { console.error(e); }
        } else { setApplicants([]); }
    };

    const addRound = () => setRounds([...rounds, { ...emptyRound }]);
    const removeRound = (i: number) => setRounds(rounds.filter((_, idx) => idx !== i));

    const handleSchedule = async () => {
        if (!selectedAppId || rounds.length === 0) return;
        setSubmitting(true);
        try {
            await createInterview({ application: selectedAppId, rounds });
            enqueueSnackbar('Interview scheduled successfully', { variant: 'success' });
            setScheduleOpen(false);
            setRounds([{ ...emptyRound }]);
            setSelectedAppId('');
            setSelectedDriveId('');
            fetchAll();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to schedule', { variant: 'error' });
        } finally { setSubmitting(false); }
    };

    const handleRoundUpdate = async () => {
        if (!roundDialog.interview) return;
        setSubmitting(true);
        try {
            await updateInterviewRound(roundDialog.interview._id, roundDialog.roundIdx, roundForm);
            enqueueSnackbar('Round updated', { variant: 'success' });
            setRoundDialog({ open: false, interview: null, roundIdx: -1 });
            fetchAll();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to update', { variant: 'error' });
        } finally { setSubmitting(false); }
    };

    const handleAddNextRound = async () => {
        setSubmitting(true);
        try {
            await addInterviewRound(addRoundDialog.interviewId, addRoundForm);
            enqueueSnackbar(`Round ${addRoundDialog.nextRoundNum} added successfully`, { variant: 'success' });
            setAddRoundDialog({ open: false, interviewId: '', nextRoundNum: 1 });
            setAddRoundForm({ roundType: 'technical', scheduledDate: '', venue: '', interviewerName: '' });
            fetchAll();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to add round', { variant: 'error' });
        } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        try {
            await deleteInterview(deleteDialog.id);
            enqueueSnackbar('Interview deleted', { variant: 'success' });
            setDeleteDialog({ open: false, id: '' });
            fetchAll();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to delete', { variant: 'error' });
        }
    };

    // Check if we can add a next round (last round must be passed)
    const canAddNextRound = (intv: Interview) => {
        if (intv.rounds.length === 0) return false;
        const lastRound = intv.rounds[intv.rounds.length - 1];
        return lastRound.result === 'passed' && intv.status !== 'completed' && intv.status !== 'cancelled';
    };

    const filtered = interviews.filter((i) =>
        i.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.student?.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
        i.drive?.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Interviews</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setScheduleOpen(true)}
                    sx={{ borderRadius: '14px', background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', px: 3 }}>
                    Schedule Interview
                </Button>
            </Box>

            {/* Filters */}
            <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Drive</InputLabel>
                        <Select value={filterDrive} label="Drive" onChange={(e) => setFilterDrive(e.target.value)}>
                            <MenuItem value="">All Drives</MenuItem>
                            {drives.map((d) => <MenuItem key={d._id} value={d._id}>{d.title}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Status</InputLabel>
                        <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="scheduled">Scheduled</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField sx={{ flex: 1, minWidth: 200 }} placeholder="Search student or drive..." value={search}
                        onChange={(e) => setSearch(e.target.value)} size="small"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }} />
                </Box>
            </Card>

            {/* Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>
            ) : filtered.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <EventIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No interviews scheduled</Typography>
                    <Typography variant="body2" sx={{ color: '#BBB', mt: 0.5 }}>Schedule interviews for shortlisted students</Typography>
                </Card>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: '#F8F9FE' }}>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Student</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Drive</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Rounds</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((intv) => (
                                <TableRow key={intv._id} sx={{ '&:hover': { background: '#FAFBFF' } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 34, height: 34, background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', fontSize: '0.85rem', fontWeight: 700 }}>
                                                {intv.student?.name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{intv.student?.name}</Typography>
                                                <Typography variant="caption" sx={{ color: '#888' }}>{intv.student?.rollNumber}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{intv.drive?.title}</Typography>
                                        <Typography variant="caption" sx={{ color: '#888' }}>{intv.drive?.company?.name}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                            {intv.rounds.map((r, i) => (
                                                <Tooltip key={i} title={`${roundTypeLabels[r.roundType]} — ${r.result}. Click to update.`}>
                                                    <Chip label={`R${r.roundNumber}`} size="small"
                                                        onClick={() => { setRoundDialog({ open: true, interview: intv, roundIdx: i }); setRoundForm({ ...r }); }}
                                                        sx={{
                                                            background: r.result === 'passed' ? '#E8F5E9' : r.result === 'failed' ? '#FFEBEE' : '#F5F5F5',
                                                            color: resultColors[r.result], fontWeight: 600, fontSize: '0.7rem', height: 22, cursor: 'pointer'
                                                        }} />
                                                </Tooltip>
                                            ))}
                                            {canAddNextRound(intv) && (
                                                <Tooltip title="Add Next Round">
                                                    <Chip label="+" size="small"
                                                        onClick={() => {
                                                            setAddRoundDialog({ open: true, interviewId: intv._id, nextRoundNum: intv.rounds.length + 1 });
                                                            setAddRoundForm({ roundType: 'technical', scheduledDate: '', venue: '', interviewerName: '' });
                                                        }}
                                                        sx={{
                                                            background: '#E3F2FD', color: '#1565C0', fontWeight: 700, fontSize: '0.85rem', height: 22, cursor: 'pointer',
                                                            '&:hover': { background: '#BBDEFB' }
                                                        }} />
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={statusLabels[intv.status]} size="small"
                                            sx={{ background: `${statusColors[intv.status]}14`, color: statusColors[intv.status], fontWeight: 600, fontSize: '0.72rem', height: 24 }} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="View Details">
                                            <IconButton size="small" onClick={() => setViewDialog({ open: true, interview: intv })} sx={{ color: '#5C6BC0' }}>
                                                <ViewIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: intv._id })} sx={{ color: '#D32F2F' }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Schedule Interview Dialog */}
            <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Schedule Interview</DialogTitle>
                <DialogContent sx={{ pt: '8px !important' }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Select Drive</InputLabel>
                            <Select value={selectedDriveId} label="Select Drive" onChange={(e) => handleDriveSelect(e.target.value)}>
                                {drives.map((d) => <MenuItem key={d._id} value={d._id}>{d.title} — {d.company?.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>Select Applicant</InputLabel>
                            <Select value={selectedAppId} label="Select Applicant" onChange={(e) => setSelectedAppId(e.target.value)} disabled={!selectedDriveId}>
                                {applicants.map((a) => (
                                    <MenuItem key={a._id} value={a._id}>
                                        {a.student?.name} ({a.student?.rollNumber || a.student?.email}) — {a.status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Interview Rounds</Typography>
                    {rounds.map((r, i) => (
                        <Card key={i} sx={{ p: 2, mb: 1.5, borderRadius: '12px', background: '#FAFBFF' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#5C6BC0' }}>Round {i + 1}</Typography>
                                {rounds.length > 1 && (
                                    <IconButton size="small" onClick={() => removeRound(i)} sx={{ color: '#D32F2F' }}><DeleteIcon fontSize="small" /></IconButton>
                                )}
                            </Box>
                            <Grid container spacing={1.5}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Type</InputLabel>
                                        <Select value={r.roundType} label="Type" onChange={(e) => { const u = [...rounds]; u[i].roundType = e.target.value; setRounds(u); }}>
                                            {roundTypes.map((t) => <MenuItem key={t} value={t}>{roundTypeLabels[t]}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField fullWidth size="small" label="Date & Time" type="datetime-local" value={r.scheduledDate || ''}
                                        onChange={(e) => { const u = [...rounds]; u[i].scheduledDate = e.target.value; setRounds(u); }}
                                        slotProps={{ inputLabel: { shrink: true } }} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField fullWidth size="small" label="Venue / Link" value={r.venue || ''}
                                        onChange={(e) => { const u = [...rounds]; u[i].venue = e.target.value; setRounds(u); }} />
                                </Grid>
                            </Grid>
                        </Card>
                    ))}
                    <Button size="small" startIcon={<AddIcon />} onClick={addRound} sx={{ mt: 0.5, color: '#5C6BC0' }}>Add Round</Button>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setScheduleOpen(false)} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSchedule} disabled={submitting || !selectedAppId}
                        sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)' }}>
                        {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Round Update Dialog */}
            <Dialog open={roundDialog.open} onClose={() => setRoundDialog({ open: false, interview: null, roundIdx: -1 })}
                maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Update Round {roundDialog.roundIdx + 1} — {roundTypeLabels[roundForm.roundType] || ''}
                </DialogTitle>
                <DialogContent sx={{ pt: '8px !important' }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Result</InputLabel>
                                <Select value={roundForm.result || 'pending'} label="Result" onChange={(e) => setRoundForm({ ...roundForm, result: e.target.value })}>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="passed">Passed</MenuItem>
                                    <MenuItem value="failed">Failed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth size="small" label="Interviewer Name" value={roundForm.interviewerName || ''}
                                onChange={(e) => setRoundForm({ ...roundForm, interviewerName: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth size="small" label="Date & Time" type="datetime-local" value={roundForm.scheduledDate ? dayjs(roundForm.scheduledDate).format('YYYY-MM-DDTHH:mm') : ''}
                                onChange={(e) => setRoundForm({ ...roundForm, scheduledDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth size="small" label="Venue / Link" value={roundForm.venue || ''}
                                onChange={(e) => setRoundForm({ ...roundForm, venue: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Feedback" multiline rows={3} value={roundForm.feedback || ''}
                                onChange={(e) => setRoundForm({ ...roundForm, feedback: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setRoundDialog({ open: false, interview: null, roundIdx: -1 })} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleRoundUpdate} disabled={submitting}
                        sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)' }}>
                        {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Interview Detail Dialog */}
            <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, interview: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Interview Details</DialogTitle>
                {viewDialog.interview && (
                    <DialogContent>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: '#888', mb: 0.3 }}>Student</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{viewDialog.interview.student?.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#999' }}>{viewDialog.interview.student?.rollNumber} • {(viewDialog.interview.student as any)?.department?.name}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: '#888', mb: 0.3 }}>Drive</Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{viewDialog.interview.drive?.title}</Typography>
                            <Typography variant="caption" sx={{ color: '#999' }}>{viewDialog.interview.drive?.company?.name}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>Rounds</Typography>
                        <Stepper orientation="vertical" activeStep={-1} sx={{ mb: 1 }}>
                            {viewDialog.interview.rounds.map((r, i) => (
                                <Step key={i} completed={r.result === 'passed'}>
                                    <StepLabel
                                        error={r.result === 'failed'}
                                        icon={r.result === 'passed' ? <PassIcon sx={{ color: '#2E7D32' }} /> : r.result === 'failed' ? <FailIcon sx={{ color: '#D32F2F' }} /> : <PendingIcon sx={{ color: '#9E9E9E' }} />}
                                    >
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Round {r.roundNumber}: {roundTypeLabels[r.roundType]}</Typography>
                                            {r.scheduledDate && <Typography variant="caption" sx={{ color: '#888' }}>{dayjs(r.scheduledDate).format('MMM D, YYYY h:mm A')}</Typography>}
                                            {r.venue && <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>📍 {r.venue}</Typography>}
                                            {r.interviewerName && <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>👤 {r.interviewerName}</Typography>}
                                            {r.feedback && <Typography variant="caption" sx={{ color: '#555', display: 'block', mt: 0.5, fontStyle: 'italic' }}>"{r.feedback}"</Typography>}
                                        </Box>
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </DialogContent>
                )}
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setViewDialog({ open: false, interview: null })} sx={{ color: '#888' }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Add Next Round Dialog */}
            <Dialog open={addRoundDialog.open} onClose={() => setAddRoundDialog({ open: false, interviewId: '', nextRoundNum: 1 })}
                maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Add Round {addRoundDialog.nextRoundNum}</DialogTitle>
                <DialogContent sx={{ pt: '8px !important' }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Round Type</InputLabel>
                                <Select value={addRoundForm.roundType} label="Round Type" onChange={(e) => setAddRoundForm({ ...addRoundForm, roundType: e.target.value })}>
                                    {roundTypes.map((t) => <MenuItem key={t} value={t}>{roundTypeLabels[t]}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth size="small" label="Date & Time" type="datetime-local" value={addRoundForm.scheduledDate || ''}
                                onChange={(e) => setAddRoundForm({ ...addRoundForm, scheduledDate: e.target.value })}
                                slotProps={{ inputLabel: { shrink: true } }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth size="small" label="Venue / Link" value={addRoundForm.venue || ''}
                                onChange={(e) => setAddRoundForm({ ...addRoundForm, venue: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth size="small" label="Interviewer Name" value={addRoundForm.interviewerName || ''}
                                onChange={(e) => setAddRoundForm({ ...addRoundForm, interviewerName: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setAddRoundDialog({ open: false, interviewId: '', nextRoundNum: 1 })} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddNextRound} disabled={submitting}
                        sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)' }}>
                        {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : `Add Round ${addRoundDialog.nextRoundNum}`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: '' })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Interview</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#555' }}>Are you sure you want to delete this interview? This cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, id: '' })} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleDelete} sx={{ background: 'linear-gradient(135deg, #EF5350, #C62828)' }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InterviewsPage;
