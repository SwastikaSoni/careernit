import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Chip, CircularProgress, TextField, InputAdornment,
    FormControl, InputLabel, Select, MenuItem, Grid, Button,
} from '@mui/material';
import {
    Search as SearchIcon, MenuBook as ResourceIcon, PictureAsPdf as PdfIcon,
    Link as LinkIcon, Article as ArticleIcon, OpenInNew as OpenIcon,
    Download as DownloadIcon, Business as CompanyIcon,
} from '@mui/icons-material';
import { getAllResources } from '../../services/resourceService';

const categories = ['aptitude', 'technical', 'coding', 'hr', 'soft_skills', 'resume', 'other'];
const categoryLabels: Record<string, string> = { aptitude: 'Aptitude', technical: 'Technical', coding: 'Coding', hr: 'HR', soft_skills: 'Soft Skills', resume: 'Resume', other: 'Other' };
const typeIcons: Record<string, any> = { pdf: <PdfIcon />, link: <LinkIcon />, article: <ArticleIcon /> };
const typeColors: Record<string, string> = { pdf: '#D32F2F', link: '#1565C0', article: '#2E7D32' };
const typeBg: Record<string, string> = { pdf: '#FFEBEE', link: '#E3F2FD', article: '#E8F5E9' };

interface Resource {
    _id: string; title: string; resourceType: string; category: string; description?: string;
    content?: string; url?: string; filePath?: string;
    company?: { _id: string; name: string }; tags: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BrowseResourcesPage = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterType, setFilterType] = useState('');
    const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (filterCat) params.category = filterCat;
            if (filterType) params.resourceType = filterType;
            if (search) params.search = search;
            const data = await getAllResources(params);
            setResources(data.resources);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchResources(); }, [filterCat, filterType]);

    const filtered = resources.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 3 }}>Resources</Typography>

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
                        onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchResources()} size="small"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }} />
                </Box>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>
            ) : filtered.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <ResourceIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No resources found</Typography>
                </Card>
            ) : (
                <Grid container spacing={2.5}>
                    {filtered.map((r) => (
                        <Grid key={r._id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card sx={{
                                borderRadius: '16px', overflow: 'hidden', height: '100%',
                                display: 'flex', flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
                            }}>
                                {/* Type Banner */}
                                <Box sx={{ px: 2.5, py: 1.5, background: typeBg[r.resourceType], display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ color: typeColors[r.resourceType], display: 'flex', alignItems: 'center' }}>{typeIcons[r.resourceType]}</Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: typeColors[r.resourceType], textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {r.resourceType}
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5 }}>{r.title}</Typography>
                                    {r.description && (
                                        <Typography variant="body2" sx={{ color: '#666', mb: 1.5, lineHeight: 1.5 }}>
                                            {r.description.slice(0, 120)}{r.description.length > 120 ? '...' : ''}
                                        </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                                        <Chip label={categoryLabels[r.category]} size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                                        {r.company && <Chip icon={<CompanyIcon sx={{ fontSize: 14 }} />} label={r.company.name} size="small" sx={{ fontSize: '0.7rem', height: 22, background: '#FFF3E0', color: '#E65100' }} />}
                                        {r.tags?.slice(0, 3).map((t, i) => <Chip key={i} label={t} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />)}
                                    </Box>

                                    {/* Article content preview */}
                                    {r.resourceType === 'article' && r.content && (
                                        <Box sx={{ mt: 'auto' }}>
                                            <Typography variant="body2" sx={{
                                                color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                                                maxHeight: expandedArticle === r._id ? 'none' : 80, overflow: 'hidden',
                                                background: '#FAFBFE', p: 1.5, borderRadius: '8px', fontSize: '0.82rem',
                                            }}>
                                                {r.content}
                                            </Typography>
                                            {r.content.length > 200 && (
                                                <Button size="small" onClick={() => setExpandedArticle(expandedArticle === r._id ? null : r._id)}
                                                    sx={{ color: '#5C6BC0', mt: 0.5, fontSize: '0.75rem' }}>
                                                    {expandedArticle === r._id ? 'Show less' : 'Read more'}
                                                </Button>
                                            )}
                                        </Box>
                                    )}

                                    {/* Action buttons */}
                                    <Box sx={{ mt: 'auto', pt: 1.5 }}>
                                        {r.resourceType === 'link' && r.url && (
                                            <Button size="small" variant="outlined" endIcon={<OpenIcon />}
                                                href={r.url} target="_blank" rel="noopener"
                                                sx={{ borderRadius: '10px', color: '#1565C0', borderColor: '#1565C0', fontSize: '0.78rem' }}>
                                                Open Link
                                            </Button>
                                        )}
                                        {r.resourceType === 'pdf' && r.filePath && (
                                            <Button size="small" variant="outlined" endIcon={<DownloadIcon />}
                                                href={`${API_URL}${r.filePath}`} target="_blank" rel="noopener"
                                                sx={{ borderRadius: '10px', color: '#D32F2F', borderColor: '#D32F2F', fontSize: '0.78rem' }}>
                                                View PDF
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default BrowseResourcesPage;
