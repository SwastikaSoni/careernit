import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Grid, Chip, CircularProgress, Avatar,
    Stepper, Step, StepLabel,
} from '@mui/material';
import {
    Event as EventIcon, CheckCircle as PassIcon, Cancel as FailIcon,
    HourglassEmpty as PendingIcon, LocationOn as LocationIcon,
    CalendarToday as CalendarIcon, CurrencyRupee as SalaryIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { getAllInterviews } from '../../services/interviewService';

const roundTypeLabels: Record<string, string> = {
    technical: 'Technical', hr: 'HR', group_discussion: 'Group Discussion',
    aptitude: 'Aptitude', coding: 'Coding', other: 'Other',
};
const statusColors: Record<string, string> = { scheduled: '#1565C0', in_progress: '#ED6C02', completed: '#2E7D32', cancelled: '#9E9E9E' };
const statusBg: Record<string, string> = { scheduled: '#E3F2FD', in_progress: '#FFF3E0', completed: '#E8F5E9', cancelled: '#F5F5F5' };
const statusLabels: Record<string, string> = { scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };

interface Round { roundNumber: number; roundType: string; scheduledDate?: string; venue?: string; interviewerName?: string; result: string; feedback?: string; }
interface Interview {
    _id: string;
    drive: { _id: string; title: string; packageLPA?: number; jobType: string; company: { name: string; logo?: string } };
    rounds: Round[]; status: string; createdAt: string;
}

const MyInterviewsPage = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getAllInterviews();
                setInterviews(data.interviews);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>;
    }

    // Split into upcoming vs past
    const upcoming = interviews.filter((i) => i.status === 'scheduled' || i.status === 'in_progress');
    const past = interviews.filter((i) => i.status === 'completed' || i.status === 'cancelled');

    const renderCard = (intv: Interview) => (
        <Grid key={intv._id} size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: '18px', overflow: 'hidden', borderLeft: `4px solid ${statusColors[intv.status]}` }}>
                <Box sx={{ p: 2.5 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                        <Avatar sx={{ width: 44, height: 44, background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', fontSize: '1.1rem', fontWeight: 700 }}>
                            {intv.drive?.company?.name?.charAt(0) || 'C'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {intv.drive?.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#777' }}>{intv.drive?.company?.name}</Typography>
                        </Box>
                        <Chip label={statusLabels[intv.status]} size="small"
                            sx={{ background: statusBg[intv.status], color: statusColors[intv.status], fontWeight: 700, fontSize: '0.72rem', height: 24 }} />
                    </Box>

                    {/* Details */}
                    {intv.drive?.packageLPA != null && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                            <SalaryIcon sx={{ fontSize: 16, color: '#2E7D32' }} />
                            <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600 }}>{intv.drive.packageLPA} LPA</Typography>
                        </Box>
                    )}

                    {/* Rounds Timeline */}
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#555', mb: 1, display: 'block', mt: 1.5 }}>
                        Interview Rounds ({intv.rounds.length})
                    </Typography>
                    <Stepper orientation="vertical" activeStep={-1} sx={{ '& .MuiStepConnector-line': { minHeight: 16 } }}>
                        {intv.rounds.map((r, i) => (
                            <Step key={i} completed={r.result === 'passed'}>
                                <StepLabel
                                    error={r.result === 'failed'}
                                    icon={r.result === 'passed' ? <PassIcon sx={{ color: '#2E7D32', fontSize: 20 }} /> : r.result === 'failed' ? <FailIcon sx={{ color: '#D32F2F', fontSize: 20 }} /> : <PendingIcon sx={{ color: '#9E9E9E', fontSize: 20 }} />}
                                >
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                                            Round {r.roundNumber}: {roundTypeLabels[r.roundType]}
                                            <Chip label={r.result} size="small" sx={{
                                                ml: 1, height: 18, fontSize: '0.65rem', fontWeight: 600,
                                                background: r.result === 'passed' ? '#E8F5E9' : r.result === 'failed' ? '#FFEBEE' : '#F5F5F5',
                                                color: r.result === 'passed' ? '#2E7D32' : r.result === 'failed' ? '#D32F2F' : '#9E9E9E',
                                            }} />
                                        </Typography>
                                        {r.scheduledDate && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                                <CalendarIcon sx={{ fontSize: 13, color: '#999' }} />
                                                <Typography variant="caption" sx={{ color: '#888' }}>{dayjs(r.scheduledDate).format('MMM D, YYYY h:mm A')}</Typography>
                                            </Box>
                                        )}
                                        {r.venue && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LocationIcon sx={{ fontSize: 13, color: '#999' }} />
                                                <Typography variant="caption" sx={{ color: '#888' }}>{r.venue}</Typography>
                                            </Box>
                                        )}
                                        {r.feedback && (
                                            <Typography variant="caption" sx={{ color: '#555', fontStyle: 'italic', display: 'block', mt: 0.3 }}>
                                                "{r.feedback}"
                                            </Typography>
                                        )}
                                    </Box>
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
            </Card>
        </Grid>
    );

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 3 }}>My Interviews</Typography>

            {interviews.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <EventIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>No interviews yet</Typography>
                    <Typography variant="body2" sx={{ color: '#BBB', mt: 0.5 }}>Once you're shortlisted for a drive, your interviews will appear here</Typography>
                </Card>
            ) : (
                <>
                    {upcoming.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventIcon sx={{ fontSize: 20 }} /> Upcoming ({upcoming.length})
                            </Typography>
                            <Grid container spacing={2.5}>{upcoming.map(renderCard)}</Grid>
                        </Box>
                    )}
                    {past.length > 0 && (
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#888', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                Past ({past.length})
                            </Typography>
                            <Grid container spacing={2.5}>{past.map(renderCard)}</Grid>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default MyInterviewsPage;
