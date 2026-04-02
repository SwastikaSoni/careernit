import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
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
  CardActionArea,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Language as WebIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getAllCompanies, createCompany, updateCompany, deleteCompany } from '../../services/companyService';

interface Company {
  _id: string;
  name: string;
  industry: string;
  website?: string;
  description?: string;
  location: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
}

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState({
    name: '', industry: '', website: '', description: '', location: '', contactEmail: '', contactPhone: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchCompanies = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const data = await getAllCompanies(params);
      setCompanies(data.companies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setForm({ name: '', industry: '', website: '', description: '', location: '', contactEmail: '', contactPhone: '' });
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (c: Company) => {
    setEditingCompany(c);
    setForm({
      name: c.name, industry: c.industry, website: c.website || '', description: c.description || '',
      location: c.location, contactEmail: c.contactEmail || '', contactPhone: c.contactPhone || '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.industry.trim() || !form.location.trim()) {
      setFormError('Name, Industry and Location are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (editingCompany) {
        await updateCompany(editingCompany._id, form);
        enqueueSnackbar('Company updated successfully', { variant: 'success' });
      } else {
        await createCompany(form);
        enqueueSnackbar('Company created successfully', { variant: 'success' });
      }
      setDialogOpen(false);
      fetchCompanies();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCompany) return;
    try {
      await deleteCompany(deletingCompany._id);
      enqueueSnackbar('Company deleted', { variant: 'success' });
      setDeleteDialogOpen(false);
      fetchCompanies();
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed', { variant: 'error' });
    }
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress sx={{ color: '#5C6BC0' }} /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Companies</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
          sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' } }}>
          Add Company
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 3, borderRadius: '18px' }}>
        <TextField fullWidth placeholder="Search companies by name, industry, or location..." value={search}
          onChange={(e) => setSearch(e.target.value)} size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment> } }}
        />
      </Card>

      {filtered.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
          <BusinessIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#999' }}>No companies found</Typography>
          <Typography variant="body2" sx={{ color: '#BBB', mt: 0.5 }}>
            {search ? 'Try a different search term' : 'Click "Add Company" to register one'}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {filtered.map((c) => (
            <Grid key={c._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ borderRadius: '18px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2.5, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 44, height: 44, background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', fontSize: '1.1rem', fontWeight: 700 }}>
                        {c.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{c.name}</Typography>
                        <Chip label={c.industry} size="small" sx={{ background: '#EDE7F6', color: '#5C6BC0', fontWeight: 500, fontSize: '0.7rem', height: 22, mt: 0.3 }} />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.3 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEdit(c)} sx={{ color: '#5C6BC0' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => { setDeletingCompany(c); setDeleteDialogOpen(true); }} sx={{ color: '#EF5350' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {c.description && (
                    <Typography variant="body2" sx={{ color: '#777', mb: 1.5, fontSize: '0.82rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <LocationIcon sx={{ fontSize: 16, color: '#999' }} />
                      <Typography variant="caption" sx={{ color: '#777' }}>{c.location}</Typography>
                    </Box>
                    {c.website && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <WebIcon sx={{ fontSize: 16, color: '#999' }} />
                        <Typography variant="caption" sx={{ color: '#5C6BC0', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          onClick={() => window.open(c.website, '_blank')}>
                          {c.website}
                        </Typography>
                      </Box>
                    )}
                    {c.contactEmail && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <EmailIcon sx={{ fontSize: 16, color: '#999' }} />
                        <Typography variant="caption" sx={{ color: '#777' }}>{c.contactEmail}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingCompany ? 'Edit Company' : 'Add Company'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, mt: 1, borderRadius: '12px' }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} required
                helperText="e.g. IT, Finance, Manufacturing" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocationIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><WebIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Contact Email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Contact Phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#888' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}
            sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' } }}>
            {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : editingCompany ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Company</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#555' }}>
            Are you sure you want to delete <strong>{deletingCompany?.name}</strong>? This action cannot be undone.
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

export default CompaniesPage;