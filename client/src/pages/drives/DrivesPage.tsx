import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Button, Grid, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Alert, CircularProgress, InputAdornment, Tooltip, Avatar, MenuItem, FormControl, InputLabel,
    Select, Autocomplete,
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Work as WorkIcon, Search as SearchIcon,
    LocationOn as LocationIcon, CurrencyRupee as SalaryIcon, CalendarToday as CalendarIcon,
    People as PeopleIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { getAllDrives, createDrive, updateDrive, deleteDrive } from '../../services/driveService';
import { getAllCompanies } from '../../services/companyService';
import { getAllDepartments } from '../../services/departmentService';
import DriveDetailDialog from './DriveDetailDialog';

interface Company { _id: string; name: string; industry: string; }
interface Department { _id: string; name: string; code: string; }
interface Drive {
    _id: string; title: string;
    company: { _id: string; name: string; industry: string; logo?: string; location?: string };
    description?: string; location?: string; driveDate?: string; lastDateToApply: string;
    packageLPA?: number; jobType: string;
    eligibility: { departments?: { _id: string; name: string; code: string }[]; minCGPA?: number; maxBacklogs?: number; minTenthPercentage?: number; minTwelfthPercentage?: number; batch?: number; };
    status: string; applicantCount?: number; createdBy?: { name: string };
}

const jobTypeLabel: Record<string, string> = { full_time: 'Full Time', internship: 'Internship', both: 'Full Time + Internship' };
const statusColors: Record<string, string> = { upcoming: '#5C6BC0', ongoing: '#2E7D32', completed: '#777', cancelled: '#D32F2F' };

const emptyForm = {
    title: '', company: '', description: '', location: '', driveDate: '', lastDateToApply: '',
    packageLPA: '', jobType: 'full_time',
    eligibility: { departments: [] as string[], minCGPA: '', maxBacklogs: '', minTenthPercentage: '', minTwelfthPercentage: '', batch: '' },
    status: 'upcoming',
};

