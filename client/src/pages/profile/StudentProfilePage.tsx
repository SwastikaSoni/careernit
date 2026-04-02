import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarIcon,
  School as SchoolIcon,
  UploadFile as UploadIcon,
  Save as SaveIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getMyProfile, updateMyProfile, uploadResume } from '../../services/profileService';
import { getAllDepartments } from '../../services/departmentService';

const StudentProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    rollNumber: '',
    batch: '',
    department: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    cgpa: '',
    activeBacklogs: '',
    skills: '',
    linkedinUrl: '',
    githubUrl: '',
  });
  const [resume, setResume] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [verificationRemarks, setVerificationRemarks] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, deptData] = await Promise.all([
          getMyProfile(),
          getAllDepartments(),
        ]);

        const u = profileData.user;
        setForm({
          name: u.name || '',
          phone: u.phone || '',
          rollNumber: u.rollNumber || '',
          batch: u.batch?.toString() || '',
          department: u.department?._id || '',
          dateOfBirth: u.dateOfBirth ? u.dateOfBirth.split('T')[0] : '',
          gender: u.gender || '',
          address: u.address || '',
          tenthPercentage: u.tenthPercentage?.toString() || '',
          twelfthPercentage: u.twelfthPercentage?.toString() || '',
          cgpa: u.cgpa?.toString() || '',
          activeBacklogs: u.activeBacklogs?.toString() || '0',
          skills: u.skills?.join(', ') || '',
          linkedinUrl: u.linkedinUrl || '',
          githubUrl: u.githubUrl || '',
        });
        setResume(u.resume || '');
        setVerificationStatus(u.verificationStatus || 'pending');
        setVerificationRemarks(u.verificationRemarks || '');
        setDepartments(deptData.departments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: any = {
        name: form.name,
        phone: form.phone,
        rollNumber: form.rollNumber,
        gender: form.gender || undefined,
        address: form.address,
        linkedinUrl: form.linkedinUrl,
        githubUrl: form.githubUrl,
      };

      if (form.batch) body.batch = Number(form.batch);
      if (form.department) body.department = form.department;
      if (form.dateOfBirth) body.dateOfBirth = form.dateOfBirth;
      if (form.tenthPercentage) body.tenthPercentage = Number(form.tenthPercentage);
      if (form.twelfthPercentage) body.twelfthPercentage = Number(form.twelfthPercentage);
      if (form.cgpa) body.cgpa = Number(form.cgpa);
      if (form.activeBacklogs !== '') body.activeBacklogs = Number(form.activeBacklogs);
      if (form.skills) body.skills = form.skills.split(',').map((s: string) => s.trim()).filter(Boolean);

      const data = await updateMyProfile(body);
      setVerificationStatus(data.user.verificationStatus);
      setVerificationRemarks(data.user.verificationRemarks || '');
      updateUser({ ...user!, name: data.user.name });
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to update profile', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      enqueueSnackbar('Only PDF files are allowed', { variant: 'error' });
      return;
    }

    setUploading(true);
    try {
      const data = await uploadResume(file);
      setResume(data.resume);
      enqueueSnackbar('Resume uploaded successfully', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Upload failed', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: '#5C6BC0' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 3 }}>
        My Profile
      </Typography>

      {/* Verification Status */}
      {verificationStatus === 'pending' && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '14px' }}>
          Your profile is pending verification. Fill in all details below and save to submit for admin review.
        </Alert>
      )}
      {verificationStatus === 'rejected' && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '14px' }}>
          Your profile was rejected. {verificationRemarks && `Reason: ${verificationRemarks}`} — Update your details and save to resubmit.
        </Alert>
      )}
      {verificationStatus === 'verified' && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '14px' }}>
          Your profile is verified. Note: Editing academic fields (CGPA, marks, backlogs, department, batch) will require re-verification.
        </Alert>
      )}

      {/* Personal Information */}
      <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: '18px' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#1A1A2E' }}>
          Personal Information
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Email" value={user?.email || ''} disabled
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth select label="Gender" name="gender" value={form.gender} onChange={handleChange}>
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} />
          </Grid>
        </Grid>
      </Card>

      {/* Academic Information */}
      <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: '18px' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#1A1A2E' }}>
          Academic Information
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Roll Number" name="rollNumber" value={form.rollNumber} onChange={handleChange}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth select label="Department" name="department" value={form.department} onChange={handleChange}>
              <MenuItem value="">Select Department</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d._id} value={d._id}>{d.name} ({d.code})</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Batch (Graduation Year)" name="batch" type="number" value={form.batch} onChange={handleChange}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SchoolIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="10th Percentage" name="tenthPercentage" type="number" value={form.tenthPercentage} onChange={handleChange}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="12th Percentage" name="twelfthPercentage" type="number" value={form.twelfthPercentage} onChange={handleChange}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="CGPA" name="cgpa" type="number" value={form.cgpa} onChange={handleChange}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">/10</InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Active Backlogs" name="activeBacklogs" type="number" value={form.activeBacklogs} onChange={handleChange} />
          </Grid>
        </Grid>
      </Card>

      {/* Skills & Links */}
      <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: '18px' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#1A1A2E' }}>
          Skills & Links
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Skills" name="skills" value={form.skills} onChange={handleChange}
              helperText="Comma-separated e.g. Java, Python, React, SQL"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="LinkedIn URL" name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><LinkIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="GitHub URL" name="githubUrl" value={form.githubUrl} onChange={handleChange}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><LinkIcon sx={{ color: '#999', fontSize: 20 }} /></InputAdornment> } }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Resume Upload */}
      <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: '18px' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#1A1A2E' }}>
          Resume
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={uploading ? <CircularProgress size={18} /> : <UploadIcon />}
            disabled={uploading}
            sx={{ borderRadius: '28px', borderColor: '#5C6BC0', color: '#5C6BC0' }}
          >
            {uploading ? 'Uploading...' : 'Upload Resume (PDF)'}
            <input type="file" accept=".pdf" hidden onChange={handleResumeUpload} />
          </Button>
          {resume && (
            <Chip
              label="Resume Uploaded"
              color="success"
              variant="outlined"
              onClick={() => window.open(`http://localhost:5000${resume}`, '_blank')}
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Box>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            px: 5,
            background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
            '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #9575CD)' },
          }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </Box>
    </Box>
  );
};

export default StudentProfilePage;