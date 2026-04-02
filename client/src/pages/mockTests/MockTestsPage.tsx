import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Chip, CircularProgress, TextField, InputAdornment,
    FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Tooltip, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, Switch, FormControlLabel, Checkbox, List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Delete as DeleteIcon,
    Edit as EditIcon, Assignment as TestIcon, Publish as PublishIcon,
    Quiz as QuizIcon, Code as CodeIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getAllMockTests, createMockTest, updateMockTest, deleteMockTest } from '../../services/mockTestService';
import { getAllQuestions } from '../../services/questionService';

const testTypeLabels: Record<string, string> = { aptitude: 'Aptitude', coding: 'Coding', mixed: 'Mixed' };
const testTypeColors: Record<string, string> = { aptitude: '#7B1FA2', coding: '#1565C0', mixed: '#ED6C02' };

interface Question { _id: string; title: string; questionType: string; category: string; difficulty: string; topic?: string; }
interface MockTest {
    _id: string; title: string; description?: string; testType: string;
    questions: any[]; duration: number; totalMarks: number; passingMarks: number;
    isPublished: boolean; createdBy?: { name: string };
}

const MockTestsPage = () => {
    const [tests, setTests] = useState<MockTest[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<any>({ title: '', description: '', testType: 'aptitude', duration: 30, totalMarks: 100, passingMarks: 40, isPublished: false });
    const [selectedQs, setSelectedQs] = useState<string[]>([]);
    const [qSearch, setQSearch] = useState('');
    const [qFilterType, setQFilterType] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });

    const { enqueueSnackbar } = useSnackbar();

    const fetchTests = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (filterType) params.testType = filterType;
            const data = await getAllMockTests(params);
            setTests(data.tests);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchQuestions = async () => {
        try { const d = await getAllQuestions(); setQuestions(d.questions); } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchTests(); fetchQuestions(); }, [filterType]);

    const openCreate = () => {
        setEditing(null); setSelectedQs([]);
        setForm({ title: '', description: '', testType: 'aptitude', duration: 30, totalMarks: 100, passingMarks: 40, isPublished: false });
        setDialogOpen(true);
    };

    const openEdit = (t: MockTest) => {
        setEditing(t._id);
        setForm({ title: t.title, description: t.description || '', testType: t.testType, duration: t.duration, totalMarks: t.totalMarks, passingMarks: t.passingMarks, isPublished: t.isPublished });
        setSelectedQs(t.questions.map((q: any) => q._id || q));
        setDialogOpen(true);
    };

    const toggleQuestion = (id: string) => {
        setSelectedQs((prev: string[]) => prev.includes(id) ? prev.filter((q: string) => q !== id) : [...prev, id]);
    };

    const handleSave = async () => {
        if (!form.title.trim() || selectedQs.length === 0) return;
        setSubmitting(true);
        try {
            const body = { ...form, questions: selectedQs };
            if (editing) {
                await updateMockTest(editing, body);
                enqueueSnackbar('Test updated', { variant: 'success' });
            } else {
                await createMockTest(body);
                enqueueSnackbar('Test created', { variant: 'success' });
            }
            setDialogOpen(false);
            fetchTests();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to save', { variant: 'error' });
        } finally { setSubmitting(false); }
    };

    const handleTogglePublish = async (t: MockTest) => {
        try {
            await updateMockTest(t._id, { isPublished: !t.isPublished });
            enqueueSnackbar(t.isPublished ? 'Test unpublished' : 'Test published', { variant: 'success' });
            fetchTests();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed', { variant: 'error' });
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMockTest(deleteDialog.id);
            enqueueSnackbar('Test deleted', { variant: 'success' });
            setDeleteDialog({ open: false, id: '' });
            fetchTests();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to delete', { variant: 'error' });
        }
    };

    const filteredTests = tests.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    const filteredQuestions = questions.filter((q) =>
        (q.title.toLowerCase().includes(qSearch.toLowerCase()) || q.topic?.toLowerCase().includes(qSearch.toLowerCase())) &&
        (!qFilterType || q.questionType === qFilterType)
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Mock Tests</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
                    sx={{ borderRadius: '14px', background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', px: 3 }}>
                    Create Test
                </Button>
            </Box>

            <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Type</InputLabel>
                        <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="aptitude">Aptitude</MenuItem>
                            <MenuItem value="coding">Coding</MenuItem>
                            <MenuItem value="mixed">Mixed</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField sx={{ flex: 1, minWidth: 200 }} placeholder="Search tests..." value={search}
                        onChange={(e) => setSearch(e.target.value)} size="small"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }} />
                </Box>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>
            ) : filteredTests.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <TestIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No mock tests yet</Typography>
                </Card>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: '#F8F9FE' }}>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Questions</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Duration</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Marks</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTests.map((t) => (
                                <TableRow key={t._id} sx={{ '&:hover': { background: '#FAFBFF' } }}>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{t.title}</Typography>
                                        {t.description && <Typography variant="caption" sx={{ color: '#888' }}>{t.description.slice(0, 60)}</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={testTypeLabels[t.testType]} size="small"
                                            sx={{ fontSize: '0.72rem', height: 24, background: `${testTypeColors[t.testType]}14`, color: testTypeColors[t.testType], fontWeight: 600 }} />
                                    </TableCell>
                                    <TableCell><Typography variant="body2">{t.questions.length}</Typography></TableCell>
                                    <TableCell><Typography variant="body2">{t.duration} min</Typography></TableCell>
                                    <TableCell><Typography variant="body2">{t.totalMarks} ({t.passingMarks} pass)</Typography></TableCell>
                                    <TableCell>
                                        <Chip label={t.isPublished ? 'Published' : 'Draft'} size="small"
                                            sx={{ fontSize: '0.72rem', height: 24, background: t.isPublished ? '#E8F5E9' : '#F5F5F5', color: t.isPublished ? '#2E7D32' : '#9E9E9E', fontWeight: 600 }} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={t.isPublished ? 'Unpublish' : 'Publish'}>
                                            <IconButton size="small" onClick={() => handleTogglePublish(t)} sx={{ color: t.isPublished ? '#2E7D32' : '#9E9E9E' }}>
                                                <PublishIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(t)} sx={{ color: '#5C6BC0' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: t._id })} sx={{ color: '#D32F2F' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px', maxHeight: '90vh' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Mock Test' : 'Create Mock Test'}</DialogTitle>
                <DialogContent sx={{ pt: '8px !important' }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Test Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Type</InputLabel>
                                <Select value={form.testType} label="Type" onChange={(e) => setForm({ ...form, testType: e.target.value })}>
                                    <MenuItem value="aptitude">Aptitude</MenuItem>
                                    <MenuItem value="coding">Coding</MenuItem>
                                    <MenuItem value="mixed">Mixed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField fullWidth size="small" label="Duration (min)" type="number" value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField fullWidth size="small" label="Total Marks" type="number" value={form.totalMarks}
                                onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value) || 0 })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField fullWidth size="small" label="Passing Marks" type="number" value={form.passingMarks}
                                onChange={(e) => setForm({ ...form, passingMarks: parseInt(e.target.value) || 0 })} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel control={<Switch checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />}
                                label="Publish immediately" />
                        </Grid>

                        {/* Question Picker */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                Select Questions ({selectedQs.length} selected)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <TextField size="small" placeholder="Search questions..." value={qSearch}
                                    onChange={(e) => setQSearch(e.target.value)} sx={{ flex: 1 }}
                                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999', fontSize: 18 }} /></InputAdornment> } }} />
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Type</InputLabel>
                                    <Select value={qFilterType} label="Type" onChange={(e) => setQFilterType(e.target.value)}>
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="aptitude">Aptitude</MenuItem>
                                        <MenuItem value="coding">Coding</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Paper variant="outlined" sx={{ maxHeight: 280, overflowY: 'auto', borderRadius: '12px' }}>
                                <List dense disablePadding>
                                    {filteredQuestions.map((q) => (
                                        <ListItem key={q._id} disablePadding sx={{ px: 1 }}>
                                            <Checkbox checked={selectedQs.includes(q._id)} onChange={() => toggleQuestion(q._id)} size="small" sx={{ color: '#5C6BC0', '&.Mui-checked': { color: '#5C6BC0' } }} />
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                {q.questionType === 'coding' ? <CodeIcon sx={{ fontSize: 18, color: '#1565C0' }} /> : <QuizIcon sx={{ fontSize: 18, color: '#7B1FA2' }} />}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={q.title}
                                                secondary={`${q.category} · ${q.difficulty}${q.topic ? ' · ' + q.topic : ''}`}
                                                primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 500, noWrap: true }}
                                                secondaryTypographyProps={{ fontSize: '0.72rem' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={submitting || selectedQs.length === 0}
                        sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)' }}>
                        {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : editing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: '' })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Mock Test</DialogTitle>
                <DialogContent><Typography variant="body2" sx={{ color: '#555' }}>This will also delete all student attempts. Continue?</Typography></DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, id: '' })} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleDelete} sx={{ background: 'linear-gradient(135deg, #EF5350, #C62828)' }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MockTestsPage;
