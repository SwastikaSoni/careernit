import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Card, Typography, Chip, CircularProgress, TextField, InputAdornment,
    FormControl, InputLabel, Select, MenuItem, Grid, Button,
} from '@mui/material';
import {
    Search as SearchIcon, Assignment as TestIcon, Timer as TimerIcon,
    CheckCircle as PassIcon, PlayArrow as StartIcon, Visibility as ViewIcon,
    Quiz as QuizIcon, Code as CodeIcon, EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { getAllMockTests } from '../../services/mockTestService';

const testTypeLabels: Record<string, string> = { aptitude: 'Aptitude', coding: 'Coding', mixed: 'Mixed' };
const testTypeColors: Record<string, string> = { aptitude: '#7B1FA2', coding: '#1565C0', mixed: '#ED6C02' };
const testTypeBg: Record<string, string> = { aptitude: '#F3E5F5', coding: '#E3F2FD', mixed: '#FFF3E0' };
const testTypeIcons: Record<string, any> = { aptitude: <QuizIcon />, coding: <CodeIcon />, mixed: <TestIcon /> };

interface MockTest {
    _id: string; title: string; description?: string; testType: string;
    questions: any[]; duration: number; totalMarks: number; passingMarks: number;
}
interface Attempt { test: string; status: string; totalScore: number; percentage: number; submittedAt?: string; }

const BrowseMockTestsPage = () => {
    const [tests, setTests] = useState<MockTest[]>([]);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const params: Record<string, string> = {};
                if (filterType) params.testType = filterType;
                const data = await getAllMockTests(params);
                setTests(data.tests);
                setAttempts(data.attempts || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, [filterType]);

    const getAttempt = (testId: string) => attempts.find((a) => a.test === testId && a.status === 'submitted');
    const hasInProgress = (testId: string) => attempts.some((a) => a.test === testId && a.status === 'in_progress');

    const filtered = tests.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 3 }}>Mock Tests</Typography>

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
            ) : filtered.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <TestIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No tests available</Typography>
                </Card>
            ) : (
                <Grid container spacing={2.5}>
                    {filtered.map((t) => {
                        const attempt = getAttempt(t._id);
                        const inProgress = hasInProgress(t._id);
                        const passed = attempt && attempt.totalScore >= t.passingMarks;

                        return (
                            <Grid key={t._id} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{
                                    borderRadius: '16px', overflow: 'hidden', height: '100%',
                                    display: 'flex', flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
                                    border: attempt ? (passed ? '2px solid #2E7D32' : '2px solid #D32F2F') : '1px solid #E0E0E0',
                                }}>
                                    {/* Header */}
                                    <Box sx={{ px: 2.5, py: 1.5, background: testTypeBg[t.testType], display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ color: testTypeColors[t.testType], display: 'flex' }}>{testTypeIcons[t.testType]}</Box>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: testTypeColors[t.testType], textTransform: 'uppercase', letterSpacing: 1 }}>
                                            {testTypeLabels[t.testType]}
                                        </Typography>
                                        {attempt && (
                                            <Chip icon={passed ? <TrophyIcon sx={{ fontSize: 14 }} /> : undefined}
                                                label={passed ? 'Passed' : 'Failed'} size="small"
                                                sx={{ ml: 'auto', fontSize: '0.7rem', height: 22, background: passed ? '#E8F5E9' : '#FFEBEE', color: passed ? '#2E7D32' : '#D32F2F', fontWeight: 700 }} />
                                        )}
                                    </Box>

                                    <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5 }}>{t.title}</Typography>
                                        {t.description && <Typography variant="body2" sx={{ color: '#666', mb: 1.5 }}>{t.description.slice(0, 100)}</Typography>}

                                        <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TimerIcon sx={{ fontSize: 16, color: '#888' }} />
                                                <Typography variant="caption" sx={{ color: '#666' }}>{t.duration} min</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <QuizIcon sx={{ fontSize: 16, color: '#888' }} />
                                                <Typography variant="caption" sx={{ color: '#666' }}>{t.questions.length} Qs</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <PassIcon sx={{ fontSize: 16, color: '#888' }} />
                                                <Typography variant="caption" sx={{ color: '#666' }}>{t.totalMarks} marks</Typography>
                                            </Box>
                                        </Box>

                                        {/* Score display */}
                                        {attempt && (
                                            <Box sx={{ p: 1.5, borderRadius: '10px', background: '#F8F9FE', mb: 1.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    Score: {attempt.totalScore} / {t.totalMarks} ({attempt.percentage}%)
                                                </Typography>
                                            </Box>
                                        )}

                                        <Box sx={{ mt: 'auto', pt: 1 }}>
                                            {attempt ? (
                                                <Button size="small" variant="outlined" startIcon={<ViewIcon />}
                                                    onClick={() => navigate(`/dashboard/mock-tests/${t._id}/result`)}
                                                    sx={{ borderRadius: '10px', color: '#5C6BC0', borderColor: '#5C6BC0' }}>
                                                    View Results
                                                </Button>
                                            ) : (
                                                <Button size="small" variant="contained" startIcon={inProgress ? <PlayArrow /> : <StartIcon />}
                                                    onClick={() => navigate(`/dashboard/mock-tests/${t._id}/take`)}
                                                    sx={{ borderRadius: '10px', background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)' }}>
                                                    {inProgress ? 'Resume Test' : 'Start Test'}
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};

// PlayArrow is already imported as StartIcon but we need a separate declaration for the resume case
const PlayArrow = StartIcon;

export default BrowseMockTestsPage;
