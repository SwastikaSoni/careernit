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
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as DeptIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../../services/departmentService';

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const DepartmentList = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data.departments);
    } catch (err) {
      enqueueSnackbar('Failed to fetch departments', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditing(null);
    setForm({ name: '', code: '', description: '' });
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditing(dept);
    setForm({ name: dept.name, code: dept.code, description: dept.description || '' });
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenDelete = (dept: Department) => {
    setDeleting(dept);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setFormError('Name and Code are required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editing) {
        await updateDepartment(editing._id, form);
        enqueueSnackbar('Department updated successfully', { variant: 'success' });
      } else {
        await createDepartment(form);
        enqueueSnackbar('Department created successfully', { variant: 'success' });
      }
      setDialogOpen(false);
      fetchDepartments();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    setSubmitting(true);
    try {
      await deleteDepartment(deleting._id);
      enqueueSnackbar('Department deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setDeleting(null);
      fetchDepartments();
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to delete', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#5C6BC0' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
            Departments
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 0.3 }}>
            Manage academic departments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
            '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' },
          }}
        >
          Add Department
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ p: 2, mb: 3, borderRadius: '14px' }}>
        <TextField
          fullWidth
          placeholder="Search departments by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#999', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: '18px', overflow: 'hidden' }}>
        {filteredDepartments.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <DeptIcon sx={{ fontSize: 64, color: '#DDD', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#999' }}>
              No departments found
            </Typography>
            <Typography variant="body2" sx={{ color: '#BBB', mt: 0.5 }}>
              {search ? 'Try a different search term' : 'Click "Add Department" to create one'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#F8F9FC' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#555' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555' }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555', display: { xs: 'none', md: 'table-cell' } }}>
                    Description
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#555' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepartments.map((dept) => (
                  <TableRow
                    key={dept._id}
                    sx={{
                      '&:hover': { background: '#FAFBFF' },
                      transition: 'background 0.2s',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <DeptIcon sx={{ color: '#FFF', fontSize: 18 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1A2E' }}>
                          {dept.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dept.code}
                        size="small"
                        sx={{
                          background: '#EDE7F6',
                          color: '#5C6BC0',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ color: '#888', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dept.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dept.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          background: dept.isActive ? '#E8F5E9' : '#FFEBEE',
                          color: dept.isActive ? '#2E7D32' : '#C62828',
                          fontWeight: 600,
                          fontSize: '0.72rem',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEdit(dept)} sx={{ color: '#5C6BC0' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleOpenDelete(dept)} sx={{ color: '#EF5350' }}>
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

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? 'Edit Department' : 'Add New Department'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1, borderRadius: '10px' }}>
              {formError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Department Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            placeholder="e.g. Computer Science and Engineering"
          />
          <TextField
            fullWidth
            label="Department Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            sx={{ mb: 2 }}
            placeholder="e.g. CSE"
            slotProps={{ htmlInput: { maxLength: 10 } }}
          />
          <TextField
            fullWidth
            label="Description (Optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            multiline
            rows={3}
            placeholder="Brief description of the department"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#888' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
              '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' },
            }}
          >
            {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Department</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: '#555' }}>
            Are you sure you want to delete <strong>{deleting?.name}</strong> ({deleting?.code})? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#888' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={submitting}
            sx={{
              background: 'linear-gradient(135deg, #EF5350, #C62828)',
              '&:hover': { background: 'linear-gradient(135deg, #C62828, #B71C1C)' },
            }}
          >
            {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentList;