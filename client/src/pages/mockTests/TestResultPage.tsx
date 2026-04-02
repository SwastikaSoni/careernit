import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Card, Typography, Chip, CircularProgress, Button, Grid,
} from '@mui/material';
import {
    CheckCircle as CorrectIcon, Cancel as WrongIcon, HourglassEmpty as UnansweredIcon,
    EmojiEvents as TrophyIcon, ArrowBack as BackIcon,
    Quiz as QuizIcon, Code as CodeIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { getAttemptResult } from '../../services/mockTestService';



const TestResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [attempt, setAttempt] = useState<any>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                // Find the student's submitted attempt for this test
                const { getAllMockTests } = await import('../../services/mockTestService');
                const data = await getAllMockTests();
                const myAttempt = (data.attempts || []).find((a: any) => a.test === id && a.status === 'submitted');
                if (myAttempt) {
                    const result = await getAttemptResult(myAttempt._id);
                    setAttempt(result.attempt);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>;
    }

    if (!attempt) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: '#999' }}>No submitted attempt found</Typography>
                <Button onClick={() => navigate('/dashboard/mock-tests')} sx={{ mt: 2, color: '#5C6BC0' }}>Back to Tests</Button>
            </Box>
        );
    }

    const test = attempt.test;
    const passed = attempt.totalScore >= (test?.passingMarks || 0);
    const correct = attempt.answers.filter((a: any) => a.isCorrect).length;
    const wrong = attempt.answers.filter((a: any) => !a.isCorrect && (a.selectedOption !== undefined || a.code)).length;
    const unanswered = attempt.answers.length - correct - wrong;

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard/mock-tests')} sx={{ color: '#5C6BC0', mb: 2 }}>
                Back to Tests
            </Button>

            {/* Score Card */}
            <Card sx={{
                p: 4, mb: 3, borderRadius: '20px', textAlign: 'center',
                background: passed ? 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' : 'linear-gradient(135deg, #FFEBEE, #FFCDD2)',
                border: `2px solid ${passed ? '#2E7D32' : '#D32F2F'}`,
            }}>
                <TrophyIcon sx={{ fontSize: 56, color: passed ? '#2E7D32' : '#D32F2F', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: passed ? '#1B5E20' : '#B71C1C' }}>
                    {attempt.percentage}%
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: passed ? '#2E7D32' : '#D32F2F', mb: 1 }}>
                    {passed ? 'Congratulations! You Passed!' : 'Better Luck Next Time'}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#555' }}>
                    {attempt.totalScore} / {test?.totalMarks || 0} marks
                </Typography>
                {test?.title && <Typography variant="body2" sx={{ color: '#777', mt: 1 }}>{test.title}</Typography>}
                {attempt.submittedAt && <Typography variant="caption" sx={{ color: '#999' }}>Submitted {dayjs(attempt.submittedAt).format('MMM D, YYYY h:mm A')}</Typography>}
            </Card>

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 4 }}>
                    <Card sx={{ p: 2, borderRadius: '14px', textAlign: 'center', borderLeft: '4px solid #2E7D32' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#2E7D32' }}>{correct}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#555' }}>Correct</Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 4 }}>
                    <Card sx={{ p: 2, borderRadius: '14px', textAlign: 'center', borderLeft: '4px solid #D32F2F' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#D32F2F' }}>{wrong}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#555' }}>Wrong</Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 4 }}>
                    <Card sx={{ p: 2, borderRadius: '14px', textAlign: 'center', borderLeft: '4px solid #9E9E9E' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#9E9E9E' }}>{unanswered}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#555' }}>Unanswered</Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Question-by-Question Review */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Question Review</Typography>
            {attempt.answers.map((ans: any, idx: number) => {
                const q = ans.question;
                if (!q) return null;

                return (
                    <Card key={idx} sx={{
                        p: 2.5, mb: 2, borderRadius: '14px',
                        borderLeft: `4px solid ${ans.isCorrect ? '#2E7D32' : ans.selectedOption !== undefined || ans.code ? '#D32F2F' : '#9E9E9E'}`,
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label={`Q${idx + 1}`} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', height: 24 }} />
                                {ans.isCorrect
                                    ? <CorrectIcon sx={{ color: '#2E7D32', fontSize: 20 }} />
                                    : (ans.selectedOption !== undefined || ans.code)
                                        ? <WrongIcon sx={{ color: '#D32F2F', fontSize: 20 }} />
                                        : <UnansweredIcon sx={{ color: '#9E9E9E', fontSize: 20 }} />
                                }
                                <Chip icon={q.questionType === 'coding' ? <CodeIcon sx={{ fontSize: 14 }} /> : <QuizIcon sx={{ fontSize: 14 }} />}
                                    label={q.questionType} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: ans.isCorrect ? '#2E7D32' : '#D32F2F' }}>
                                {ans.marksAwarded} marks
                            </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, lineHeight: 1.5 }}>{q.title}</Typography>

                        {/* MCQ Answer Review */}
                        {q.questionType === 'aptitude' && q.options && (
                            <Box sx={{ mb: 1 }}>
                                {q.options.map((opt: any, i: number) => (
                                    <Box key={i} sx={{
                                        display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, py: 0.5, px: 1.5, borderRadius: '8px',
                                        background: opt.isCorrect ? '#E8F5E9' : ans.selectedOption === i ? '#FFEBEE' : '#F8F9FE',
                                        border: opt.isCorrect ? '1px solid #2E7D32' : ans.selectedOption === i ? '1px solid #D32F2F' : '1px solid transparent',
                                    }}>
                                        <Chip label={String.fromCharCode(65 + i)} size="small"
                                            sx={{
                                                fontWeight: 700, minWidth: 28, height: 22, fontSize: '0.75rem',
                                                background: opt.isCorrect ? '#2E7D32' : ans.selectedOption === i ? '#D32F2F' : '#E0E0E0',
                                                color: opt.isCorrect || ans.selectedOption === i ? '#fff' : '#555',
                                            }} />
                                        <Typography variant="body2">{opt.text}</Typography>
                                        {opt.isCorrect && <CorrectIcon sx={{ fontSize: 16, color: '#2E7D32', ml: 'auto' }} />}
                                        {ans.selectedOption === i && !opt.isCorrect && <WrongIcon sx={{ fontSize: 16, color: '#D32F2F', ml: 'auto' }} />}
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* Coding Answer Review */}
                        {q.questionType === 'coding' && ans.code && (
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#555' }}>Your Code ({ans.language}):</Typography>
                                <Box sx={{ mt: 0.5, p: 1.5, borderRadius: '8px', background: '#1E1E2F', color: '#E0E0E0', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>
                                    {ans.code}
                                </Box>
                            </Box>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                            <Box sx={{ mt: 1, p: 1.5, borderRadius: '8px', background: '#FFF8E1', borderLeft: '3px solid #FFB300' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#F57F17' }}>Explanation</Typography>
                                <Typography variant="body2" sx={{ color: '#555', mt: 0.3 }}>{q.explanation}</Typography>
                            </Box>
                        )}
                    </Card>
                );
            })}
        </Box>
    );
};

export default TestResultPage;
