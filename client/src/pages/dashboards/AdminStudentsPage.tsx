import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    InputAdornment,
    Tooltip,
} from '@mui/material';
import {
    Search as SearchIcon,
    People as PeopleIcon,
    ToggleOn as ActiveIcon,
    ToggleOff as InactiveIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getAllStudents, blockStudent } from '../../services/profileService';

interface Student {
    _id: string;
    name: string;
    email: string;
    rollNumber?: string;
    department?: { _id: string; name: string; code: string };
    verificationStatus: string;
    isActive: boolean;
    createdAt: string;
}

const AdminStudentsPage = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [targetStudent, setTargetStudent] = useState<Student | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const fetchStudents = async () => {
        try {
            const data = await getAllStudents();
            setStudents(data.students);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleToggleBlock = async () => {
        if (!targetStudent) return;
        try {
            const newStatus = !targetStudent.isActive;
            await blockStudent(targetStudent._id, newStatus);
            enqueueSnackbar(`Student ${newStatus ? 'unblocked' : 'blocked'} successfully`, { variant: 'success' });
            setBlockDialogOpen(false);
            fetchStudents();
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to update student status', { variant: 'error' });
        }
    };

    const filtered = students.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()) ||
            (s.rollNumber && s.rollNumber.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress sx={{ color: '#5C6BC0' }} />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                    Registered Students
                </Typography>
            </Box>

            <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
                <TextField
                    fullWidth
                    placeholder="Search by name, email, or roll number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#999' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Card>

            <Card sx={{ borderRadius: '18px', overflow: 'hidden' }}>
                {filtered.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <PeopleIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#999' }}>
                            No students found
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: '#555' }}>Name & Roll Number</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#555', display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#555', display: { xs: 'none', md: 'table-cell' } }}>Department</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#555' }}>Status & Account</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#555' }} align="right">Block/Unblock</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map((s) => (
                                    <TableRow key={s._id} sx={{ '&:hover': { background: '#FAFAFF' }, transition: 'background 0.2s' }}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                                            <Typography variant="caption" sx={{ color: '#666' }}>{s.rollNumber || 'N/A'}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{s.email}</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                            {s.department?.code ? (
                                                <Chip label={s.department.code} size="small" sx={{ background: '#EDE7F6', color: '#5C6BC0', fontWeight: 600, fontSize: '0.72rem' }} />
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Chip
                                                    label={s.verificationStatus.toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        width: 'fit-content',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 600,
                                                        background:
                                                            s.verificationStatus === 'verified'
                                                                ? '#E8F5E9'
                                                                : s.verificationStatus === 'rejected'
                                                                    ? '#FFEBEE'
                                                                    : '#FFF3E0',
                                                        color:
                                                            s.verificationStatus === 'verified'
                                                                ? '#2E7D32'
                                                                : s.verificationStatus === 'rejected'
                                                                    ? '#C62828'
                                                                    : '#E65100',
                                                    }}
                                                />
                                                <Chip
                                                    label={s.isActive ? 'ACTIVE' : 'BLOCKED'}
                                                    size="small"
                                                    sx={{
                                                        width: 'fit-content',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 600,
                                                        background: s.isActive ? '#E8F5E9' : '#FFE0B2',
                                                        color: s.isActive ? '#2E7D32' : '#E65100',
                                                    }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title={s.isActive ? 'Block Student' : 'Unblock Student'}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setTargetStudent(s);
                                                        setBlockDialogOpen(true);
                                                    }}
                                                    sx={{ color: s.isActive ? '#C62828' : '#4CAF50' }}
                                                >
                                                    {s.isActive ? <InactiveIcon fontSize="large" /> : <ActiveIcon fontSize="large" />}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>

            <Dialog
                open={blockDialogOpen}
                onClose={() => setBlockDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px' } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {targetStudent?.isActive ? 'Block Student?' : 'Unblock Student?'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                        Are you sure you want to {targetStudent?.isActive ? 'block' : 'unblock'} <strong>{targetStudent?.name}</strong>?
                        {targetStudent?.isActive && ' Blocked students cannot login or take any actions.'}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setBlockDialogOpen(false)} sx={{ color: '#888' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleToggleBlock}
                        color={targetStudent?.isActive ? 'error' : 'success'}
                    >
                        {targetStudent?.isActive ? 'Block' : 'Unblock'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminStudentsPage;
