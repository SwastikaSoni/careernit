import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Chip, CircularProgress, TextField, InputAdornment,
    FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, OutlinedInput,
    Checkbox, ListItemText,
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Delete as DeleteIcon,
    Edit as EditIcon, Campaign as MegaphoneIcon, PriorityHigh as UrgentIcon,
    Info as InfoIcon, Notifications as NormalIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import {
    getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
} from '../../services/announcementService';

// Lazy-load departments
import { getAllDepartments } from '../../services/departmentService';

const priorityConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    urgent: { icon: <UrgentIcon sx={{ fontSize: 18 }} />, color: '#D32F2F', bg: '#FFEBEE', label: 'Urgent' },
    important: { icon: <InfoIcon sx={{ fontSize: 18 }} />, color: '#ED6C02', bg: '#FFF3E0', label: 'Important' },
    normal: { icon: <NormalIcon sx={{ fontSize: 18 }} />, color: '#1565C0', bg: '#E3F2FD', label: 'Normal' },
};

interface Department { _id: string; name: string; }
interface Announcement {
    _id: string; title: string; message: string; priority: string;
    targetDepartments: { _id: string; name: string }[];
    targetBatches: number[]; targetRoles: string[];
    createdBy?: { name: string }; createdAt: string;
}

const AnnouncementsPage = () => {
    const { user } = useAuth();
    const isOfficer = user?.role === 'placement_officer' || user?.role === 'admin';
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<any>({
        title: '', message: '', priority: 'normal',
        targetDepartments: [] as string[], targetBatches: [] as number[], targetRoles: [] as string[],
    });
    const [submitting, setSubmitting] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });

    const { enqueueSnackbar } = useSnackbar();

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (filterPriority) params.priority = filterPriority;
            const data = await getAllAnnouncements(params);
            setAnnouncements(data.announcements);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchAnnouncements();
        if (isOfficer) {
            getAllDepartments().then((d: any) => setDepartments(d.departments)).catch(console.error);
        }
    }, [filterPriority]);

    const openCreate = () => {
        setEditing(null);
        setForm({ title: '', message: '', priority: 'normal', targetDepartments: [], targetBatches: [], targetRoles: [] });
        setDialogOpen(true);
    };

    const openEdit = (a: Announcement) => {
        setEditing(a._id);
        setForm({
            title: a.title, message: a.message, priority: a.priority,
            targetDepartments: a.targetDepartments.map((d) => d._id),
            targetBatches: a.targetBatches, targetRoles: a.targetRoles,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.message.trim()) return;
        setSubmitting(true);
        try {
            if (editing) {
                await updateAnnouncement(editing, form);
                enqueueSnackbar('Announcement updated', { variant: 'success' });
            } else {
                await createAnnouncement(form);
                enqueueSnackbar('Announcement created', { variant: 'success' });
            }
            setDialogOpen(false);
            fetchAnnouncements();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to save', { variant: 'error' });
        } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        try {
            await deleteAnnouncement(deleteDialog.id);
            enqueueSnackbar('Announcement deleted', { variant: 'success' });
            setDeleteDialog({ open: false, id: '' });
            fetchAnnouncements();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to delete', { variant: 'error' });
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1) return 'Just now';
        if (min < 60) return `${min}m ago`;
        const hrs = Math.floor(min / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    const filtered = announcements.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.message.toLowerCase().includes(search.toLowerCase())
    );

    const currentYear = new Date().getFullYear();
    const batchOptions = Array.from({ length: 6 }, (_, i) => currentYear + i - 2);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Announcements</Typography>
                {isOfficer && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
                        sx={{ borderRadius: '14px', background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', px: 3 }}>
                        New Announcement
                    </Button>
                )}
            </Box>

            {/* Filters */}
            <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select value={filterPriority} label="Priority" onChange={(e) => setFilterPriority(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="urgent">Urgent</MenuItem>
                            <MenuItem value="important">Important</MenuItem>
                            <MenuItem value="normal">Normal</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField sx={{ flex: 1, minWidth: 200 }} placeholder="Search announcements..." value={search}
                        onChange={(e) => setSearch(e.target.value)} size="small"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }} />
                </Box>
            </Card>

            {/* Announcements Feed */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>
            ) : filtered.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <MegaphoneIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No announcements</Typography>
                </Card>
            ) : (
                <Box sx={{ position: 'relative', pl: 3 }}>
                    {/* Timeline line */}
                    <Box sx={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, #5C6BC0, #E0E0E0)' }} />

                    {filtered.map((a) => {
                        const cfg = priorityConfig[a.priority] || priorityConfig.normal;
                        return (
                            <Box key={a._id} sx={{ position: 'relative', mb: 2.5 }}>
                                {/* Timeline dot */}
                                <Box sx={{
                                    position: 'absolute', left: -19, top: 18, width: 18, height: 18,
                                    borderRadius: '50%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 0 0 3px ${cfg.bg}`,
                                }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                                </Box>

                                <Card sx={{
                                    borderRadius: '16px', overflow: 'hidden',
                                    borderLeft: `4px solid ${cfg.color}`,
                                    transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
                                }}>
                                    <Box sx={{ p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Chip icon={cfg.icon} label={cfg.label} size="small"
                                                        sx={{ fontSize: '0.7rem', height: 22, background: cfg.bg, color: cfg.color, fontWeight: 700 }} />
                                                    <Typography variant="caption" sx={{ color: '#999' }}>{timeAgo(a.createdAt)}</Typography>
                                                    {a.createdBy && <Typography variant="caption" sx={{ color: '#BBB' }}>by {a.createdBy.name}</Typography>}
                                                </Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.4 }}>{a.title}</Typography>
                                            </Box>
                                            {isOfficer && (
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(a)} sx={{ color: '#5C6BC0' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: a._id })} sx={{ color: '#D32F2F' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                </Box>
                                            )}
                                        </Box>

                                        <Typography variant="body2" sx={{ mt: 1, color: '#555', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{a.message}</Typography>

                                        {/* Target badges */}
                                        {isOfficer && (a.targetDepartments.length > 0 || a.targetBatches.length > 0 || a.targetRoles.length > 0) && (
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1.5 }}>
                                                {a.targetDepartments.map((d) => <Chip key={d._id} label={d.name} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />)}
                                                {a.targetBatches.map((b) => <Chip key={b} label={`Batch ${b}`} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />)}
                                                {a.targetRoles.map((r) => <Chip key={r} label={r} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20, textTransform: 'capitalize' }} />)}
                                            </Box>
                                        )}
                                    </Box>
                                </Card>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
                <DialogContent sx={{ pt: '8px !important' }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Message" value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })} multiline rows={4} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Priority</InputLabel>
                                <Select value={form.priority} label="Priority" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                    <MenuItem value="normal">🔵 Normal</MenuItem>
                                    <MenuItem value="important">🟠 Important</MenuItem>
                                    <MenuItem value="urgent">🔴 Urgent</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Targeting */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#555', mb: 1, display: 'block' }}>
                                Target Audience <span style={{ color: '#999', fontWeight: 400 }}>(leave empty for everyone)</span>
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Departments</InputLabel>
                                <Select multiple value={form.targetDepartments} input={<OutlinedInput label="Departments" />}
                                    onChange={(e) => setForm({ ...form, targetDepartments: e.target.value })}
                                    renderValue={(sel: string[]) => departments.filter((d) => sel.includes(d._id)).map((d) => d.name).join(', ')}>
                                    {departments.map((d) => (
                                        <MenuItem key={d._id} value={d._id}>
                                            <Checkbox checked={form.targetDepartments.includes(d._id)} size="small" />
                                            <ListItemText primary={d.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Batches</InputLabel>
                                <Select multiple value={form.targetBatches} input={<OutlinedInput label="Batches" />}
                                    onChange={(e) => setForm({ ...form, targetBatches: e.target.value })}
                                    renderValue={(sel: number[]) => sel.map((b) => `${b}`).join(', ')}>
                                    {batchOptions.map((b) => (
                                        <MenuItem key={b} value={b}>
                                            <Checkbox checked={form.targetBatches.includes(b)} size="small" />
                                            <ListItemText primary={b} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Roles</InputLabel>
                                <Select multiple value={form.targetRoles} input={<OutlinedInput label="Roles" />}
                                    onChange={(e) => setForm({ ...form, targetRoles: e.target.value })}
                                    renderValue={(sel: string[]) => sel.join(', ')}>
                                    {['student', 'placement_officer', 'admin'].map((r) => (
                                        <MenuItem key={r} value={r}>
                                            <Checkbox checked={form.targetRoles.includes(r)} size="small" />
                                            <ListItemText primary={r.replace('_', ' ')} sx={{ textTransform: 'capitalize' }} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={submitting}
                        sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)' }}>
                        {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : editing ? 'Update' : 'Publish'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: '' })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Announcement</DialogTitle>
                <DialogContent><Typography variant="body2" sx={{ color: '#555' }}>This announcement will be permanently removed.</Typography></DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, id: '' })} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleDelete} sx={{ background: 'linear-gradient(135deg, #EF5350, #C62828)' }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AnnouncementsPage;
