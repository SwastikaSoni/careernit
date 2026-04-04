import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
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
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
  Tooltip,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ToggleOn as ActiveIcon,
  ToggleOff as InactiveIcon,
  Search as SearchIcon,
  BadgeOutlined as OfficerIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getAllOfficers, createOfficer, toggleOfficerStatus, deleteOfficer } from '../../services/officerService';
import { getAllDepartments } from '../../services/departmentService';

interface Officer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department?: { _id: string; name: string; code: string };
  isActive: boolean;
  createdAt: string;
}

const OfficersPage = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOfficer, setDeletingOfficer] = useState<Officer | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', department: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchData = async () => {
    try {
      const [officerData, deptData] = await Promise.all([getAllOfficers(), getAllDepartments()]);
      setOfficers(officerData.officers);
      setDepartments(deptData.departments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('Name, Email and Password are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await createOfficer({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        department: form.department || undefined,
      });
      enqueueSnackbar('Placement Officer created successfully', { variant: 'success' });
      setDialogOpen(false);
      setForm({ name: '', email: '', password: '', phone: '', department: '' });
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create officer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (officer: Officer) => {
    try {
      await toggleOfficerStatus(officer._id);
      enqueueSnackbar(`Officer ${officer.isActive ? 'deactivated' : 'activated'}`, { variant: 'success' });
      fetchData();
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingOfficer) return;
    try {
      await deleteOfficer(deletingOfficer._id);
      enqueueSnackbar('Officer deleted', { variant: 'success' });
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to delete', { variant: 'error' });
    }
  };

  const filtered = officers.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Placement Officers</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ name: '', email: '', password: '', phone: '', department: '' }); setFormError(''); setDialogOpen(true); }}
          sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' } }}>
          Add Officer
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
        <TextField fullWidth placeholder="Search officers..." value={search} onChange={(e) => setSearch(e.target.value)} size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }}
        />
      </Card>

      <Card sx={{ borderRadius: '18px', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <OfficerIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#999' }}>No officers found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#555' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555', display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555', display: { xs: 'none', md: 'table-cell' } }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o._id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{o.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#999', display: { sm: 'none' } }}>{o.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{o.email}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {o.department?.code ? (
                        <Chip label={o.department.code} size="small" sx={{ background: '#EDE7F6', color: '#5C6BC0', fontWeight: 600, fontSize: '0.72rem' }} />
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip label={o.isActive ? 'Active' : 'Inactive'} size="small"
                        sx={{ background: o.isActive ? '#E8F5E9' : '#FFEBEE', color: o.isActive ? '#2E7D32' : '#C62828', fontWeight: 600, fontSize: '0.72rem' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={o.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton size="small" onClick={() => handleToggle(o)} sx={{ color: o.isActive ? '#4CAF50' : '#999' }}>
                          {o.isActive ? <ActiveIcon /> : <InactiveIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => { setDeletingOfficer(o); setDeleteDialogOpen(true); }} sx={{ color: '#EF5350' }}>
                          <DeleteIcon fontSize="small" />
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

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Placement Officer</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, mt: 1, borderRadius: '12px' }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth select label="Department (Optional)" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <MenuItem value="">None</MenuItem>
                {departments.map((d) => <MenuItem key={d._id} value={d._id}>{d.name} ({d.code})</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#888' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={submitting}
            sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' } }}>
            {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Officer</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#555' }}>
            Are you sure you want to delete <strong>{deletingOfficer?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#888' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete}
            sx={{ background: 'linear-gradient(135deg, #EF5350, #C62828)', '&:hover': { background: 'linear-gradient(135deg, #C62828, #B71C1C)' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OfficersPage;