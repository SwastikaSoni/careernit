import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Card, Typography, Chip, CircularProgress, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel, TextField,
    FormControl, InputLabel, Select, MenuItem, LinearProgress,
} from '@mui/material';
import {
    Timer as TimerIcon, Quiz as QuizIcon, Code as CodeIcon,
    NavigateNext as NextIcon, NavigateBefore as PrevIcon,
    Send as SubmitIcon, Warning as WarningIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { startTestAttempt, submitTestAttempt } from '../../services/mockTestService';

interface Option { text: string; }
interface Question {
    _id: string; title: string; questionType: string; category: string; difficulty: string;
    options?: Option[];
    codingDetails?: { problemStatement: string; constraints?: string; sampleInput?: string; sampleOutput?: string; languages?: string[] };
}

const TakeTestPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState<any>(null);
    const [attempt, setAttempt] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitDialog, setSubmitDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const data = await startTestAttempt(id!);
                setTest(data.test);
                setAttempt(data.attempt);
                setQuestions(data.test.questions);

                // Calculate remaining time
                const startedAt = new Date(data.attempt.startedAt).getTime();
                const durationMs = data.test.duration * 60 * 1000;
                const elapsed = Date.now() - startedAt;
                const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
                setTimeLeft(remaining);

                // Restore saved answers from attempt
                const savedAnswers: Record<string, any> = {};
                (data.attempt.answers || []).forEach((a: any) => {
                    if (a.selectedOption !== undefined && a.selectedOption !== null) {
                        savedAnswers[a.question] = { selectedOption: a.selectedOption };
                    }
                    if (a.code) {
                        savedAnswers[a.question] = { code: a.code, language: a.language || 'javascript' };
                    }
                });
                setAnswers(savedAnswers);
            } catch (err: any) {
                enqueueSnackbar(err.response?.data?.message || 'Failed to start test', { variant: 'error' });
                navigate('/dashboard/mock-tests');
            } finally { setLoading(false); }
        };
        init();
    }, [id]);

    // Timer
    useEffect(() => {
        if (timeLeft <= 0 && test) {
            handleSubmit(true);
            return;
        }
        timerRef.current = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [test]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const handleSubmit = useCallback(async (timedOut = false) => {
        if (submitting) return;
        setSubmitting(true);
        clearInterval(timerRef.current);
        try {
            const formattedAnswers = questions.map((q) => ({
                question: q._id,
                selectedOption: answers[q._id]?.selectedOption,
                code: answers[q._id]?.code,
                language: answers[q._id]?.language,
            }));

            await submitTestAttempt(id!, { attemptId: attempt._id, answers: formattedAnswers });
            enqueueSnackbar(timedOut ? 'Time\'s up! Test submitted.' : 'Test submitted successfully', { variant: 'success' });
            navigate(`/dashboard/mock-tests/${id}/result`);
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to submit', { variant: 'error' });
            setSubmitting(false);
        }
    }, [submitting, questions, answers, id, attempt]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>;
    }

    if (!test || !questions.length) return null;

    const currentQ = questions[currentIdx];
    const answered = Object.keys(answers).filter((k) => answers[k]?.selectedOption !== undefined || answers[k]?.code).length;
    const progress = (answered / questions.length) * 100;
    const isUrgent = timeLeft < 60;

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            {/* Top Bar — Timer + Progress */}
            <Card sx={{ p: 2, mb: 2, borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{test.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#888' }}>{answered} of {questions.length} answered</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress variant="determinate" value={progress} sx={{ width: 120, height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)' } }} />
                    <Chip icon={<TimerIcon />} label={formatTime(timeLeft)}
                        sx={{
                            fontWeight: 700, fontSize: '1rem', height: 36, background: isUrgent ? '#FFEBEE' : '#E3F2FD', color: isUrgent ? '#D32F2F' : '#1565C0',
                            animation: isUrgent ? 'pulse 1s infinite' : 'none',
                            '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
                        }} />
                </Box>
            </Card>

            <Box sx={{ display: 'flex', gap: 2 }}>
                {/* Question Navigation */}
                <Card sx={{ p: 1.5, borderRadius: '16px', minWidth: 80 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#555', display: 'block', mb: 1, textAlign: 'center' }}>Questions</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 400, overflowY: 'auto' }}>
                        {questions.map((q, i) => {
                            const isAnswered = answers[q._id]?.selectedOption !== undefined || answers[q._id]?.code;
                            return (
                                <Chip key={i} label={i + 1} size="small" onClick={() => setCurrentIdx(i)}
                                    sx={{
                                        cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', height: 32, minWidth: 32,
                                        background: currentIdx === i ? 'linear-gradient(135deg, #5C6BC0, #7E57C2)' : isAnswered ? '#E8F5E9' : '#F5F5F5',
                                        color: currentIdx === i ? '#fff' : isAnswered ? '#2E7D32' : '#666',
                                    }} />
                            );
                        })}
                    </Box>
                </Card>

                {/* Question Content */}
                <Card sx={{ flex: 1, p: 3, borderRadius: '16px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#888' }}>Q{currentIdx + 1} / {questions.length}</Typography>
                            <Chip icon={currentQ.questionType === 'coding' ? <CodeIcon sx={{ fontSize: 14 }} /> : <QuizIcon sx={{ fontSize: 14 }} />}
                                label={currentQ.questionType === 'coding' ? 'Coding' : 'MCQ'} size="small"
                                sx={{ fontSize: '0.7rem', height: 22, background: currentQ.questionType === 'coding' ? '#E3F2FD' : '#F3E5F5', color: currentQ.questionType === 'coding' ? '#1565C0' : '#7B1FA2', fontWeight: 600 }} />
                        </Box>
                        <Chip label={currentQ.difficulty} size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, lineHeight: 1.5 }}>{currentQ.title}</Typography>

                    {/* Aptitude MCQ */}
                    {currentQ.questionType === 'aptitude' && currentQ.options && (
                        <RadioGroup value={answers[currentQ._id]?.selectedOption ?? ''} onChange={(e) => setAnswers({ ...answers, [currentQ._id]: { selectedOption: parseInt(e.target.value) } })}>
                            {currentQ.options.map((opt, i) => (
                                <FormControlLabel key={i} value={i}
                                    control={<Radio sx={{ color: '#5C6BC0', '&.Mui-checked': { color: '#5C6BC0' } }} />}
                                    label={
                                        <Box sx={{ py: 1, px: 1.5, borderRadius: '10px', background: answers[currentQ._id]?.selectedOption === i ? '#EDE7F6' : '#FAFBFE', width: '100%', transition: 'background 0.2s' }}>
                                            <Typography variant="body1">{opt.text}</Typography>
                                        </Box>
                                    }
                                    sx={{ ml: 0, mb: 1, width: '100%', borderRadius: '10px', border: answers[currentQ._id]?.selectedOption === i ? '2px solid #5C6BC0' : '1px solid #E0E0E0' }}
                                />
                            ))}
                        </RadioGroup>
                    )}

                    {/* Coding */}
                    {currentQ.questionType === 'coding' && currentQ.codingDetails && (
                        <Box>
                            <Box sx={{ mb: 2, p: 2, borderRadius: '10px', background: '#F8F9FE' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{currentQ.codingDetails.problemStatement}</Typography>
                                {currentQ.codingDetails.constraints && (
                                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#888' }}>Constraints: {currentQ.codingDetails.constraints}</Typography>
                                )}
                            </Box>
                            {(currentQ.codingDetails.sampleInput || currentQ.codingDetails.sampleOutput) && (
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    {currentQ.codingDetails.sampleInput && (
                                        <Box sx={{ flex: 1, p: 1.5, borderRadius: '8px', background: '#263238', color: '#E0E0E0', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre' }}>
                                            <Typography variant="caption" sx={{ color: '#81C784' }}>Input</Typography><br />
                                            {currentQ.codingDetails.sampleInput}
                                        </Box>
                                    )}
                                    {currentQ.codingDetails.sampleOutput && (
                                        <Box sx={{ flex: 1, p: 1.5, borderRadius: '8px', background: '#263238', color: '#E0E0E0', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre' }}>
                                            <Typography variant="caption" sx={{ color: '#81C784' }}>Output</Typography><br />
                                            {currentQ.codingDetails.sampleOutput}
                                        </Box>
                                    )}
                                </Box>
                            )}
                            <FormControl size="small" sx={{ mb: 1, minWidth: 140 }}>
                                <InputLabel>Language</InputLabel>
                                <Select value={answers[currentQ._id]?.language || 'javascript'} label="Language"
                                    onChange={(e) => setAnswers({ ...answers, [currentQ._id]: { ...answers[currentQ._id], language: e.target.value } })}>
                                    {(currentQ.codingDetails.languages || ['javascript', 'python', 'c++']).map((l) => (
                                        <MenuItem key={l} value={l}>{l}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField fullWidth multiline rows={12} value={answers[currentQ._id]?.code || ''}
                                onChange={(e) => setAnswers({ ...answers, [currentQ._id]: { ...answers[currentQ._id], code: e.target.value } })}
                                placeholder="Write your code here..."
                                sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.85rem' }, '& .MuiOutlinedInput-root': { borderRadius: '10px', background: '#1E1E2F', color: '#E0E0E0' } }} />
                        </Box>
                    )}

                    {/* Navigation */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button startIcon={<PrevIcon />} onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
                            sx={{ color: '#5C6BC0' }}>Previous</Button>
                        {currentIdx < questions.length - 1 ? (
                            <Button endIcon={<NextIcon />} onClick={() => setCurrentIdx(currentIdx + 1)}
                                variant="contained" sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)' }}>Next</Button>
                        ) : (
                            <Button endIcon={<SubmitIcon />} onClick={() => setSubmitDialog(true)}
                                variant="contained" sx={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>Submit Test</Button>
                        )}
                    </Box>
                </Card>
            </Box>

            {/* Submit Confirmation */}
            <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon sx={{ color: '#ED6C02' }} /> Submit Test?
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                        You have answered {answered} out of {questions.length} questions.
                        {answered < questions.length && ` ${questions.length - answered} question(s) unanswered.`}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setSubmitDialog(false)} sx={{ color: '#888' }}>Continue Test</Button>
                    <Button variant="contained" onClick={() => handleSubmit()} disabled={submitting}
                        sx={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
                        {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TakeTestPage;
