import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Chip, CircularProgress, TextField, InputAdornment,
    FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Tooltip, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid,
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Delete as DeleteIcon,
    Edit as EditIcon, Quiz as QuizIcon, Code as CodeIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getAllQuestions, createQuestion, updateQuestion, deleteQuestion } from '../../services/questionService';
import { getAllCompanies } from '../../services/companyService';

const categories = ['aptitude', 'technical', 'coding', 'hr', 'logical', 'verbal', 'other'];
const difficulties = ['easy', 'medium', 'hard'];
const categoryLabels: Record<string, string> = { aptitude: 'Aptitude', technical: 'Technical', coding: 'Coding', hr: 'HR', logical: 'Logical', verbal: 'Verbal', other: 'Other' };
const difficultyColors: Record<string, string> = { easy: '#2E7D32', medium: '#ED6C02', hard: '#D32F2F' };

interface Company { _id: string; name: string; }
interface Question {
    _id: string; title: string; questionType: string; category: string; difficulty: string;
    company?: { _id: string; name: string }; topic?: string; options: { text: string; isCorrect: boolean }[];
    codingDetails?: { problemStatement: string; constraints?: string; sampleInput?: string; sampleOutput?: string; testCases: { input: string; expectedOutput: string; isHidden: boolean }[]; languages: string[] };
    explanation?: string; tags: string[]; createdBy?: { name: string };
}

const emptyForm = {
    title: '', questionType: 'aptitude', category: 'aptitude', difficulty: 'medium', company: '', topic: '',
    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }],
    codingDetails: { problemStatement: '', constraints: '', sampleInput: '', sampleOutput: '', testCases: [{ input: '', expectedOutput: '', isHidden: false }], languages: ['javascript', 'python'] },
    explanation: '', tags: '',
};

const QuestionsPage = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterDiff, setFilterDiff] = useState('');
    const [filterType, setFilterType] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<any>({ ...emptyForm });
    const [submitting, setSubmitting] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });

    const { enqueueSnackbar } = useSnackbar();

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (filterCat) params.category = filterCat;
            if (filterDiff) params.difficulty = filterDiff;
            if (filterType) params.questionType = filterType;
            const data = await getAllQuestions(params);
            setQuestions(data.questions);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const loadCompanies = async () => {
            try { const d = await getAllCompanies(); setCompanies(d.companies); } catch (e) { console.error(e); }
        };
        loadCompanies();
    }, []);

    useEffect(() => { fetchQuestions(); }, [filterCat, filterDiff, filterType]);

    const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setDialogOpen(true); };
    const openEdit = (q: Question) => {
        setEditing(q._id);
        setForm({
            title: q.title, questionType: q.questionType, category: q.category, difficulty: q.difficulty,
            company: q.company?._id || '', topic: q.topic || '',
            options: q.options.length > 0 ? q.options : emptyForm.options,
            codingDetails: q.codingDetails || emptyForm.codingDetails,
            explanation: q.explanation || '', tags: (q.tags || []).join(', '),
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        setSubmitting(true);
        try {
            const body = {
                ...form,
                company: form.company || undefined,
                tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
                options: form.questionType === 'aptitude' ? form.options : [],
                codingDetails: form.questionType === 'coding' ? form.codingDetails : undefined,
            };
            if (editing) {
                await updateQuestion(editing, body);
                enqueueSnackbar('Question updated', { variant: 'success' });
            } else {
                await createQuestion(body);
                enqueueSnackbar('Question created', { variant: 'success' });
            }
            setDialogOpen(false);
            fetchQuestions();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to save', { variant: 'error' });
        } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        try {
            await deleteQuestion(deleteDialog.id);
            enqueueSnackbar('Question deleted', { variant: 'success' });
            setDeleteDialog({ open: false, id: '' });
            fetchQuestions();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to delete', { variant: 'error' });
        }
    };

    const filtered = questions.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.topic?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Question Bank</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
                    sx={{ borderRadius: '14px', background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', px: 3 }}>
                    Add Question
                </Button>
            </Box>

            {/* Filters */}
            <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Type</InputLabel>
                        <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="aptitude">Aptitude</MenuItem>
                            <MenuItem value="coding">Coding</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Category</InputLabel>
                        <Select value={filterCat} label="Category" onChange={(e) => setFilterCat(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            {categories.map((c) => <MenuItem key={c} value={c}>{categoryLabels[c]}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Difficulty</InputLabel>
                        <Select value={filterDiff} label="Difficulty" onChange={(e) => setFilterDiff(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            {difficulties.map((d) => <MenuItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField sx={{ flex: 1, minWidth: 200 }} placeholder="Search questions..." value={search}
                        onChange={(e) => setSearch(e.target.value)} size="small"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }} />
                </Box>
            </Card>

            {/* Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>
            ) : filtered.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <QuizIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No questions yet</Typography>
                    <Typography variant="body2" sx={{ color: '#BBB', mt: 0.5 }}>Add questions to build your question bank</Typography>
                </Card>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: '#F8F9FE' }}>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Question</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Difficulty</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Topic</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((q) => (
                                <TableRow key={q._id} sx={{ '&:hover': { background: '#FAFBFF' } }}>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {q.title}
                                        </Typography>
                                        {q.company && <Typography variant="caption" sx={{ color: '#888' }}>Asked at {q.company.name}</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        <Chip icon={q.questionType === 'coding' ? <CodeIcon sx={{ fontSize: 14 }} /> : <QuizIcon sx={{ fontSize: 14 }} />}
                                            label={q.questionType === 'coding' ? 'Coding' : 'Aptitude'} size="small"
                                            sx={{ fontSize: '0.72rem', height: 24, background: q.questionType === 'coding' ? '#E3F2FD' : '#F3E5F5', color: q.questionType === 'coding' ? '#1565C0' : '#7B1FA2', fontWeight: 600 }} />
                                    </TableCell>
                                    <TableCell><Chip label={categoryLabels[q.category]} size="small" sx={{ fontSize: '0.72rem', height: 24 }} /></TableCell>
                                    <TableCell>
                                        <Chip label={q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)} size="small"
                                            sx={{ fontSize: '0.72rem', height: 24, background: `${difficultyColors[q.difficulty]}14`, color: difficultyColors[q.difficulty], fontWeight: 600 }} />
                                    </TableCell>
                                    <TableCell><Typography variant="caption" sx={{ color: '#666' }}>{q.topic || '—'}</Typography></TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(q)} sx={{ color: '#5C6BC0' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: q._id })} sx={{ color: '#D32F2F' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Question' : 'Add Question'}</DialogTitle>
                <DialogContent sx={{ pt: '8px !important' }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Question Title" value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })} multiline rows={2} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Type</InputLabel>
                                <Select value={form.questionType} label="Type" onChange={(e) => setForm({ ...form, questionType: e.target.value })}>
                                    <MenuItem value="aptitude">Aptitude (MCQ)</MenuItem>
                                    <MenuItem value="coding">Coding</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                    {categories.map((c) => <MenuItem key={c} value={c}>{categoryLabels[c]}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Difficulty</InputLabel>
                                <Select value={form.difficulty} label="Difficulty" onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                                    {difficulties.map((d) => <MenuItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Company (optional)</InputLabel>
                                <Select value={form.company} label="Company (optional)" onChange={(e) => setForm({ ...form, company: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {companies.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth size="small" label="Topic" value={form.topic}
                                onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Arrays, Percentages" />
                        </Grid>

                        {/* Aptitude Options */}
                        {form.questionType === 'aptitude' && (
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#555', mb: 1, display: 'block' }}>
                                    Options — <span style={{ color: '#2E7D32' }}>click the letter to mark it as the correct answer ✓</span>
                                </Typography>
                                {form.options.map((opt: any, i: number) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                        <Chip label={String.fromCharCode(65 + i)} size="small" onClick={() => {
                                            const opts = form.options.map((o: any, j: number) => ({ ...o, isCorrect: j === i }));
                                            setForm({ ...form, options: opts });
                                        }}
                                            sx={{ cursor: 'pointer', background: opt.isCorrect ? '#2E7D32' : '#E0E0E0', color: opt.isCorrect ? '#fff' : '#555', fontWeight: 700, minWidth: 32 }} />
                                        <TextField fullWidth size="small" placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt.text}
                                            onChange={(e) => { const opts = [...form.options]; opts[i] = { ...opts[i], text: e.target.value }; setForm({ ...form, options: opts }); }} />
                                        {form.options.length > 2 && (
                                            <IconButton size="small" onClick={() => { const opts = form.options.filter((_: any, j: number) => j !== i); setForm({ ...form, options: opts }); }} sx={{ color: '#D32F2F' }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                                {form.options.length < 6 && (
                                    <Button size="small" onClick={() => setForm({ ...form, options: [...form.options, { text: '', isCorrect: false }] })} sx={{ color: '#5C6BC0', mt: 0.5 }}>
                                        + Add Option
                                    </Button>
                                )}
                            </Grid>
                        )}

                        {/* Coding Details */}
                        {form.questionType === 'coding' && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <TextField fullWidth size="small" label="Problem Statement" value={form.codingDetails.problemStatement}
                                        onChange={(e) => setForm({ ...form, codingDetails: { ...form.codingDetails, problemStatement: e.target.value } })} multiline rows={3} />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField fullWidth size="small" label="Constraints" value={form.codingDetails.constraints}
                                        onChange={(e) => setForm({ ...form, codingDetails: { ...form.codingDetails, constraints: e.target.value } })} multiline rows={2} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField fullWidth size="small" label="Sample Input" value={form.codingDetails.sampleInput}
                                        onChange={(e) => setForm({ ...form, codingDetails: { ...form.codingDetails, sampleInput: e.target.value } })} multiline rows={2} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField fullWidth size="small" label="Sample Output" value={form.codingDetails.sampleOutput}
                                        onChange={(e) => setForm({ ...form, codingDetails: { ...form.codingDetails, sampleOutput: e.target.value } })} multiline rows={2} />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#555', mb: 1, display: 'block' }}>Test Cases</Typography>
                                    {form.codingDetails.testCases.map((tc: any, i: number) => (
                                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                            <TextField size="small" placeholder="Input" value={tc.input} sx={{ flex: 1 }}
                                                onChange={(e) => { const tcs = [...form.codingDetails.testCases]; tcs[i] = { ...tcs[i], input: e.target.value }; setForm({ ...form, codingDetails: { ...form.codingDetails, testCases: tcs } }); }} />
                                            <TextField size="small" placeholder="Expected Output" value={tc.expectedOutput} sx={{ flex: 1 }}
                                                onChange={(e) => { const tcs = [...form.codingDetails.testCases]; tcs[i] = { ...tcs[i], expectedOutput: e.target.value }; setForm({ ...form, codingDetails: { ...form.codingDetails, testCases: tcs } }); }} />
                                            <Chip label={tc.isHidden ? 'Hidden' : 'Visible'} size="small" onClick={() => {
                                                const tcs = [...form.codingDetails.testCases]; tcs[i] = { ...tcs[i], isHidden: !tcs[i].isHidden };
                                                setForm({ ...form, codingDetails: { ...form.codingDetails, testCases: tcs } });
                                            }} sx={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.7rem' }} />
                                            {form.codingDetails.testCases.length > 1 && (
                                                <IconButton size="small" onClick={() => {
                                                    const tcs = form.codingDetails.testCases.filter((_: any, j: number) => j !== i);
                                                    setForm({ ...form, codingDetails: { ...form.codingDetails, testCases: tcs } });
                                                }} sx={{ color: '#D32F2F' }}><DeleteIcon fontSize="small" /></IconButton>
                                            )}
                                        </Box>
                                    ))}
                                    <Button size="small" onClick={() => setForm({ ...form, codingDetails: { ...form.codingDetails, testCases: [...form.codingDetails.testCases, { input: '', expectedOutput: '', isHidden: false }] } })}
                                        sx={{ color: '#5C6BC0', mt: 0.5 }}>+ Add Test Case</Button>
                                </Grid>
                            </>
                        )}

                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Explanation (shown after answering)" value={form.explanation}
                                onChange={(e) => setForm({ ...form, explanation: e.target.value })} multiline rows={2} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Tags (comma-separated)" value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. arrays, sorting, TCS" />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={submitting}
                        sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)' }}>
                        {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : editing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: '' })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Question</DialogTitle>
                <DialogContent><Typography variant="body2" sx={{ color: '#555' }}>Are you sure? This cannot be undone.</Typography></DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, id: '' })} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleDelete} sx={{ background: 'linear-gradient(135deg, #EF5350, #C62828)' }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionsPage;