const DrivesPage = () => {
    const [drives, setDrives] = useState<Drive[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailDrive, setDetailDrive] = useState<Drive | null>(null);
    const [editingDrive, setEditingDrive] = useState<Drive | null>(null);
    const [deletingDrive, setDeletingDrive] = useState<Drive | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const { enqueueSnackbar } = useSnackbar();

    const fetchDrives = async () => {
        try {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const data = await getAllDrives(params);
            setDrives(data.drives);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchMeta = async () => {
        try {
            const [compData, deptData] = await Promise.all([getAllCompanies(), getAllDepartments()]);
            setCompanies(compData.companies);
            setDepartments(deptData.departments);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchDrives(); fetchMeta(); }, []);

    const handleSearch = () => { setLoading(true); fetchDrives(); };

    const handleOpenCreate = () => {
        setEditingDrive(null);
        setForm(emptyForm);
        setFormError('');
        setDialogOpen(true);
    };

    const handleOpenEdit = (d: Drive) => {
        setEditingDrive(d);
        setForm({
            title: d.title, company: d.company._id, description: d.description || '', location: d.location || '',
            driveDate: d.driveDate ? dayjs(d.driveDate).format('YYYY-MM-DD') : '',
            lastDateToApply: dayjs(d.lastDateToApply).format('YYYY-MM-DD'),
            packageLPA: d.packageLPA != null ? String(d.packageLPA) : '', jobType: d.jobType,
            eligibility: {
                departments: d.eligibility?.departments?.map((dept) => dept._id) || [],
                minCGPA: d.eligibility?.minCGPA != null ? String(d.eligibility.minCGPA) : '',
                maxBacklogs: d.eligibility?.maxBacklogs != null ? String(d.eligibility.maxBacklogs) : '',
                minTenthPercentage: d.eligibility?.minTenthPercentage != null ? String(d.eligibility.minTenthPercentage) : '',
                minTwelfthPercentage: d.eligibility?.minTwelfthPercentage != null ? String(d.eligibility.minTwelfthPercentage) : '',
                batch: d.eligibility?.batch != null ? String(d.eligibility.batch) : '',
            },
            status: d.status,
        });
        setFormError('');
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.company || !form.lastDateToApply) {
            setFormError('Title, Company and Last Date to Apply are required.'); return;
        }
        setSubmitting(true); setFormError('');
        try {
            const body = {
                ...form,
                packageLPA: form.packageLPA ? Number(form.packageLPA) : undefined,
                eligibility: {
                    departments: form.eligibility.departments.length > 0 ? form.eligibility.departments : undefined,
                    minCGPA: form.eligibility.minCGPA ? Number(form.eligibility.minCGPA) : undefined,
                    maxBacklogs: form.eligibility.maxBacklogs ? Number(form.eligibility.maxBacklogs) : undefined,
                    minTenthPercentage: form.eligibility.minTenthPercentage ? Number(form.eligibility.minTenthPercentage) : undefined,
                    minTwelfthPercentage: form.eligibility.minTwelfthPercentage ? Number(form.eligibility.minTwelfthPercentage) : undefined,
                    batch: form.eligibility.batch ? Number(form.eligibility.batch) : undefined,
                },
            };
            if (editingDrive) {
                await updateDrive(editingDrive._id, body);
                enqueueSnackbar('Drive updated successfully', { variant: 'success' });
            } else {
                await createDrive(body);
                enqueueSnackbar('Drive created successfully', { variant: 'success' });
            }
            setDialogOpen(false); fetchDrives();
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Something went wrong');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!deletingDrive) return;
        try {
            await deleteDrive(deletingDrive._id);
            enqueueSnackbar('Drive deleted', { variant: 'success' });
            setDeleteDialogOpen(false); fetchDrives();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed', { variant: 'error' });
        }
    };

    const filtered = drives.filter((d) =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
        (d.location || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Placement Drives</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
                    sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' } }}>
                    Create Drive
                </Button>
            </Box>

            {/* Search & Filter */}
            <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField sx={{ flex: 1, minWidth: 220 }} placeholder="Search drives by title, company, or location..." value={search}
                        onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} size="small"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Status</InputLabel>
                        <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); }}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="upcoming">Upcoming</MenuItem>
                            <MenuItem value="ongoing">Ongoing</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Card>

            {filtered.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <WorkIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No drives found</Typography>
                    <Typography variant="body2" sx={{ color: '#BBB', mt: 0.5 }}>
                        {search ? 'Try a different search term' : 'Click "Create Drive" to post a new placement drive'}
                    </Typography>
                </Card>
            ) : (
                <Grid container spacing={{ xs: 2, md: 2.5 }}>
                    {filtered.map((d) => (
                        <Grid key={d._id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card sx={{ borderRadius: '18px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                                onClick={() => setDetailDrive(d)}>
                                <Box sx={{ p: 2.5, flex: 1 }}>
                                    {/* Header */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                                            <Avatar sx={{ width: 44, height: 44, background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', fontSize: '1.1rem', fontWeight: 700 }}>
                                                {d.company?.name?.charAt(0) || 'D'}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</Typography>
                                                <Typography variant="caption" sx={{ color: '#777' }}>{d.company?.name}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.3, ml: 1 }} onClick={(e) => e.stopPropagation()}>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => handleOpenEdit(d)} sx={{ color: '#5C6BC0' }}><EditIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => { setDeletingDrive(d); setDeleteDialogOpen(true); }} sx={{ color: '#EF5350' }}><DeleteIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {/* Status & Job Type */}
                                    <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5, flexWrap: 'wrap' }}>
                                        <Chip label={d.status.replace('_', ' ')} size="small"
                                            sx={{ background: statusColors[d.status] + '18', color: statusColors[d.status], fontWeight: 600, fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }} />
                                        <Chip label={jobTypeLabel[d.jobType] || d.jobType} size="small"
                                            sx={{ background: '#E3F2FD', color: '#1565C0', fontWeight: 500, fontSize: '0.7rem', height: 22 }} />
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
                                            <CalendarIcon sx={{ fontSize: 16, color: '#999' }} />
                                            <Typography variant="caption" sx={{ color: '#777' }}>Deadline: {dayjs(d.lastDateToApply).format('MMM D, YYYY')}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                            <PeopleIcon sx={{ fontSize: 16, color: '#999' }} />
                                            <Typography variant="caption" sx={{ color: '#777' }}>{d.applicantCount ?? 0} applicant{(d.applicantCount ?? 0) !== 1 ? 's' : ''}</Typography>
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
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Detail Dialog */}
            <DriveDetailDialog open={!!detailDrive} drive={detailDrive} onClose={() => setDetailDrive(null)} />

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>{editingDrive ? 'Edit Drive' : 'Create Drive'}</DialogTitle>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2, mt: 1, borderRadius: '12px' }}>{formError}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                                placeholder="e.g. SDE Intern 2026" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth required>
                                <InputLabel>Company</InputLabel>
                                <Select value={form.company} label="Company" onChange={(e) => setForm({ ...form, company: e.target.value })}>
                                    {companies.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Package (LPA)" type="number" value={form.packageLPA}
                                onChange={(e) => setForm({ ...form, packageLPA: e.target.value })}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SalaryIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Job Type</InputLabel>
                                <Select value={form.jobType} label="Job Type" onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
                                    <MenuItem value="full_time">Full Time</MenuItem>
                                    <MenuItem value="internship">Internship</MenuItem>
                                    <MenuItem value="both">Both</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                    <MenuItem value="upcoming">Upcoming</MenuItem>
                                    <MenuItem value="ongoing">Ongoing</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocationIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField fullWidth label="Drive Date" type="date" value={form.driveDate}
                                onChange={(e) => setForm({ ...form, driveDate: e.target.value })}
                                slotProps={{ inputLabel: { shrink: true } }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField fullWidth label="Last Date to Apply" type="date" value={form.lastDateToApply} required
                                onChange={(e) => setForm({ ...form, lastDateToApply: e.target.value })}
                                slotProps={{ inputLabel: { shrink: true } }} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} />
                        </Grid>

                        {/* Eligibility Section */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A1A2E', mt: 1, mb: 0.5 }}>Eligibility Criteria (optional)</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                multiple
                                options={departments}
                                getOptionLabel={(opt) => `${opt.name} (${opt.code})`}
                                value={departments.filter((d) => form.eligibility.departments.includes(d._id))}
                                onChange={(_e, val) => setForm({ ...form, eligibility: { ...form.eligibility, departments: val.map((v) => v._id) } })}
                                renderInput={(params) => <TextField {...params} label="Eligible Departments" placeholder="Leave empty for all departments" />}
                                renderTags={(value, getTagProps) => value.map((opt, i) => <Chip {...getTagProps({ index: i })} key={opt._id} label={opt.code} size="small" sx={{ background: '#EDE7F6', color: '#5C6BC0' }} />)}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField fullWidth label="Min CGPA" type="number" value={form.eligibility.minCGPA}
                                onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, minCGPA: e.target.value } })}
                                slotProps={{ htmlInput: { step: 0.1, min: 0, max: 10 } }} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField fullWidth label="Max Backlogs" type="number" value={form.eligibility.maxBacklogs}
                                onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, maxBacklogs: e.target.value } })}
                                slotProps={{ htmlInput: { min: 0 } }} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }}>
                            <TextField fullWidth label="Min 10th %" type="number" value={form.eligibility.minTenthPercentage}
                                onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, minTenthPercentage: e.target.value } })}
                                slotProps={{ htmlInput: { min: 0, max: 100 } }} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }}>
                            <TextField fullWidth label="Min 12th %" type="number" value={form.eligibility.minTwelfthPercentage}
                                onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, minTwelfthPercentage: e.target.value } })}
                                slotProps={{ htmlInput: { min: 0, max: 100 } }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                            <TextField fullWidth label="Batch" type="number" value={form.eligibility.batch}
                                onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, batch: e.target.value } })}
                                placeholder="e.g. 2026" />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={submitting}
                        sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' } }}>
                        {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : editingDrive ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Drive</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                        Are you sure you want to delete <strong>{deletingDrive?.title}</strong>? All related applications will also be removed.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleDelete}
                        sx={{ background: 'linear-gradient(135deg, #EF5350, #C62828)', '&:hover': { background: 'linear-gradient(135deg, #C62828, #B71C1C)' } }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DrivesPage;
