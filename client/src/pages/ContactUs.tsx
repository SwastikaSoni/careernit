import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { sendContactMessage, getContactInfo } from '../services/contactService';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Subject as SubjectIcon,
  Message as MessageIcon,
  RocketLaunch as RocketIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from '@mui/icons-material';

const ContactUs = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [contactInfo, setContactInfo] = useState<{
    email: string;
    phone: string;
    address: string;
    officeHours: string;
  } | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await getContactInfo();
        setContactInfo(data.contactInfo);
      } catch {
        // Use defaults
        setContactInfo({
          email: 'admin@nitw.ac.in',
          phone: '+91-870-246-2020',
          address: 'Training & Placement Cell, NIT Warangal, Telangana 506004, India',
          officeHours: 'Mon - Fri, 9:00 AM - 5:00 PM IST',
        });
      }
    };
    fetchInfo();
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendContactMessage(form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      enqueueSnackbar('Message sent successfully!', { variant: 'success' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
      enqueueSnackbar('Failed to send message.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const infoCards = [
    { icon: <EmailIcon />, label: 'Email Us', value: contactInfo?.email || '...', href: `mailto:${contactInfo?.email}` },
    { icon: <PhoneIcon />, label: 'Call Us', value: contactInfo?.phone || '...', href: `tel:${contactInfo?.phone?.replace(/\s/g, '')}` },
    { icon: <LocationIcon />, label: 'Visit Us', value: contactInfo?.address || '...' },
    { icon: <TimeIcon />, label: 'Office Hours', value: contactInfo?.officeHours || '...' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Panel – Contact Info */}
      <Box
        sx={{
          flex: '1 1 50%',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
          px: { md: 5, lg: 8 },
          py: 8,
        }}
      >
        {/* Animated gradient orbs */}
        <Box sx={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(126,87,194,0.3) 0%, transparent 70%)',
          top: -100, right: -100,
          animation: 'contactFloat 6s ease-in-out infinite',
          '@keyframes contactFloat': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-30px)' } },
        }} />
        <Box sx={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(92,107,192,0.25) 0%, transparent 70%)',
          bottom: -80, left: -80, animation: 'contactFloat 8s ease-in-out infinite reverse',
        }} />
        <Box sx={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(179,157,219,0.2) 0%, transparent 70%)',
          top: '50%', left: '55%', animation: 'contactFloat 7s ease-in-out infinite',
        }} />

        <Box sx={{ position: 'relative', zIndex: 2, color: '#fff', maxWidth: 480 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
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
            fontWeight: 900, fontSize: { md: '2.5rem', lg: '3rem' },
            lineHeight: 1.1, mb: 1.5,
            background: 'linear-gradient(135deg, #fff 30%, #B39DDB 100%)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
          }}>
            Get in Touch
          </Typography>
          <Typography sx={{ fontSize: '1.05rem', opacity: 0.65, mb: 5, fontWeight: 400, maxWidth: 380 }}>
            We'd love to hear from you. Reach out to our placement cell for any queries.
          </Typography>

          {/* Contact Info Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {infoCards.map((card, i) => (
              <Box
                key={i}
                component={card.href ? 'a' : 'div'}
                href={card.href}
                sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 2,
                  p: 2.5, borderRadius: '16px',
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: card.href ? 'pointer' : 'default',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.12)',
                    transform: 'translateX(6px)',
                    borderColor: 'rgba(179,157,219,0.3)',
                  },
                }}
              >
                <Box sx={{
                  width: 42, height: 42, borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(126,87,194,0.3), rgba(92,107,192,0.3))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Box sx={{ color: '#B39DDB', display: 'flex' }}>{card.icon}</Box>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', mb: 0.3 }}>
                    {card.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: '0.95rem', color: '#fff', lineHeight: 1.5 }}>
                    {card.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Panel – Contact Form */}
      <Box
        sx={{
          flex: { xs: '1 1 100%', md: '1 1 50%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 3, sm: 5 },
          py: 5,
          bgcolor: '#FAFBFE',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '10px',
              background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RocketIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#1A1A2E' }}>CareerNIT</Typography>
          </Box>

          {/* Back Link */}
          <Typography
            component={Link} to="/login"
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              color: '#7E57C2', fontWeight: 600, fontSize: '0.88rem',
              textDecoration: 'none', mb: 3,
              transition: 'all 0.2s',
              '&:hover': { color: '#5C6BC0', transform: 'translateX(-3px)' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Login
          </Typography>

          <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#1A1A2E', mb: 0.5 }}>
            Contact Us
          </Typography>
          <Typography sx={{ color: '#888', mb: 3.5, fontSize: '0.95rem' }}>
            Send us a message and we'll respond promptly
          </Typography>

          {/* Mobile contact info */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
            {contactInfo && (
              <>
                <Box
                  component="a"
                  href={`mailto:${contactInfo.email}`}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1,
                    borderRadius: '10px', bgcolor: 'rgba(92,107,192,0.08)',
                    textDecoration: 'none', color: '#5C6BC0', fontSize: '0.82rem', fontWeight: 600,
                    border: '1px solid rgba(92,107,192,0.15)',
                  }}
                >
                  <EmailIcon sx={{ fontSize: 16 }} /> {contactInfo.email}
                </Box>
                <Box
                  component="a"
                  href={`tel:${contactInfo.phone?.replace(/\s/g, '')}`}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1,
                    borderRadius: '10px', bgcolor: 'rgba(126,87,194,0.08)',
                    textDecoration: 'none', color: '#7E57C2', fontSize: '0.82rem', fontWeight: 600,
                    border: '1px solid rgba(126,87,194,0.15)',
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 16 }} /> {contactInfo.phone}
                </Box>
              </>
            )}
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px' }}>
              Your message has been sent! We'll get back to you soon.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth required
              label="Full Name"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="John Doe"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px', bgcolor: '#fff',
                  '&:hover fieldset': { borderColor: '#5C6BC0' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#5C6BC0', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth required
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="your@email.com"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px', bgcolor: '#fff',
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
              label="Subject"
              value={form.subject}
              onChange={handleChange('subject')}
              placeholder="How can we help?"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px', bgcolor: '#fff',
                  '&:hover fieldset': { borderColor: '#5C6BC0' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SubjectIcon sx={{ color: '#5C6BC0', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth required
              label="Message"
              multiline
              rows={4}
              value={form.message}
              onChange={handleChange('message')}
              placeholder="Tell us more about your query..."
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px', bgcolor: '#fff',
                  '&:hover fieldset': { borderColor: '#5C6BC0' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <MessageIcon sx={{ color: '#5C6BC0', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              fullWidth variant="contained" disabled={loading}
              startIcon={!loading && <SendIcon />}
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
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send Message'}
            </Button>
          </Box>

          <Typography sx={{ textAlign: 'center', mt: 3.5, color: '#888', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Typography
              component={Link} to="/login"
              sx={{
                color: '#5C6BC0', fontWeight: 700, textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Sign In
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

export default ContactUs;
