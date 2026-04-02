import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Chip, CircularProgress, TextField, InputAdornment,
    FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Tooltip, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid,
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Delete as DeleteIcon,
    Edit as EditIcon, MenuBook as ResourceIcon, PictureAsPdf as PdfIcon,
    Link as LinkIcon, Article as ArticleIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getAllResources, createResource, updateResource, deleteResource } from '../../services/resourceService';
import { getAllCompanies } from '../../services/companyService';

const categories = ['aptitude', 'technical', 'coding', 'hr', 'soft_skills', 'resume', 'other'];
const categoryLabels: Record<string, string> = { aptitude: 'Aptitude', technical: 'Technical', coding: 'Coding', hr: 'HR', soft_skills: 'Soft Skills', resume: 'Resume', other: 'Other' };
const typeIcons: Record<string, any> = { pdf: <PdfIcon sx={{ fontSize: 16 }} />, link: <LinkIcon sx={{ fontSize: 16 }} />, article: <ArticleIcon sx={{ fontSize: 16 }} /> };
const typeColors: Record<string, string> = { pdf: '#D32F2F', link: '#1565C0', article: '#2E7D32' };

interface Company { _id: string; name: string; }
interface Resource {
    _id: string; title: string; resourceType: string; category: string; description?: string;
    content?: string; url?: string; filePath?: string;
    company?: { _id: string; name: string }; tags: string[]; createdBy?: { name: string };
}

const ResourcesPage = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterType, setFilterType] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<any>({ title: '', resourceType: 'link', category: 'other', description: '', content: '', url: '', company: '', tags: '' });
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });

    const { enqueueSnackbar } = useSnackbar();

    const fetchResources = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (filterCat) params.category = filterCat;
            if (filterType) params.resourceType = filterType;
            const data = await getAllResources(params);
            setResources(data.resources);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const loadCompanies = async () => {
            try { const d = await getAllCompanies(); setCompanies(d.companies); } catch (e) { console.error(e); }
        };
        loadCompanies();
    }, []);

    useEffect(() => { fetchResources(); }, [filterCat, filterType]);

    const openCreate = () => {
        setEditing(null);
        setForm({ title: '', resourceType: 'link', category: 'other', description: '', content: '', url: '', company: '', tags: '' });
        setPdfFile(null);
        setDialogOpen(true);
    };

    const openEdit = (r: Resource) => {
        setEditing(r._id);
        setForm({
            title: r.title, resourceType: r.resourceType, category: r.category,
            description: r.description || '', content: r.content || '', url: r.url || '',
            company: r.company?._id || '', tags: (r.tags || []).join(', '),
        });
        setPdfFile(null);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        setSubmitting(true);
        try {
            const tags = form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

            if (form.resourceType === 'pdf' && (pdfFile || !editing)) {
                const formData = new FormData();
                formData.append('title', form.title);
                formData.append('resourceType', 'pdf');
                formData.append('category', form.category);
                formData.append('description', form.description);
                if (form.company) formData.append('company', form.company);
                tags.forEach((t: string) => formData.append('tags', t));
                if (pdfFile) formData.append('file', pdfFile);

                if (editing) {
                    await updateResource(editing, formData);
                    enqueueSnackbar('Resource updated', { variant: 'success' });
                } else {
                    await createResource(formData);
                    enqueueSnackbar('Resource created', { variant: 'success' });
                }
            } else {
                const body = { ...form, company: form.company || undefined, tags };
                if (editing) {
                    await updateResource(editing, body);
                    enqueueSnackbar('Resource updated', { variant: 'success' });
                } else {
                    await createResource(body);
                    enqueueSnackbar('Resource created', { variant: 'success' });
                }
            }
            setDialogOpen(false);
            fetchResources();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to save', { variant: 'error' });
        } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        try {
            await deleteResource(deleteDialog.id);
            enqueueSnackbar('Resource deleted', { variant: 'success' });
            setDeleteDialog({ open: false, id: '' });
            fetchResources();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to delete', { variant: 'error' });
        }
    };

    const filtered = resources.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Resources</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
                    sx={{ borderRadius: '14px', background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', px: 3 }}>
                    Add Resource
                </Button>
            </Box>

            <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Type</InputLabel>
                        <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="pdf">PDF</MenuItem>
                            <MenuItem value="link">Link</MenuItem>
                            <MenuItem value="article">Article</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Category</InputLabel>
                        <Select value={filterCat} label="Category" onChange={(e) => setFilterCat(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            {categories.map((c) => <MenuItem key={c} value={c}>{categoryLabels[c]}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField sx={{ flex: 1, minWidth: 200 }} placeholder="Search resources..." value={search}
                        onChange={(e) => setSearch(e.target.value)} size="small"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }} />
                </Box>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>
            ) : filtered.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <ResourceIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No resources yet</Typography>
                </Card>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: '#F8F9FE' }}>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }}>Company</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#555' }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((r) => (
                                <TableRow key={r._id} sx={{ '&:hover': { background: '#FAFBFF' } }}>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.title}</Typography>
                                        {r.description && <Typography variant="caption" sx={{ color: '#888' }}>{r.description.slice(0, 80)}{r.description.length > 80 ? '...' : ''}</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        <Chip icon={typeIcons[r.resourceType]} label={r.resourceType.toUpperCase()} size="small"
                                            sx={{ fontSize: '0.72rem', height: 24, background: `${typeColors[r.resourceType]}14`, color: typeColors[r.resourceType], fontWeight: 600 }} />
                                    </TableCell>
                                    <TableCell><Chip label={categoryLabels[r.category]} size="small" sx={{ fontSize: '0.72rem', height: 24 }} /></TableCell>
                                    <TableCell><Typography variant="caption" sx={{ color: '#666' }}>{r.company?.name || '—'}</Typography></TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(r)} sx={{ color: '#5C6BC0' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: r._id })} sx={{ color: '#D32F2F' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
                <DialogContent sx={{ pt: '8px !important' }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Type</InputLabel>
                                <Select value={form.resourceType} label="Type" onChange={(e) => setForm({ ...form, resourceType: e.target.value })}>
                                    <MenuItem value="link">Link</MenuItem>
                                    <MenuItem value="pdf">PDF</MenuItem>
                                    <MenuItem value="article">Article / Paragraph</MenuItem>
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
                                <InputLabel>Company (optional)</InputLabel>
                                <Select value={form.company} label="Company (optional)" onChange={(e) => setForm({ ...form, company: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {companies.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Description" value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} />
                        </Grid>

                        {form.resourceType === 'link' && (
                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth size="small" label="URL" value={form.url}
                                    onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                            </Grid>
                        )}

                        {form.resourceType === 'pdf' && (
                            <Grid size={{ xs: 12 }}>
                                <Button variant="outlined" component="label" sx={{ borderRadius: '12px', color: '#5C6BC0', borderColor: '#5C6BC0' }}>
                                    {pdfFile ? pdfFile.name : 'Upload PDF'}
                                    <input type="file" hidden accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                                </Button>
                            </Grid>
                        )}

                        {form.resourceType === 'article' && (
                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth size="small" label="Content / Explanation" value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })} multiline rows={6}
                                    placeholder="Write your article content here..." />
                            </Grid>
                        )}

                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth size="small" label="Tags (comma-separated)" value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })} />
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

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: '' })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Resource</DialogTitle>
                <DialogContent><Typography variant="body2" sx={{ color: '#555' }}>Are you sure? This cannot be undone.</Typography></DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, id: '' })} sx={{ color: '#888' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleDelete} sx={{ background: 'linear-gradient(135deg, #EF5350, #C62828)' }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ResourcesPage;
