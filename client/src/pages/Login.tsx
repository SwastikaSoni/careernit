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
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  RocketLaunch as RocketIcon,
  TrendingUp as GrowthIcon,
  Business as CompanyIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Panel – Branding */}
      <Box
        sx={{
          flex: '1 1 55%',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
          px: { md: 6, lg: 10 },
          py: 8,
        }}
      >
        {/* Animated gradient orbs */}
        <Box sx={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(126,87,194,0.3) 0%, transparent 70%)',
          top: -100, right: -100, animation: 'float 6s ease-in-out infinite',
          '@keyframes float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-30px)' } },
        }} />
        <Box sx={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(92,107,192,0.25) 0%, transparent 70%)',
          bottom: -80, left: -80, animation: 'float 8s ease-in-out infinite reverse',
        }} />
        <Box sx={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(179,157,219,0.2) 0%, transparent 70%)',
          top: '40%', left: '60%', animation: 'float 7s ease-in-out infinite',
        }} />

        <Box sx={{ position: 'relative', zIndex: 2, color: '#fff', maxWidth: 520 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #7E57C2, #5C6BC0)',
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
            background: 'linear-gradient(135deg, #fff 30%, #B39DDB 100%)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
          }}>
            Launch Your Career
          </Typography>
          <Typography sx={{ fontSize: '1.15rem', opacity: 0.7, mb: 6, fontWeight: 400, maxWidth: 400 }}>
            NIT Warangal's official placement portal
          </Typography>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { icon: <CompanyIcon />, label: '200+', sub: 'Companies' },
              { icon: <GroupsIcon />, label: '95%', sub: 'Placed' },
              { icon: <GrowthIcon />, label: '₹42L', sub: 'Highest CTC' },
            ].map((stat, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                p: 2, borderRadius: '16px',
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
                '&:hover': { background: 'rgba(255,255,255,0.12)', transform: 'translateY(-2px)' },
              }}>
                <Box sx={{ color: '#B39DDB' }}>{stat.icon}</Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>{stat.label}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', opacity: 0.6 }}>{stat.sub}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Panel – Sign In Form */}
      <Box
        sx={{
          flex: { xs: '1 1 100%', md: '1 1 45%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 3, sm: 6 },
          py: 6,
          bgcolor: '#FAFBFE',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4, justifyContent: 'center' }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '10px',
              background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RocketIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#1A1A2E' }}>CareerNIT</Typography>
          </Box>

          <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#1A1A2E', mb: 0.5 }}>
            Sign In
          </Typography>
          <Typography sx={{ color: '#888', mb: 4, fontSize: '0.95rem' }}>
            Access your placement dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth required
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@student.nitw.ac.in"
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: '#fff',
                  '&:hover fieldset': { borderColor: '#5C6BC0' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#5C6BC0', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth required
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: '#fff',
                  '&:hover fieldset': { borderColor: '#5C6BC0' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#5C6BC0', fontSize: 20 }} />
                    </InputAdornment>
                  ),
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

            <Button
              type="submit"
              fullWidth variant="contained" disabled={loading}
              sx={{
                py: 1.6, borderRadius: '14px', fontSize: '1rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #5C6BC0 0%, #7E57C2 100%)',
                boxShadow: '0 8px 32px rgba(92,107,192,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7E57C2 0%, #5C6BC0 100%)',
                  boxShadow: '0 12px 40px rgba(92,107,192,0.45)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s',
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In →'}
            </Button>
          </Box>

          <Typography sx={{ textAlign: 'center', mt: 4, color: '#888', fontSize: '0.9rem' }}>
            New here?{' '}
            <Typography
              component={Link} to="/register"
              sx={{
                color: '#5C6BC0', fontWeight: 700, textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Create Account
            </Typography>
          </Typography>
        </Box>

        <Typography sx={{ mt: 'auto', pt: 4, color: '#bbb', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} CareerNIT · NIT Warangal
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;