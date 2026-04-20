import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Box, Card, Typography, TextField, Button, Grid, CircularProgress, InputAdornment, Avatar, IconButton
} from '@mui/material';
import {
    Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, Save as SaveIcon,
    CameraAlt as CameraIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getMyProfile, updateMyProfile, uploadAvatar } from '../../services/profileService';

const UserProfilePage = () => {
    const { user, updateUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({
        name: '',
        phone: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getMyProfile();
                setForm({
                    name: res.user.name || '',
                    phone: res.user.phone || '',
                });
                setAvatarUrl(res.user.avatar || '');
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            enqueueSnackbar('Only JPEG, PNG, WebP, or GIF images are allowed', { variant: 'error' });
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            enqueueSnackbar('Image must be less than 2MB', { variant: 'error' });
            return;
        }

        setUploadingAvatar(true);
        try {
            const data = await uploadAvatar(file);
            setAvatarUrl(data.avatar);
            updateUser({ ...user!, avatar: data.avatar });
            enqueueSnackbar('Profile picture updated!', { variant: 'success' });
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Upload failed', { variant: 'error' });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = await updateMyProfile({ name: form.name, phone: form.phone });
            updateUser({ ...user!, name: data.user.name });
            enqueueSnackbar('Profile updated successfully', { variant: 'success' });
        } catch (err: any) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to update profile', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress sx={{ color: '#5C6BC0' }} />
            </Box>
        );
    }

    const avatarSrc = avatarUrl ? `http://localhost:5000${avatarUrl}` : undefined;

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 3 }}>
                Profile Details
            </Typography>

            <Card sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                    {/* Avatar with upload overlay */}
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                            src={avatarSrc}
                            sx={{
                                width: 80, height: 80,
                                background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
                                fontSize: '2rem',
                                border: '3px solid rgba(92,107,192,0.2)',
                            }}
                        >
                            {!avatarSrc && (form.name ? form.name.charAt(0).toUpperCase() : 'A')}
                        </Avatar>
                        <IconButton
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            sx={{
                                position: 'absolute', bottom: -4, right: -4,
                                width: 32, height: 32,
                                background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
                                color: '#fff',
                                boxShadow: '0 2px 8px rgba(92,107,192,0.4)',
                                '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #5C6BC0)' },
                            }}
                        >
                            {uploadingAvatar ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CameraIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            hidden
                            onChange={handleAvatarUpload}
                        />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A2E' }}>
                            {user?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#888', textTransform: 'capitalize' }}>
                            {user?.role.replace('_', ' ')}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#999' }} /></InputAdornment>,
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            value={user?.email || ''}
                            disabled
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#999' }} /></InputAdornment>,
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Phone Number"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#999' }} /></InputAdornment>,
                            }}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSave}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <SaveIcon />}
                        sx={{
                            px: 4,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Card>
        </Box>
    );
};

export default UserProfilePage;
