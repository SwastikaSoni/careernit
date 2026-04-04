import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    Grid,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Tabs,
    Tab,
    Tooltip,
    IconButton,
} from '@mui/material';
import {
    CardGiftcard as OfferIcon,
    CheckCircle as AcceptIcon,
    Cancel as RejectIcon,
    WorkOutline as JobIcon,
    Add as AddIcon,
    Block as BlockIcon,
    Undo as RevokeIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { getMyOffers, getAllOffers, respondToOffer, createOffer, revokeOffer } from '../../services/offerService';
import { blockStudent } from '../../services/profileService';
import { getAllDrives } from '../../services/driveService';
import { getAllStudents } from '../../services/profileService';
import dayjs from 'dayjs';

interface Offer {
    _id: string;
    student?: { _id: string; name: string; rollNumber: string; isActive?: boolean };
    drive: { _id: string; title: string; packageLPA: number; jobType?: string; company?: { name: string } };
    company: { _id: string; name: string };
    ctc: number;
    status: 'pending' | 'accepted' | 'rejected' | 'revoked';
    rejectedReason?: string;
    issuedAt: string;
}

const STATUS_TABS = ['all', 'pending', 'accepted', 'rejected', 'revoked'] as const;

const OffersPage = () => {
    const { user } = useAuth();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Response Dialog
    const [responseDialogOpen, setResponseDialogOpen] = useState(false);
    const [targetOffer, setTargetOffer] = useState<Offer | null>(null);
    const [responseType, setResponseType] = useState<'accepted' | 'rejected' | null>(null);
    const [rejectedReason, setRejectedReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Create Offer Dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [drives, setDrives] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [offerForm, setOfferForm] = useState({ studentId: '', driveId: '', ctc: '', offerLetterUrl: '' });
    const [creating, setCreating] = useState(false);

    // Confirm action dialog
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
        action: () => Promise<void>;
        color: 'error' | 'warning';
    }>({ open: false, title: '', message: '', action: async () => {}, color: 'error' });

    const { enqueueSnackbar } = useSnackbar();

    const loadCreateData = async () => {
        try {
            const [driveData, studentData] = await Promise.all([
                getAllDrives(),
                getAllStudents()
            ]);
            setDrives(driveData.drives || []);
            setStudents(studentData.students?.filter((s: any) => s.role === 'student' && s.verificationStatus === 'verified') || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenCreateDialog = () => {
        setOfferForm({ studentId: '', driveId: '', ctc: '', offerLetterUrl: '' });
        loadCreateData();
        setCreateDialogOpen(true);
    };

    const handleCreateOffer = async () => {
        if (!offerForm.studentId || !offerForm.driveId || !offerForm.ctc) {
            enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
            return;
        }
        setCreating(true);
        try {
            await createOffer({
                studentId: offerForm.studentId,
                driveId: offerForm.driveId,
                ctc: Number(offerForm.ctc),
                offerLetterUrl: offerForm.offerLetterUrl || undefined
            });
            enqueueSnackbar('Offer created successfully!', { variant: 'success' });
            setCreateDialogOpen(false);
            fetchOffers();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to create offer', { variant: 'error' });
        } finally {
            setCreating(false);
        }
    };

    const fetchOffers = async () => {
        setLoading(true);
        try {
            if (user?.role === 'student') {
                const res = await getMyOffers();
                setOffers(res.offers || []);
            } else {
                const res = await getAllOffers();
                setOffers(res.offers || []);
            }
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to load offers', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, [user]);

    const handleOpenResponseDialog = (offer: Offer, type: 'accepted' | 'rejected') => {
        setTargetOffer(offer);
        setResponseType(type);
        setRejectedReason('');
        setResponseDialogOpen(true);
    };

    const submitResponse = async () => {
        if (!targetOffer || !responseType) return;
        if (responseType === 'rejected' && !rejectedReason.trim()) {
            enqueueSnackbar('Please provide a reason for rejection', { variant: 'warning' });
            return;
        }

        setSubmitting(true);
        try {
            await respondToOffer(targetOffer._id, {
                status: responseType,
                rejectedReason: responseType === 'rejected' ? rejectedReason : undefined,
            });
            enqueueSnackbar(`Offer successfully ${responseType}`, { variant: 'success' });
            setResponseDialogOpen(false);
            fetchOffers();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to submit response', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevokeOffer = (offer: Offer) => {
        setConfirmDialog({
            open: true,
            title: 'Revoke Offer',
            message: `Are you sure you want to revoke the offer for ${offer.student?.name || 'this student'} from ${offer.company?.name}? The student will be notified.`,
            color: 'warning',
            action: async () => {
                try {
                    await revokeOffer(offer._id);
                    enqueueSnackbar('Offer revoked successfully', { variant: 'success' });
                    fetchOffers();
                } catch (err: any) {
                    enqueueSnackbar(err.response?.data?.message || 'Failed to revoke offer', { variant: 'error' });
                }
                setConfirmDialog(prev => ({ ...prev, open: false }));
            }
        });
    };

    const handleBlockStudent = (offer: Offer) => {
        if (!offer.student) return;
        const isCurrentlyActive = offer.student.isActive !== false;
        setConfirmDialog({
            open: true,
            title: isCurrentlyActive ? 'Block Student' : 'Unblock Student',
            message: isCurrentlyActive
                ? `Are you sure you want to block ${offer.student.name}? They will not be able to access the platform.`
                : `Are you sure you want to unblock ${offer.student.name}?`,
            color: 'error',
            action: async () => {
                try {
                    await blockStudent(offer.student!._id, !isCurrentlyActive);
                    enqueueSnackbar(`Student ${isCurrentlyActive ? 'blocked' : 'unblocked'} successfully`, { variant: 'success' });
                    fetchOffers();
                } catch (err: any) {
                    enqueueSnackbar(err.response?.data?.message || 'Failed to update student status', { variant: 'error' });
                }
                setConfirmDialog(prev => ({ ...prev, open: false }));
            }
        });
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'accepted':
                return <Chip label="ACCEPTED" size="small" sx={{ background: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }} />;
            case 'rejected':
                return <Chip label="REJECTED" size="small" sx={{ background: '#FFEBEE', color: '#C62828', fontWeight: 600 }} />;
            case 'revoked':
                return <Chip label="REVOKED" size="small" sx={{ background: '#ECEFF1', color: '#546E7A', fontWeight: 600 }} />;
            default:
                return <Chip label="PENDING" size="small" sx={{ background: '#FFF8E1', color: '#F57F17', fontWeight: 600 }} />;
        }
    };

    const filteredOffers = statusFilter === 'all'
        ? offers
        : offers.filter(o => o.status === statusFilter);

    const statusCounts = {
        all: offers.length,
        pending: offers.filter(o => o.status === 'pending').length,
        accepted: offers.filter(o => o.status === 'accepted').length,
        rejected: offers.filter(o => o.status === 'rejected').length,
        revoked: offers.filter(o => o.status === 'revoked').length,
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress sx={{ color: '#5C6BC0' }} />
            </Box>
        );
    }

    // Admin/Officer View
    if (user?.role !== 'student') {
        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <OfferIcon sx={{ fontSize: 32, color: '#5C6BC0' }} />
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                            All Company Offers
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                        sx={{
                            background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
                            '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' },
                            borderRadius: '12px',
                            px: 3,
                        }}
                    >
                        Add Offer
                    </Button>
                </Box>

                {/* Status Filter Tabs */}
                <Card sx={{ borderRadius: '14px', mb: 2, overflow: 'visible' }}>
                    <Tabs
                        value={statusFilter}
                        onChange={(_, v) => setStatusFilter(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            px: 1,
                            '& .MuiTab-root': { textTransform: 'capitalize', fontWeight: 600, minHeight: 48 },
                            '& .Mui-selected': { color: '#5C6BC0' },
                            '& .MuiTabs-indicator': { backgroundColor: '#5C6BC0' },
                        }}
                    >
                        {STATUS_TABS.map(tab => (
                            <Tab
                                key={tab}
                                value={tab}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                        <span>{tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                                        <Chip
                                            label={statusCounts[tab]}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                background: statusFilter === tab ? '#5C6BC0' : '#E8EAF6',
                                                color: statusFilter === tab ? '#fff' : '#5C6BC0',
                                            }}
                                        />
                                    </Box>
                                }
                            />
                        ))}
                    </Tabs>
                </Card>

                <Card sx={{ borderRadius: '18px', overflow: 'hidden' }}>
                    {filteredOffers.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <JobIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#999' }}>
                                No {statusFilter !== 'all' ? statusFilter : ''} offers found.
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#F8F9FC' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Company / Drive</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>CTC</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Issued On</TableCell>
                                        <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredOffers.map((offer) => (
                                        <TableRow
                                            key={offer._id}
                                            hover
                                            sx={{
                                                bgcolor: offer.status === 'rejected' ? '#FFF8F8' : offer.status === 'revoked' ? '#FAFAFA' : 'inherit',
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{offer.student?.name}</Typography>
                                                        <Typography variant="caption" color="textSecondary">{offer.student?.rollNumber}</Typography>
                                                    </Box>
                                                    {offer.student?.isActive === false && (
                                                        <Chip label="BLOCKED" size="small" sx={{ background: '#FFCDD2', color: '#B71C1C', fontWeight: 600, fontSize: '0.65rem', height: 18 }} />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{offer.company?.name}</Typography>
                                                <Typography variant="caption" color="textSecondary">{offer.drive?.title}</Typography>
                                            </TableCell>
                                            <TableCell>{offer.ctc} LPA</TableCell>
                                            <TableCell>
                                                {getStatusChip(offer.status)}
                                                {offer.status === 'rejected' && offer.rejectedReason && (
                                                    <Typography variant="caption" display="block" color="error" sx={{ mt: 0.5, maxWidth: 200 }}>
                                                        Reason: {offer.rejectedReason}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>{dayjs(offer.issuedAt).format('DD MMM YYYY')}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    {(offer.status === 'pending' || offer.status === 'accepted') && (
                                                        <Tooltip title="Revoke Offer">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleRevokeOffer(offer)}
                                                                sx={{ color: '#FF9800' }}
                                                            >
                                                                <RevokeIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {offer.status === 'rejected' && offer.student && (
                                                        <Tooltip title={offer.student.isActive !== false ? 'Block Student' : 'Unblock Student'}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleBlockStudent(offer)}
                                                                sx={{ color: offer.student.isActive !== false ? '#F44336' : '#4CAF50' }}
                                                            >
                                                                <BlockIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Card>

                {/* Create Offer Dialog */}
                <Dialog open={createDialogOpen} onClose={() => !creating && setCreateDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                    <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddIcon sx={{ color: '#5C6BC0' }} /> Create New Offer
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Select Student</InputLabel>
                                    <Select
                                        value={offerForm.studentId}
                                        label="Select Student"
                                        onChange={(e) => setOfferForm({ ...offerForm, studentId: e.target.value })}
                                    >
                                        {students.map((s) => (
                                            <MenuItem key={s._id} value={s._id}>{s.name} ({s.rollNumber || s.email})</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Select Drive (Company)</InputLabel>
                                    <Select
                                        value={offerForm.driveId}
                                        label="Select Drive (Company)"
                                        onChange={(e) => setOfferForm({ ...offerForm, driveId: e.target.value })}
                                    >
                                        {drives.map((d) => (
                                            <MenuItem key={d._id} value={d._id}>{d.title} — {d.company?.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="CTC (in LPA)"
                                    type="number"
                                    required
                                    value={offerForm.ctc}
                                    onChange={(e) => setOfferForm({ ...offerForm, ctc: e.target.value })}
                                    slotProps={{
                                        input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Offer Letter Link (Optional)"
                                    type="url"
                                    placeholder="https://drive.google.com/..."
                                    value={offerForm.offerLetterUrl}
                                    onChange={(e) => setOfferForm({ ...offerForm, offerLetterUrl: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={() => setCreateDialogOpen(false)} disabled={creating} sx={{ color: '#888' }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateOffer}
                            disabled={creating}
                            sx={{
                                background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
                                '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' }
                            }}
                        >
                            {creating ? <CircularProgress size={22} color="inherit" /> : 'Create Offer'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Confirm Action Dialog */}
                <Dialog
                    open={confirmDialog.open}
                    onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: '16px' } }}
                >
                    <DialogTitle sx={{ fontWeight: 700 }}>{confirmDialog.title}</DialogTitle>
                    <DialogContent>
                        <Typography>{confirmDialog.message}</Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))} sx={{ color: '#888' }}>Cancel</Button>
                        <Button variant="contained" color={confirmDialog.color} onClick={confirmDialog.action}>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }

    // Student View
    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                <OfferIcon sx={{ fontSize: 32, color: '#5C6BC0' }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                    My Job Offers
                </Typography>
            </Box>

            {offers.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                    <JobIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>No offers yet</Typography>
                    <Typography variant="body2" sx={{ color: '#777' }}>
                        Keep preparing and apply to upcoming placement drives. Your hard work will pay off!
                    </Typography>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {offers.map((offer) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={offer._id}>
                            <Card
                                sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    borderTop: offer.status === 'accepted' ? '4px solid #4CAF50' : offer.status === 'rejected' ? '4px solid #F44336' : offer.status === 'revoked' ? '4px solid #9E9E9E' : '4px solid #5C6BC0',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    transition: 'transform 0.3s',
                                    '&:hover': { transform: 'translateY(-5px)' },
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
                                            {offer.company?.name || 'Company'}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                                            {offer.drive?.title}
                                        </Typography>
                                    </Box>
                                    {getStatusChip(offer.status)}
                                </Box>

                                <Box sx={{ mb: 3, flex: 1 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 1 }}>
                                        {offer.ctc} <Typography component="span" variant="body1" color="textSecondary">LPA</Typography>
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Job Type:</strong> {offer.drive?.jobType || 'Full-time'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Issued on:</strong> {dayjs(offer.issuedAt).format('DD MMM YYYY')}
                                    </Typography>
                                </Box>

                                {offer.status === 'pending' && (
                                    <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto' }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            startIcon={<AcceptIcon />}
                                            onClick={() => handleOpenResponseDialog(offer, 'accepted')}
                                            sx={{ borderRadius: '10px', py: 1 }}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            startIcon={<RejectIcon />}
                                            onClick={() => handleOpenResponseDialog(offer, 'rejected')}
                                            sx={{ borderRadius: '10px', py: 1 }}
                                        >
                                            Reject
                                        </Button>
                                    </Box>
                                )}

                                {offer.status === 'rejected' && offer.rejectedReason && (
                                    <Box sx={{ mt: 2, p: 1.5, bgcolor: '#FFEBEE', borderRadius: '8px' }}>
                                        <Typography variant="caption" color="#C62828">
                                            <strong>Reason for rejection:</strong> {offer.rejectedReason}
                                        </Typography>
                                    </Box>
                                )}

                                {offer.status === 'revoked' && (
                                    <Box sx={{ mt: 2, p: 1.5, bgcolor: '#ECEFF1', borderRadius: '8px' }}>
                                        <Typography variant="caption" color="#546E7A">
                                            This offer has been revoked by the administration.
                                        </Typography>
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Response Dialog */}
            <Dialog open={responseDialogOpen} onClose={() => !submitting && setResponseDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {responseType === 'accepted' ? <AcceptIcon color="success" /> : <RejectIcon color="error" />}
                    {responseType === 'accepted' ? 'Accept Offer' : 'Reject Offer'}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Are you sure you want to <strong>{responseType}</strong> the offer from <strong>{targetOffer?.company?.name}</strong>?
                        {responseType === 'accepted' && " This confirms your placement and may subject you to university placement policies."}
                        {responseType === 'rejected' && " This action cannot be undone and will be reported to the placement administration."}
                    </Typography>

                    {responseType === 'rejected' && (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Please state your reason for rejecting the offer (Required)"
                            value={rejectedReason}
                            onChange={(e) => setRejectedReason(e.target.value)}
                            required
                            variant="outlined"
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setResponseDialogOpen(false)} disabled={submitting} sx={{ color: '#888' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color={responseType === 'accepted' ? 'success' : 'error'}
                        onClick={submitResponse}
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={22} color="inherit" /> : `Confirm ${responseType === 'accepted' ? 'Acceptance' : 'Rejection'}`}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OffersPage;
