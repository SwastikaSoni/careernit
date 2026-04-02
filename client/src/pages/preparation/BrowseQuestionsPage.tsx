import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Chip, CircularProgress, TextField, InputAdornment,
    FormControl, InputLabel, Select, MenuItem, Grid, Collapse, IconButton, Tooltip,
    Button, Radio, RadioGroup, FormControlLabel,
} from '@mui/material';
import {
    Search as SearchIcon, Quiz as QuizIcon, Code as CodeIcon,
    ExpandMore as ExpandIcon, ExpandLess as CollapseIcon,
    Lightbulb as TipIcon, Business as CompanyIcon,
    PlayArrow as RunIcon, CheckCircle as CorrectIcon, Cancel as WrongIcon,
} from '@mui/icons-material';
import { getAllQuestions } from '../../services/questionService';

const categories = ['aptitude', 'technical', 'coding', 'hr', 'logical', 'verbal', 'other'];
const difficulties = ['easy', 'medium', 'hard'];
const categoryLabels: Record<string, string> = { aptitude: 'Aptitude', technical: 'Technical', coding: 'Coding', hr: 'HR', logical: 'Logical', verbal: 'Verbal', other: 'Other' };
const difficultyColors: Record<string, string> = { easy: '#2E7D32', medium: '#ED6C02', hard: '#D32F2F' };
const difficultyBg: Record<string, string> = { easy: '#E8F5E9', medium: '#FFF3E0', hard: '#FFEBEE' };

interface Question {
    _id: string; title: string; questionType: string; category: string; difficulty: string;
    company?: { _id: string; name: string }; topic?: string; options?: { text: string }[];
    codingDetails?: { problemStatement: string; constraints?: string; sampleInput?: string; sampleOutput?: string; languages?: string[] };
    tags: string[];
}

