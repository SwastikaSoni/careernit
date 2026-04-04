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
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Tooltip,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
  HourglassTop as PendingIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getAllStudents, verifyStudent } from '../../services/profileService';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  batch?: number;
  department?: { _id: string; name: string; code: string };
  gender?: string;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  cgpa?: number;
  activeBacklogs?: number;
  skills?: string[];
  resume?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  verificationStatus: string;
  verificationRemarks?: string;
  createdAt: string;
}

const VerificationPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [rejectingStudent, setRejectingStudent] = useState<Student | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const data = await getAllStudents(params);
      setStudents(data.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const handleSearch = () => {
    fetchStudents();
  };

  const handleApprove = async (student: Student) => {
    try {
      await verifyStudent(student._id, { status: 'verified' });
      enqueueSnackbar(`${student.name} verified successfully`, { variant: 'success' });
      setViewStudent(null);
      fetchStudents();
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to verify', { variant: 'error' });
    }
  };

  const handleOpenReject = (student: Student) => {
    setRejectingStudent(student);
    setRejectRemarks('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingStudent) return;
    try {
      await verifyStudent(rejectingStudent._id, { status: 'rejected', remarks: rejectRemarks });
      enqueueSnackbar(`${rejectingStudent.name} rejected`, { variant: 'info' });
      setRejectDialogOpen(false);
      setViewStudent(null);
      fetchStudents();
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to reject', { variant: 'error' });
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'verified':
        return <Chip label="Verified" size="small" sx={{ background: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: '0.72rem' }} />;
      case 'rejected':
        return <Chip label="Rejected" size="small" sx={{ background: '#FFEBEE', color: '#C62828', fontWeight: 600, fontSize: '0.72rem' }} />;
      default:
        return <Chip label="Pending" size="small" sx={{ background: '#FFF3E0', color: '#E65100', fontWeight: 600, fontSize: '0.72rem' }} />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 3 }}>
        Student Verification
      </Typography>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              size="small"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment>,
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 8, sm: 4 }}>
            <TextField
              fullWidth
              select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><FilterIcon sx={{ color: '#999' }} /></InputAdornment>,
                },
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 4, sm: 2 }}>
            <Button fullWidth variant="contained" onClick={handleSearch}
              sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' }, height: 40 }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: '18px', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress sx={{ color: '#5C6BC0' }} />
          </Box>
        ) : students.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <PendingIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#999' }}>No students found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#555' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555', display: { xs: 'none', sm: 'table-cell' } }}>Roll No</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555', display: { xs: 'none', md: 'table-cell' } }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555', display: { xs: 'none', md: 'table-cell' } }}>CGPA</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s._id} sx={{ '&:hover': { background: '#FAFAFF' }, transition: 'background 0.2s' }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>{s.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {s.rollNumber || '—'}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {s.department?.code || '—'}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {s.cgpa?.toFixed(2) || '—'}
                    </TableCell>
                    <TableCell>{getStatusChip(s.verificationStatus)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setViewStudent(s)} sx={{ color: '#5C6BC0' }}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {s.verificationStatus === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton size="small" onClick={() => handleApprove(s)} sx={{ color: '#4CAF50' }}>
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" onClick={() => handleOpenReject(s)} sx={{ color: '#EF5350' }}>
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* View Student Dialog */}
      <Dialog
        open={Boolean(viewStudent)}
        onClose={() => setViewStudent(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        {viewStudent && (
          <>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              {viewStudent.name}
              {getStatusChip(viewStudent.verificationStatus)}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>Email</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewStudent.email}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>Phone</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewStudent.phone || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>Roll Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewStudent.rollNumber || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>Department</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewStudent.department?.name || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>Batch</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewStudent.batch || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>Gender</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>{viewStudent.gender || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>10th %</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewStudent.tenthPercentage ?? '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>12th %</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewStudent.twelfthPercentage ?? '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>CGPA</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#5C6BC0', fontSize: '1.1rem' }}>{viewStudent.cgpa?.toFixed(2) ?? '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>Active Backlogs</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewStudent.activeBacklogs ?? '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>Skills</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {viewStudent.skills?.length ? viewStudent.skills.map((s, i) => (
                      <Chip key={i} label={s} size="small" sx={{ background: '#EDE7F6', color: '#5C6BC0', fontSize: '0.72rem' }} />
                    )) : <Typography variant="body2" sx={{ color: '#999' }}>—</Typography>}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>Resume</Typography>
                  {viewStudent.resume ? (
                    <Button size="small" onClick={() => window.open(`http://localhost:5000${viewStudent.resume}`, '_blank')}
                      sx={{ display: 'block', mt: 0.5, color: '#5C6BC0' }}>
                      View Resume
                    </Button>
                  ) : <Typography variant="body2" sx={{ color: '#999' }}>Not uploaded</Typography>}
                </Grid>
                {viewStudent.verificationRemarks && (
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ color: '#999' }}>Admin Remarks</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#C62828' }}>{viewStudent.verificationRemarks}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, flexWrap: 'wrap', gap: 1 }}>
              <Button onClick={() => setViewStudent(null)} sx={{ color: '#888' }}>Close</Button>
              {viewStudent.verificationStatus === 'pending' && (
                <>
                  <Button variant="contained" onClick={() => handleApprove(viewStudent)}
                    sx={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', '&:hover': { background: 'linear-gradient(135deg, #2E7D32, #1B5E20)' } }}>
                    Approve
                  </Button>
                  <Button variant="contained" onClick={() => handleOpenReject(viewStudent)}
                    sx={{ background: 'linear-gradient(135deg, #EF5350, #C62828)', '&:hover': { background: 'linear-gradient(135deg, #C62828, #B71C1C)' } }}>
                    Reject
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Student</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#555', mb: 2 }}>
            Provide a reason for rejecting <strong>{rejectingStudent?.name}</strong>'s profile.
          </Typography>
          <TextField
            fullWidth
            label="Remarks (optional)"
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            multiline
            rows={3}
            placeholder="e.g. CGPA does not match uploaded marksheet"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRejectDialogOpen(false)} sx={{ color: '#888' }}>Cancel</Button>
          <Button variant="contained" onClick={handleReject}
            sx={{ background: 'linear-gradient(135deg, #EF5350, #C62828)', '&:hover': { background: 'linear-gradient(135deg, #C62828, #B71C1C)' } }}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerificationPage;