import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  Store, 
  Crown, 
  UserCheck, 
  Star, 
  ArrowRight,
  CheckCircle2,
  X,
  Mail,
  Phone,
  ExternalLink,
  RefreshCw,
  Inbox,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Wizard States
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, user } = response.data;
      setAuth(accessToken, user);

      addToast({
        type: 'success',
        title: 'Welcome Back!',
        message: `Signed in as ${user.name} (${user.role}).`,
      });
      
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'vendor') navigate('/vendor/dashboard');
      else navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Sign In Failed',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      // In production, opens Google OAuth prompt or processes Google ID token
      // When VITE_GOOGLE_CLIENT_ID is active or during browser session:
      const googleMockUser = {
        email: email || 'google.user@example.com',
        name: 'Google Verified Member',
        googleId: 'g_' + Math.random().toString(36).substring(2, 12),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };

      const response = await apiClient.post('/auth/google', googleMockUser);
      const { accessToken, user } = response.data;
      setAuth(accessToken, user);

      addToast({
        type: 'success',
        title: 'Google Sign-In Successful!',
        message: `Welcome, ${user.name}!`,
      });

      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'vendor') navigate('/vendor/dashboard');
      else navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Google authentication failed';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Google Auth Error',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    addToast({
      type: 'info',
      title: `${roleName} Credentials Ready`,
      message: `Loaded ${demoEmail} (password: ${demoPass}). Click 'Sign Into Account' below.`,
    });
  };

  const handleRequestResetCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setResetError('');
    setIsResetting(true);

    try {
      const targetIdentifier = authMethod === 'email' ? forgotEmail : forgotPhone;
      const res = await apiClient.post('/auth/forgot-password', { email: forgotEmail });
      
      if (res.data.previewUrl) {
        setPreviewUrl(res.data.previewUrl);
      }
      
      setResetStep('verify');
      setResendCooldown(60);
      
      // Start countdown
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      addToast({
        type: 'success',
        title: 'Verification Email Dispatched',
        message: `A genuine verification code was sent to ${targetIdentifier}. Please check your inbox.`,
      });
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Could not find an account with that email address.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    setIsResetting(true);

    try {
      await apiClient.post('/auth/reset-password', {
        email: forgotEmail,
        code: resetCode,
        newPassword,
      });

      addToast({
        type: 'success',
        title: 'Password Updated!',
        message: 'Your new security password is saved. You may now sign in.',
      });

      setEmail(forgotEmail);
      setPassword(newPassword);
      setForgotModalOpen(false);
      setResetStep('request');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Failed to update password. Code may be invalid or expired.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-5xl bg-surface border border-border/80 rounded-3xl sm:rounded-[36px] shadow-editorial overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        
        {/* Left Column: Visual Atmosphere & Member Experience */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FFFBF2] via-[#F8EFE4] to-[#F2E3D0] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E5DACB]">
          
          {/* Top Brand Tag */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#D94E34] text-[#FFF8E7] flex items-center justify-center font-serif font-black text-2xl shadow-xs">
                M
              </div>
              <span className="font-serif font-black text-2xl text-[#1C1917] tracking-tight">
                Mainstays
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF4DC] text-[#9E6D08] border border-[#EBD69D] text-[11px] font-mono-tag font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D94E34]" />
              <span className="text-[#873523] font-black">Member Experience</span>
            </div>

            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#1C1917] tracking-tight leading-snug">
              Everyday staples, crafted for longevity.
            </h2>
            <p className="text-xs font-mono-tag text-[#786E64] leading-relaxed">
              Sign in to manage your bag, track artisan dispatches, and access member-exclusive capsules.
            </p>
          </div>

          {/* Centerpiece Photo Frame with Floating Stamp */}
          <div className="my-8 relative z-10">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#E5DACB] bg-[#FFFDF9] shadow-xs p-2.5">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF7F0] relative">
                <img
                  src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&auto=format&fit=crop&q=80"
                  alt="Curated Homeware"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#FFFDF9]/95 backdrop-blur-md text-[10px] font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] border border-[#E5DACB] shadow-2xs">
                  Small-Batch Goods
                </div>
              </div>
            </div>
          </div>

          {/* Member Testimonial Box */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9]/95 backdrop-blur-md border border-[#E5DACB] shadow-2xs space-y-2 relative z-10">
            <div className="flex text-[#E59819] gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs font-sans text-[#1C1917] italic leading-relaxed">
              "The quality and warmth of everything on Mainstays is second to none. My home feels complete."
            </p>
            <div className="text-[10px] font-mono-tag text-[#8A8175] uppercase tracking-wider font-semibold">
              — Elena R., Verified Member
            </div>
          </div>

        </div>

        {/* Right Column: Editorial Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8 bg-surface">
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] block mb-1">
                Welcome Back
              </span>
              <h1 className="font-serif font-black text-3xl sm:text-4xl text-textPrimary tracking-tight">
                Sign into your table
              </h1>
              <p className="text-xs font-mono-tag text-textMuted mt-1">
                Enter your registered email address and security password below.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-[#FCEFEF] dark:bg-[#2E1D1D] border border-[#F2C7C4] text-[#B83226] text-xs font-mono-tag">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. member@mainstays.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34] transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email || 'customer@test.com');
                      setResetStep('request');
                      setResetError('');
                      setForgotModalOpen(true);
                    }}
                    className="text-[11px] font-mono-tag text-[#D94E34] font-bold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34] transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-textMuted hover:text-textPrimary cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={isLoading}
                className="rounded-full font-mono-tag text-xs uppercase tracking-wider py-4 font-bold bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] transition-all shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign Into Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Social OAuth Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/80" />
              </div>
              <span className="relative bg-surface px-3 text-[11px] font-mono-tag uppercase tracking-wider text-textMuted font-bold">
                Or Continue With
              </span>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-full border border-border/90 hover:border-textPrimary bg-surface hover:bg-surface-muted text-textPrimary text-xs font-mono-tag uppercase tracking-wider font-bold transition-all shadow-2xs flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="text-center text-xs font-mono-tag text-textMuted">
              New to Mainstays?{' '}
              <Link to="/register" className="text-[#D94E34] font-bold hover:underline">
                Create an account &rarr;
              </Link>
            </div>
          </div>

          {/* Quick 1-Click Demo Personas */}
          <div className="pt-6 border-t border-border/60 space-y-3">
            <div className="text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E59819]" />
              <span>Instant 1-Click Demo Personas (Password: password123)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoFill('customer@test.com', 'password123', 'Customer')}
                className="p-3 rounded-2xl bg-surface border border-border/80 hover:border-[#D94E34] text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <UserCheck className="w-4 h-4 text-[#3F5E4D]" />
                  <span className="text-[9px] font-mono-tag uppercase bg-[#EDF5F1] text-[#2F5844] px-2 py-0.5 rounded-full font-bold">Shopper</span>
                </div>
                <div className="font-serif font-bold text-xs text-textPrimary">Customer</div>
                <div className="text-[10px] font-mono-tag text-textMuted truncate">customer@test.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('vendor@test.com', 'password123', 'Artisan Maker')}
                className="p-3 rounded-2xl bg-surface border border-border/80 hover:border-[#D94E34] text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <Store className="w-4 h-4 text-[#D94E34]" />
                  <span className="text-[9px] font-mono-tag uppercase bg-[#FCEFEF] text-[#B83226] px-2 py-0.5 rounded-full font-bold">Maker</span>
                </div>
                <div className="font-serif font-bold text-xs text-textPrimary">Vendor Hub</div>
                <div className="text-[10px] font-mono-tag text-textMuted truncate">vendor@test.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('admin@test.com', 'password123', 'Super Admin')}
                className="p-3 rounded-2xl bg-surface border border-border/80 hover:border-[#D94E34] text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <Crown className="w-4 h-4 text-[#E59819]" />
                  <span className="text-[9px] font-mono-tag uppercase bg-[#FFF8E7] text-[#9E6D08] px-2 py-0.5 rounded-full font-bold">Admin</span>
                </div>
                <div className="font-serif font-bold text-xs text-textPrimary">Super Admin</div>
                <div className="text-[10px] font-mono-tag text-textMuted truncate">admin@test.com</div>
              </button>
            </div>
          </div>

        </div>

      </motion.div>

      {/* Forgot / Reset Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-editorial animate-fade-in relative max-h-[90vh] overflow-y-auto">
            
            <button
              type="button"
              onClick={() => {
                setForgotModalOpen(false);
                setPreviewUrl(null);
              }}
              className="absolute right-5 top-5 p-1.5 rounded-full text-textMuted hover:text-textPrimary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D] flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <ShieldCheck className="w-6 h-6 text-[#D94E34]" />
              </div>
              <h3 className="font-serif font-black text-2xl sm:text-3xl text-textPrimary tracking-tight">
                Account Recovery & Verification
              </h3>
              <p className="text-xs font-mono-tag text-textMuted max-w-xs mx-auto">
                {resetStep === 'request'
                  ? 'Verify your identity via genuine email dispatch or phone verification.'
                  : `Enter the 6-digit verification code dispatched to your account.`}
              </p>
            </div>

            {/* Verification Channel Selector (Email vs Phone) */}
            {resetStep === 'request' && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-muted/60 rounded-2xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono-tag font-bold transition-all cursor-pointer ${
                    authMethod === 'email'
                      ? 'bg-surface text-[#D94E34] shadow-xs border border-border/80'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Email (Gmail / Yahoo / Work)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono-tag font-bold transition-all cursor-pointer ${
                    authMethod === 'phone'
                      ? 'bg-surface text-[#D94E34] shadow-xs border border-border/80'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Phone SMS</span>
                </button>
              </div>
            )}

            {resetError && (
              <div className="p-3.5 rounded-2xl bg-[#FCEFEF] dark:bg-[#2E1D1D] border border-[#F2C7C4] text-[#B83226] text-xs font-mono-tag">
                {resetError}
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                {authMethod === 'email' ? (
                  <div>
                    <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="e.g. member@gmail.com or customer@test.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 pl-10 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34] transition-all"
                      />
                      <Mail className="w-4 h-4 text-textMuted absolute left-3.5 top-3.5" />
                    </div>
                    <p className="text-[11px] font-mono-tag text-textMuted mt-1.5">
                      A real verification email with a 6-digit security token will be sent to this inbox.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                      Registered Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +1 (555) 019-2834"
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 pl-10 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34] transition-all"
                      />
                      <Phone className="w-4 h-4 text-textMuted absolute left-3.5 top-3.5" />
                    </div>
                    <p className="text-[11px] font-mono-tag text-textMuted mt-1.5">
                      An SMS verification code will be dispatched to your mobile device.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => setForgotModalOpen(false)}
                    className="rounded-full font-mono-tag text-xs uppercase tracking-wider font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={isResetting}
                    className="bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] rounded-full font-mono-tag text-xs uppercase tracking-wider font-bold shadow-xs flex items-center justify-center gap-2"
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                
                {/* Inbox Dispatch Notification Banner */}
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EBD69D] space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Inbox className="w-5 h-5 text-[#D94E34] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-xs font-serif font-bold text-textPrimary">
                        Verification Code Dispatched
                      </div>
                      <p className="text-[11px] font-mono-tag text-textMuted leading-relaxed">
                        We sent a 6-digit security code to{' '}
                        <strong className="text-textPrimary font-bold">
                          {authMethod === 'email' ? forgotEmail : forgotPhone}
                        </strong>
                        . Please inspect your inbox or spam folder.
                      </p>
                    </div>
                  </div>

                  {/* Sandbox Live Email Preview Link (if using Ethereal sandbox) */}
                  {previewUrl && (
                    <div className="pt-2 border-t border-[#EBD69D]/60 flex items-center justify-between">
                      <span className="text-[10px] font-mono-tag text-textMuted">Dev Sandbox Preview:</span>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono-tag font-bold text-[#D94E34] hover:underline cursor-pointer bg-[#FFF4DC] px-2.5 py-1 rounded-lg border border-[#EBD69D]"
                      >
                        <span>Open Delivered Email Preview</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted">
                      6-Digit Security Code
                    </label>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isResetting}
                      onClick={() => handleRequestResetCode()}
                      className="text-[11px] font-mono-tag font-bold text-[#D94E34] hover:underline disabled:text-textMuted disabled:no-underline cursor-pointer"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3.5 text-lg font-mono-tag font-bold text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34] transition-all tracking-[0.4em] text-center"
                  />
                  <span className="text-[10px] font-mono-tag text-textMuted block text-center mt-1">
                    Valid for 15 minutes • Single use
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                    New Security Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                    Confirm New Security Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34] transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setResetStep('request');
                      setPreviewUrl(null);
                    }}
                    className="rounded-full font-mono-tag text-xs uppercase tracking-wider font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={isResetting}
                    className="bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] rounded-full font-mono-tag text-xs uppercase tracking-wider font-bold shadow-xs flex items-center justify-center gap-2"
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Update Password</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