const BrowseQuestionsPage = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterDiff, setFilterDiff] = useState('');
    const [filterType, setFilterType] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    // Interactive state per question
    const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
    const [codeEntries, setCodeEntries] = useState<Record<string, { code: string; language: string }>>({});
    const [codeOutputs, setCodeOutputs] = useState<Record<string, string>>({});

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (filterCat) params.category = filterCat;
            if (filterDiff) params.difficulty = filterDiff;
            if (filterType) params.questionType = filterType;
            if (search) params.search = search;
            const data = await getAllQuestions(params);
            setQuestions(data.questions);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchQuestions(); }, [filterCat, filterDiff, filterType]);

    const handleSearch = () => { fetchQuestions(); };

    const filtered = questions.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.topic?.toLowerCase().includes(search.toLowerCase())
    );

    const handleRunCode = (qId: string) => {
        // Simulate running — in production this would call a code execution API
        const entry = codeEntries[qId];
        if (!entry?.code?.trim()) {
            setCodeOutputs({ ...codeOutputs, [qId]: '⚠ Please write some code first.' });
            return;
        }
        setCodeOutputs({ ...codeOutputs, [qId]: '✅ Code submitted! (Execution engine not connected — review your solution against sample output)' });
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 3 }}>Question Bank</Typography>

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
                        onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} size="small"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }} />
                </Box>
            </Card>

            {/* Questions */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>
            ) : filtered.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <QuizIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No questions found</Typography>
                    <Typography variant="body2" sx={{ color: '#BBB', mt: 0.5 }}>Try adjusting your filters</Typography>
                </Card>
            ) : (
                <Grid container spacing={2}>
                    {filtered.map((q, idx) => (
                        <Grid size={{ xs: 12 }} key={q._id}>
                            <Card sx={{
                                borderRadius: '16px', overflow: 'hidden',
                                borderLeft: `4px solid ${difficultyColors[q.difficulty]}`,
                                transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
                            }}>
                                <Box sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1, mr: 2 }}>
                                            <Typography variant="body2" sx={{ color: '#888', fontSize: '0.75rem', mb: 0.5 }}>#{idx + 1}</Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.4 }}>{q.title}</Typography>
                                        </Box>
                                        <Tooltip title={expanded === q._id ? 'Collapse' : 'Solve'}>
                                            <IconButton size="small" onClick={() => setExpanded(expanded === q._id ? null : q._id)}
                                                sx={{ color: '#5C6BC0', background: expanded === q._id ? '#EDE7F6' : 'transparent' }}>
                                                {expanded === q._id ? <CollapseIcon /> : <ExpandIcon />}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                                        <Chip icon={q.questionType === 'coding' ? <CodeIcon sx={{ fontSize: 14 }} /> : <QuizIcon sx={{ fontSize: 14 }} />}
                                            label={q.questionType === 'coding' ? 'Coding' : 'Aptitude'} size="small"
                                            sx={{ fontSize: '0.7rem', height: 22, background: q.questionType === 'coding' ? '#E3F2FD' : '#F3E5F5', color: q.questionType === 'coding' ? '#1565C0' : '#7B1FA2', fontWeight: 600 }} />
                                        <Chip label={q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)} size="small"
                                            sx={{ fontSize: '0.7rem', height: 22, background: difficultyBg[q.difficulty], color: difficultyColors[q.difficulty], fontWeight: 600 }} />
                                        <Chip label={categoryLabels[q.category]} size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                                        {q.topic && <Chip label={q.topic} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />}
                                        {q.company && (
                                            <Chip icon={<CompanyIcon sx={{ fontSize: 14 }} />} label={q.company.name} size="small"
                                                sx={{ fontSize: '0.7rem', height: 22, background: '#FFF3E0', color: '#E65100', fontWeight: 600 }} />
                                        )}
                                    </Box>
                                </Box>

                                <Collapse in={expanded === q._id}>
                                    <Box sx={{ px: 2.5, pb: 2.5, pt: 0 }}>

                                        {/* ── APTITUDE MCQ ── */}
                                        {q.questionType === 'aptitude' && q.options && q.options.length > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#555', mb: 1, display: 'block' }}>
                                                    Choose the correct answer
                                                </Typography>
                                                <RadioGroup
                                                    value={selectedOptions[q._id] ?? ''}
                                                    onChange={(e) => setSelectedOptions({ ...selectedOptions, [q._id]: parseInt(e.target.value) })}
                                                >
                                                    {q.options.map((opt, i) => (
                                                        <FormControlLabel key={i} value={i}
                                                            control={<Radio sx={{ color: '#5C6BC0', '&.Mui-checked': { color: '#5C6BC0' } }} />}
                                                            label={
                                                                <Box sx={{
                                                                    py: 0.8, px: 1.5, borderRadius: '10px', width: '100%',
                                                                    background: selectedOptions[q._id] === i ? '#EDE7F6' : '#F8F9FE',
                                                                    transition: 'background 0.2s',
                                                                }}>
                                                                    <Typography variant="body2">{opt.text}</Typography>
                                                                </Box>
                                                            }
                                                            sx={{
                                                                ml: 0, mb: 0.5, width: '100%', borderRadius: '10px',
                                                                border: selectedOptions[q._id] === i ? '2px solid #5C6BC0' : '1px solid #E0E0E0',
                                                                transition: 'border 0.2s',
                                                            }}
                                                        />
                                                    ))}
                                                </RadioGroup>
                                                {selectedOptions[q._id] !== undefined && (
                                                    <Box sx={{ mt: 1, p: 1.5, borderRadius: '10px', background: '#FFFDE7', borderLeft: '3px solid #FFB300' }}>
                                                        <Typography variant="body2" sx={{ color: '#555', fontStyle: 'italic' }}>
                                                            ✨ Answer recorded — you'll see your score in mock tests!
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        {/* ── CODING QUESTION ── */}
                                        {q.questionType === 'coding' && (
                                            <Box sx={{ mt: 1 }}>
                                                {/* Problem Statement */}
                                                {q.codingDetails?.problemStatement && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#555' }}>Problem Statement</Typography>
                                                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', background: '#F8F9FE', p: 2, borderRadius: '10px', lineHeight: 1.7 }}>
                                                            {q.codingDetails.problemStatement}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Constraints */}
                                                {q.codingDetails?.constraints && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#555' }}>Constraints</Typography>
                                                        <Typography variant="body2" sx={{ mt: 0.3, color: '#666', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                                                            {q.codingDetails.constraints}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Sample I/O */}
                                                {(q.codingDetails?.sampleInput || q.codingDetails?.sampleOutput) && (
                                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                        {q.codingDetails?.sampleInput && (
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#555' }}>Sample Input</Typography>
                                                                <Box sx={{ mt: 0.3, p: 1.5, borderRadius: '8px', background: '#263238', color: '#E0E0E0', fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'pre' }}>
                                                                    {q.codingDetails.sampleInput}
                                                                </Box>
                                                            </Box>
                                                        )}
                                                        {q.codingDetails?.sampleOutput && (
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#555' }}>Expected Output</Typography>
                                                                <Box sx={{ mt: 0.3, p: 1.5, borderRadius: '8px', background: '#263238', color: '#E0E0E0', fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'pre' }}>
                                                                    {q.codingDetails.sampleOutput}
                                                                </Box>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}

                                                {/* Language Selector + Code Editor */}
                                                <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                                        <InputLabel>Language</InputLabel>
                                                        <Select
                                                            value={codeEntries[q._id]?.language || 'javascript'}
                                                            label="Language"
                                                            onChange={(e) => setCodeEntries({
                                                                ...codeEntries,
                                                                [q._id]: { ...codeEntries[q._id], code: codeEntries[q._id]?.code || '', language: e.target.value },
                                                            })}
                                                        >
                                                            {(q.codingDetails?.languages || ['javascript', 'python', 'c++', 'java']).map((l) => (
                                                                <MenuItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    <Button
                                                        variant="contained" size="small" startIcon={<RunIcon />}
                                                        onClick={() => handleRunCode(q._id)}
                                                        sx={{ borderRadius: '10px', background: 'linear-gradient(135deg, #2E7D32, #43A047)', ml: 'auto', px: 2 }}
                                                    >
                                                        Run Code
                                                    </Button>
                                                </Box>

                                                <TextField
                                                    fullWidth multiline rows={10}
                                                    value={codeEntries[q._id]?.code || ''}
                                                    onChange={(e) => setCodeEntries({
                                                        ...codeEntries,
                                                        [q._id]: { ...codeEntries[q._id], language: codeEntries[q._id]?.language || 'javascript', code: e.target.value },
                                                    })}
                                                    placeholder={`// Write your ${codeEntries[q._id]?.language || 'javascript'} solution here...`}
                                                    sx={{
                                                        '& .MuiInputBase-input': { fontFamily: '"Fira Code", "Consolas", monospace', fontSize: '0.85rem', lineHeight: 1.6 },
                                                        '& .MuiOutlinedInput-root': { borderRadius: '10px', background: '#1E1E2F', color: '#E0E0E0' },
                                                    }}
                                                />

                                                {/* Output Area */}
                                                {codeOutputs[q._id] && (
                                                    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '10px', background: '#F1F8E9', borderLeft: '3px solid #43A047' }}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#333' }}>
                                                            {codeOutputs[q._id]}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        {/* Tags */}
                                        {q.tags && q.tags.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 2 }}>
                                                <TipIcon sx={{ fontSize: 16, color: '#999', mr: 0.5 }} />
                                                {q.tags.map((t, i) => <Chip key={i} label={t} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />)}
                                            </Box>
                                        )}
                                    </Box>
                                </Collapse>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default BrowseQuestionsPage;
