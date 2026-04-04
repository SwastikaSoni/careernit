import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
  RocketLaunch as RocketIcon,
  EmojiEvents as TrophyIcon,
  AutoAwesome as SparkleIcon,
  WorkspacePremium as BadgeIcon,
} from '@mui/icons-material';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email.toLowerCase().endsWith('@student.nitw.ac.in')) {
      setError('Use your @student.nitw.ac.in email to register.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone || undefined);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Panel – Form */}
      <Box
        sx={{
          flex: { xs: '1 1 100%', md: '1 1 45%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 3, sm: 6 },
          py: 4,
          bgcolor: '#FAFBFE',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '10px',
              background: 'linear-gradient(135deg, #7E57C2, #5C6BC0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RocketIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#1A1A2E' }}>CareerNIT</Typography>
          </Box>

          <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#1A1A2E', mb: 0.5 }}>
            Create Account
          </Typography>
          <Typography sx={{ color: '#888', mb: 3, fontSize: '0.95rem' }}>
            Start your placement journey today
          </Typography>

          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            p: 1.5, borderRadius: '12px', mb: 3,
            background: 'linear-gradient(135deg, rgba(92,107,192,0.08), rgba(126,87,194,0.08))',
            border: '1px solid rgba(92,107,192,0.15)',
          }}>
            <EmailIcon sx={{ color: '#5C6BC0', fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.8rem', color: '#5C6BC0', fontWeight: 600 }}>
              Use your @student.nitw.ac.in email
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth required margin="dense"
              label="Full Name" name="name"
              value={form.name} onChange={handleChange}
              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#fff', '&:hover fieldset': { borderColor: '#7E57C2' } } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#7E57C2', fontSize: 20 }} /></InputAdornment> } }}
            />
            <TextField
              fullWidth required margin="dense"
              label="Email" name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="you@student.nitw.ac.in"
              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#fff', '&:hover fieldset': { borderColor: '#7E57C2' } } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#7E57C2', fontSize: 20 }} /></InputAdornment> } }}
            />
            <TextField
              fullWidth margin="dense"
              label="Phone (optional)" name="phone"
              value={form.phone} onChange={handleChange}
              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#fff', '&:hover fieldset': { borderColor: '#7E57C2' } } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#7E57C2', fontSize: 20 }} /></InputAdornment> } }}
            />
            <TextField
              fullWidth required margin="dense"
              label="Password" name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={handleChange}
              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#fff', '&:hover fieldset': { borderColor: '#7E57C2' } } }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#7E57C2', fontSize: 20 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth required margin="dense"
              label="Confirm Password" name="confirmPassword"
              type="password"
              value={form.confirmPassword} onChange={handleChange}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#fff', '&:hover fieldset': { borderColor: '#7E57C2' } } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#7E57C2', fontSize: 20 }} /></InputAdornment> } }}
            />

            <Button
              type="submit" fullWidth variant="contained" disabled={loading}
              sx={{
                py: 1.6, borderRadius: '14px', fontSize: '1rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #7E57C2 0%, #5C6BC0 100%)',
                boxShadow: '0 8px 32px rgba(126,87,194,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5C6BC0 0%, #7E57C2 100%)',
                  boxShadow: '0 12px 40px rgba(126,87,194,0.45)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s',
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Get Started →'}
            </Button>
          </Box>

          <Typography sx={{ textAlign: 'center', mt: 3, color: '#888', fontSize: '0.9rem' }}>
            Already registered?{' '}
            <Typography
              component={Link} to="/login"
              sx={{ color: '#7E57C2', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Sign In
            </Typography>
          </Typography>
        </Box>
      </Box>

      {/* Right Panel – Branding */}
      <Box
        sx={{
          flex: '1 1 55%',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #0f3460 0%, #16213e 30%, #1a1a2e 60%, #533483 100%)',
          px: { md: 6, lg: 10 },
          py: 8,
        }}
      >
        {/* Animated gradient orbs */}
        <Box sx={{
          position: 'absolute', width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(126,87,194,0.35) 0%, transparent 70%)',
          top: -80, left: -80, animation: 'float 7s ease-in-out infinite',
          '@keyframes float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-25px)' } },
        }} />
        <Box sx={{
          position: 'absolute', width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(92,107,192,0.25) 0%, transparent 70%)',
          bottom: -60, right: -60, animation: 'float 9s ease-in-out infinite reverse',
        }} />
        <Box sx={{
          position: 'absolute', width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(179,157,219,0.2) 0%, transparent 70%)',
          top: '50%', right: '30%', animation: 'float 6s ease-in-out infinite',
        }} />

        <Box sx={{ position: 'relative', zIndex: 2, color: '#fff', maxWidth: 500 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RocketIcon sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: -0.5 }}>
              CareerNIT
            </Typography>
          </Box>

          {/* Headline */}
          <Typography sx={{
            fontWeight: 900, fontSize: { md: '2.8rem', lg: '3.5rem' },
            lineHeight: 1.1, mb: 2,
            background: 'linear-gradient(135deg, #B39DDB 0%, #fff 60%)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
          }}>
            Your Future Awaits
          </Typography>
          <Typography sx={{ fontSize: '1.1rem', opacity: 0.6, mb: 6, fontWeight: 400 }}>
            Join the placement network that powers careers
          </Typography>

          {/* Feature cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { icon: <TrophyIcon />, title: 'Dream Placements', sub: 'Top MNCs recruit from NITW every year' },
              { icon: <SparkleIcon />, title: 'Skill Building', sub: 'Mock tests, resources & interview prep' },
              { icon: <BadgeIcon />, title: 'Verified Profiles', sub: 'Build a credible placement portfolio' },
            ].map((item, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                p: 2, borderRadius: '16px',
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.3s',
                '&:hover': { background: 'rgba(255,255,255,0.1)', transform: 'translateX(4px)' },
              }}>
                <Box sx={{
                  p: 1.2, borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(126,87,194,0.3), rgba(92,107,192,0.3))',
                  color: '#B39DDB', display: 'flex',
                }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', opacity: 0.55 }}>{item.sub}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;