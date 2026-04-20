import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { forgotPassword, verifyOtp, resetPassword } from '../services/authService';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Fade,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  RocketLaunch as RocketIcon,
  Close as CloseIcon,
  CheckCircleOutline as SuccessIcon,
  ContactSupport as ContactIcon,
  WorkOutline as WorkIcon,
  TimelineOutlined as TimelineIcon,
  NotificationsActiveOutlined as NotifIcon,
} from '@mui/icons-material';

const OTP_LENGTH = 6;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot password state
  const [fpOpen, setFpOpen] = useState(false);
  const [fpStep, setFpStep] = useState(0);
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [fpShowPassword, setFpShowPassword] = useState(false);
  const [fpResetToken, setFpResetToken] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Forgot password handlers
  const openForgotPassword = () => {
    setFpOpen(true);
    setFpStep(0);
    setFpEmail('');
    setFpOtp(Array(OTP_LENGTH).fill(''));
    setFpNewPassword('');
    setFpConfirmPassword('');
    setFpResetToken('');
    setFpError('');
    setFpSuccess('');
  };

  const handleSendOtp = async () => {
    if (!fpEmail) { setFpError('Please enter your email.'); return; }
    setFpLoading(true);
    setFpError('');
    try {
      await forgotPassword(fpEmail);
      setFpSuccess('Verification code sent to your email.');
      setFpStep(1);
    } catch (err: any) {
      setFpError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setFpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...fpOtp];
    newOtp[index] = value;
    setFpOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !fpOtp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setFpOtp(pasted.split(''));
      otpRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = fpOtp.join('');
    if (otpString.length !== OTP_LENGTH) { setFpError('Please enter the complete 6-digit code.'); return; }
    setFpLoading(true);
    setFpError('');
    try {
      const data = await verifyOtp(fpEmail, otpString);
      setFpResetToken(data.resetToken);
      setFpSuccess('Code verified! Set your new password.');
      setFpStep(2);
    } catch (err: any) {
      setFpError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (fpNewPassword.length < 6) { setFpError('Password must be at least 6 characters.'); return; }
    if (fpNewPassword !== fpConfirmPassword) { setFpError('Passwords do not match.'); return; }
    setFpLoading(true);
    setFpError('');
    try {
      await resetPassword(fpResetToken, fpNewPassword);
      setFpSuccess('Password reset successfully!');
      setFpStep(3);
    } catch (err: any) {
      setFpError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setFpLoading(false);
    }
  };

  const stepLabels = ['Email', 'Verify', 'Reset'];

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      bgcolor: 'rgba(255,255,255,0.07)',
      color: '#fff',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(179,157,219,0.5)' },
      '&.Mui-focused fieldset': { borderColor: '#7E57C2' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#B39DDB' },
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

          {/* Feature highlights */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              { icon: <WorkIcon sx={{ fontSize: 20 }} />, text: 'Seamless placement drives' },
              { icon: <TimelineIcon sx={{ fontSize: 20 }} />, text: 'Track your application journey' },
              { icon: <NotifIcon sx={{ fontSize: 20 }} />, text: 'Real-time notifications' },
            ].map((item, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                py: 1.2, px: 2, borderRadius: '14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(6px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255,255,255,0.15)',
                  transform: 'translateX(6px)',
                },
              }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: '10px',
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#B39DDB',
                }}>
                  {item.icon}
                </Box>
                <Typography sx={{ fontWeight: 500, fontSize: '0.92rem' }}>{item.text}</Typography>
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
                mb: 1,
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

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Typography
                component="span"
                onClick={openForgotPassword}
                sx={{
                  color: '#7E57C2',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { color: '#5C6BC0', textDecoration: 'underline' },
                }}
              >
                Forgot Password?
              </Typography>
            </Box>

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

          {/* Contact Us Link */}
          <Typography sx={{ textAlign: 'center', mt: 1.5, color: '#aaa', fontSize: '0.85rem' }}>
            Need help?{' '}
            <Typography
              component={Link} to="/contact"
              sx={{
                color: '#7E57C2', fontWeight: 600, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <ContactIcon sx={{ fontSize: 16 }} /> Contact Us
            </Typography>
          </Typography>
        </Box>

        <Typography sx={{ mt: 'auto', pt: 4, color: '#bbb', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} CareerNIT · NIT Warangal
        </Typography>
      </Box>

      {/* ========== Forgot Password Modal ========== */}
      <Dialog
        open={fpOpen}
        onClose={() => setFpOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            position: 'relative',
          },
        }}
      >
        {/* Decorative orbs */}
        <Box sx={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(126,87,194,0.25) 0%, transparent 70%)',
          top: -60, right: -60, pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', width: 150, height: 150, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(92,107,192,0.2) 0%, transparent 70%)',
          bottom: -40, left: -40, pointerEvents: 'none',
        }} />

        <DialogContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
          {/* Close button */}
          <IconButton
            onClick={() => setFpOpen(false)}
            sx={{
              position: 'absolute', top: 12, right: 12,
              color: 'rgba(255,255,255,0.5)',
              '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '16px',
              background: 'linear-gradient(135deg, #7E57C2, #5C6BC0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
              boxShadow: '0 8px 32px rgba(126,87,194,0.4)',
            }}>
              <LockIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>
              Reset Password
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', mt: 0.5 }}>
              {fpStep === 0 && 'Enter your email to receive a verification code'}
              {fpStep === 1 && 'Enter the 6-digit code sent to your email'}
              {fpStep === 2 && 'Choose a strong new password'}
              {fpStep === 3 && 'Your password has been updated'}
            </Typography>
          </Box>

          {/* Stepper */}
          {fpStep < 3 && (
            <Stepper activeStep={fpStep} alternativeLabel sx={{ mb: 4 }}>
              {stepLabels.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', '&.Mui-active': { color: '#B39DDB' }, '&.Mui-completed': { color: '#7E57C2' } },
                      '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.15)', '&.Mui-active': { color: '#7E57C2' }, '&.Mui-completed': { color: '#5C6BC0' } },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          {/* Alerts */}
          {fpError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px', bgcolor: 'rgba(211,47,47,0.12)', color: '#f48fb1', '& .MuiAlert-icon': { color: '#f48fb1' } }}>
              {fpError}
            </Alert>
          )}
          {fpSuccess && fpStep !== 3 && (
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px', bgcolor: 'rgba(46,125,50,0.12)', color: '#a5d6a7', '& .MuiAlert-icon': { color: '#a5d6a7' } }}>
              {fpSuccess}
            </Alert>
          )}

          {/* Step 0: Enter Email */}
          {fpStep === 0 && (
            <Fade in>
              <Box>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={fpEmail}
                  onChange={(e) => { setFpEmail(e.target.value); setFpError(''); }}
                  placeholder="your@email.com"
                  sx={{ ...inputSx, mb: 3 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#7E57C2', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button
                  fullWidth variant="contained" onClick={handleSendOtp} disabled={fpLoading}
                  sx={{
                    py: 1.5, borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
                    boxShadow: '0 8px 32px rgba(92,107,192,0.35)',
                    '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #5C6BC0)', transform: 'translateY(-1px)' },
                    transition: 'all 0.3s',
                  }}
                >
                  {fpLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Send Verification Code'}
                </Button>
              </Box>
            </Fade>
          )}

          {/* Step 1: Enter OTP */}
          {fpStep === 1 && (
            <Fade in>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 1.5 }, mb: 3 }}>
                  {fpOtp.map((digit, i) => (
                    <Box
                      key={i}
                      component="input"
                      ref={(el: HTMLInputElement | null) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      sx={{
                        width: { xs: 44, sm: 52 }, height: { xs: 52, sm: 60 },
                        textAlign: 'center', fontSize: '1.5rem', fontWeight: 800,
                        color: '#fff', fontFamily: "'Courier New', monospace",
                        border: digit ? '2px solid #7E57C2' : '2px solid rgba(255,255,255,0.15)',
                        borderRadius: '14px',
                        background: digit ? 'rgba(126,87,194,0.15)' : 'rgba(255,255,255,0.05)',
                        outline: 'none',
                        transition: 'all 0.2s',
                        '&:focus': {
                          borderColor: '#B39DDB',
                          background: 'rgba(126,87,194,0.2)',
                          boxShadow: '0 0 20px rgba(126,87,194,0.3)',
                        },
                      }}
                    />
                  ))}
                </Box>
                <Button
                  fullWidth variant="contained" onClick={handleVerifyOtp} disabled={fpLoading}
                  sx={{
                    py: 1.5, borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
                    boxShadow: '0 8px 32px rgba(92,107,192,0.35)',
                    '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #5C6BC0)', transform: 'translateY(-1px)' },
                    transition: 'all 0.3s',
                    mb: 2,
                  }}
                >
                  {fpLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Verify Code'}
                </Button>
                <Typography
                  onClick={handleSendOtp}
                  sx={{
                    textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem',
                    cursor: 'pointer', '&:hover': { color: '#B39DDB' }, transition: 'color 0.2s',
                  }}
                >
                  Didn't receive code? Resend
                </Typography>
              </Box>
            </Fade>
          )}

          {/* Step 2: New Password */}
          {fpStep === 2 && (
            <Fade in>
              <Box>
                <TextField
                  fullWidth
                  label="New Password"
                  type={fpShowPassword ? 'text' : 'password'}
                  value={fpNewPassword}
                  onChange={(e) => { setFpNewPassword(e.target.value); setFpError(''); }}
                  sx={{ ...inputSx, mb: 2 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#7E57C2', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setFpShowPassword(!fpShowPassword)} edge="end" size="small">
                            {fpShowPassword ? <VisibilityOff sx={{ color: 'rgba(255,255,255,0.5)' }} fontSize="small" /> : <Visibility sx={{ color: 'rgba(255,255,255,0.5)' }} fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={fpShowPassword ? 'text' : 'password'}
                  value={fpConfirmPassword}
                  onChange={(e) => { setFpConfirmPassword(e.target.value); setFpError(''); }}
                  sx={{ ...inputSx, mb: 3 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#7E57C2', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button
                  fullWidth variant="contained" onClick={handleResetPassword} disabled={fpLoading}
                  sx={{
                    py: 1.5, borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
                    boxShadow: '0 8px 32px rgba(92,107,192,0.35)',
                    '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #5C6BC0)', transform: 'translateY(-1px)' },
                    transition: 'all 0.3s',
                  }}
                >
                  {fpLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Reset Password'}
                </Button>
              </Box>
            </Fade>
          )}

          {/* Step 3: Success */}
          {fpStep === 3 && (
            <Fade in>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(46,125,50,0.2), rgba(129,199,132,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2.5,
                  border: '2px solid rgba(129,199,132,0.3)',
                }}>
                  <SuccessIcon sx={{ fontSize: 44, color: '#81C784' }} />
                </Box>
                <Typography sx={{ color: '#a5d6a7', fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>
                  Password Updated!
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', mb: 3 }}>
                  You can now sign in with your new password.
                </Typography>
                <Button
                  fullWidth variant="contained"
                  onClick={() => setFpOpen(false)}
                  sx={{
                    py: 1.5, borderRadius: '14px', fontWeight: 700,
                    background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)',
                    '&:hover': { background: 'linear-gradient(135deg, #7E57C2, #5C6BC0)' },
                  }}
                >
                  Back to Sign In
                </Button>
              </Box>
            </Fade>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Login;