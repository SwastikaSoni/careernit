import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    Divider,
    Avatar,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    CurrencyRupee as SalaryIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    CheckCircle as EligibleIcon,
    Cancel as IneligibleIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

interface Drive {
    _id: string;
    title: string;
    company: { _id: string; name: string; industry: string; logo?: string; location?: string; website?: string };
    description?: string;
    location?: string;
    driveDate?: string;
    lastDateToApply: string;
    packageLPA?: number;
    jobType: string;
    eligibility: {
        departments?: { _id: string; name: string; code: string }[];
        minCGPA?: number;
        maxBacklogs?: number;
        minTenthPercentage?: number;
        minTwelfthPercentage?: number;
        batch?: number;
    };
    status: string;
    applicantCount?: number;
    isEligible?: boolean;
    eligibilityReasons?: string[];
    hasApplied?: boolean;
    applicationStatus?: string;
}

interface Props {
    open: boolean;
    drive: Drive | null;
    onClose: () => void;
    onApply?: (driveId: string) => void;
    applying?: boolean;
    showStudentActions?: boolean;
}

const jobTypeLabel: Record<string, string> = {
    full_time: 'Full Time',
    internship: 'Internship',
    both: 'Full Time + Internship',
};

const statusColors: Record<string, string> = {
    upcoming: '#5C6BC0',
    ongoing: '#2E7D32',
    completed: '#777',
    cancelled: '#D32F2F',
};

const DriveDetailDialog = ({ open, drive, onClose, onApply, applying, showStudentActions }: Props) => {
    if (!drive) return null;

    const deadlinePassed = new Date() > new Date(drive.lastDateToApply);
    const elig = drive.eligibility || {};
    const hasEligCriteria = elig.minCGPA != null || elig.maxBacklogs != null || elig.minTenthPercentage != null ||
        elig.minTwelfthPercentage != null || elig.batch != null || (elig.departments && elig.departments.length > 0);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', fontWeight: 700 }}>
                        {drive.company?.name?.charAt(0) || 'D'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{drive.title}</Typography>
                        <Typography variant="body2" sx={{ color: '#777' }}>{drive.company?.name}</Typography>
                    </Box>
                    <Chip
                        label={drive.status.replace('_', ' ').toUpperCase()}
                        size="small"
                        sx={{ background: statusColors[drive.status] + '18', color: statusColors[drive.status], fontWeight: 600, fontSize: '0.7rem' }}
                    />
                </Box>
            </DialogTitle>

            <DialogContent>
                {/* Key Info Row */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5, mt: 1 }}>
                    {drive.packageLPA != null && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SalaryIcon sx={{ fontSize: 18, color: '#2E7D32' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2E7D32' }}>{drive.packageLPA} LPA</Typography>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WorkIcon sx={{ fontSize: 18, color: '#5C6BC0' }} />
                        <Typography variant="body2" sx={{ color: '#555' }}>{jobTypeLabel[drive.jobType] || drive.jobType}</Typography>
                    </Box>
                    {drive.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon sx={{ fontSize: 18, color: '#999' }} />
                            <Typography variant="body2" sx={{ color: '#555' }}>{drive.location}</Typography>
                        </Box>
                    )}
                </Box>

                {/* Dates */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                    {drive.driveDate && (
                        <Box>
                            <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>DRIVE DATE</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{dayjs(drive.driveDate).format('MMM D, YYYY')}</Typography>
                        </Box>
                    )}
                    <Box>
                        <Typography variant="caption" sx={{ color: deadlinePassed ? '#D32F2F' : '#999', fontWeight: 600 }}>
                            {deadlinePassed ? 'DEADLINE PASSED' : 'LAST DATE TO APPLY'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: deadlinePassed ? '#D32F2F' : 'inherit' }}>
                            {dayjs(drive.lastDateToApply).format('MMM D, YYYY')}
                        </Typography>
                    </Box>
                    {drive.applicantCount != null && (
                        <Box>
                            <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>APPLICANTS</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{drive.applicantCount}</Typography>
                        </Box>
                    )}
                </Box>

                {/* Description */}
                {drive.description && (
                    <>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#1A1A2E' }}>Description</Typography>
                        <Typography variant="body2" sx={{ color: '#555', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                            {drive.description}
                        </Typography>
                    </>
                )}

                {/* Eligibility */}
                {hasEligCriteria && (
                    <>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1A1A2E' }}>Eligibility Criteria</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                            {elig.departments && elig.departments.length > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <SchoolIcon sx={{ fontSize: 16, color: '#5C6BC0' }} />
                                    <Typography variant="body2" sx={{ color: '#555', mr: 0.5 }}>Departments:</Typography>
                                    {elig.departments.map((d) => (
                                        <Chip key={d._id} label={d.code} size="small" sx={{ height: 22, fontSize: '0.72rem', background: '#EDE7F6', color: '#5C6BC0' }} />
                                    ))}
                                </Box>
                            )}
                            {elig.minCGPA != null && (
                                <Typography variant="body2" sx={{ color: '#555' }}>• Min CGPA: <strong>{elig.minCGPA}</strong></Typography>
                            )}
                            {elig.maxBacklogs != null && (
                                <Typography variant="body2" sx={{ color: '#555' }}>• Max Backlogs: <strong>{elig.maxBacklogs}</strong></Typography>
                            )}
                            {elig.minTenthPercentage != null && (
                                <Typography variant="body2" sx={{ color: '#555' }}>• Min 10th %: <strong>{elig.minTenthPercentage}%</strong></Typography>
                            )}
                            {elig.minTwelfthPercentage != null && (
                                <Typography variant="body2" sx={{ color: '#555' }}>• Min 12th %: <strong>{elig.minTwelfthPercentage}%</strong></Typography>
                            )}
                            {elig.batch != null && (
                                <Typography variant="body2" sx={{ color: '#555' }}>• Batch: <strong>{elig.batch}</strong></Typography>
                            )}
                        </Box>
                    </>
                )}

                {/* Student eligibility status */}
                {showStudentActions && (
                    <Box sx={{ mt: 2 }}>
                        {drive.hasApplied ? (
                            <Alert severity="success" sx={{ borderRadius: '12px' }} icon={<EligibleIcon />}>
                                You have applied to this drive. Status: <strong>{drive.applicationStatus?.toUpperCase()}</strong>
                            </Alert>
                        ) : drive.isEligible ? (
                            <Alert severity="success" sx={{ borderRadius: '12px' }} icon={<EligibleIcon />}>
                                You are eligible for this drive!
                            </Alert>
                        ) : (
                            <Alert severity="error" sx={{ borderRadius: '12px' }} icon={<IneligibleIcon />}>
                                Not eligible: {drive.eligibilityReasons?.join(', ')}
                            </Alert>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={onClose} sx={{ color: '#888' }}>Close</Button>
                {showStudentActions && !drive.hasApplied && drive.isEligible && !deadlinePassed && (
                    <Button
                        variant="contained"
                        onClick={() => onApply?.(drive._id)}
                        disabled={applying}
                        sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' } }}
                    >
                        {applying ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Apply Now'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default DriveDetailDialog;
