import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/features/auth/services/authService';
import { AuthBackground } from '../components/AuthBackground';
import { AuthLogo } from '../components/AuthLogo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuspended, setIsSuspended] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  useEffect(() => { setIsLoaded(true); }, []);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSuspended(false);
    setIsSubmitting(true);
    try {
      const response = await authService.login({ email, password });
      const user = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      if (!token) throw new Error('No token received from server');
      login(user, token);
      setTimeout(() => navigate('/dashboard', { replace: true }), 100);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.message === 'ACCOUNT_SUSPENDED') {
        setIsSuspended(true);
        setError('');
      } else {
        setIsSuspended(false);
        setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#0f1419] selection:bg-[#FF6B00] selection:text-white overflow-hidden px-6 sm:px-0 py-8 sm:py-0 safe-y">
      <AuthBackground />

      <div className={`z-10 w-full max-w-[420px] transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <header className="flex flex-col items-center mb-8 sm:mb-14">
          <AuthLogo className="mb-8 sm:mb-10 w-full" />
          <div className="text-center space-y-2 px-4">
            <h1 className="text-[#8B4513] dark:text-[#D4956B] text-[10px] sm:text-[11px] font-[900] tracking-[0.4em] sm:tracking-[0.45em] uppercase">
              EMRS PORTAL
            </h1>
            <div className="h-[2px] w-10 bg-[#FF6B00] mx-auto opacity-90" />
            <p className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.18em] opacity-80 mt-1 leading-relaxed">
              Equipment & Resource Management System
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-7">
          {isSuspended && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border-[1.5px] border-amber-400 dark:border-amber-500/40 px-4 py-4 space-y-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">Account Suspended</span>
              </div>
              <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">
                Your account has been deactivated. Please contact the <strong>IT Department</strong> to restore access.
              </p>
            </div>
          )}
          {error && !isSuspended && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-black text-[#8B4513] dark:text-[#FF6B00] uppercase tracking-[0.15em] ml-0.5">
              Corporate Email
            </label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@wellfluid.com"
              className="w-full h-12 px-4 bg-[#F8FAFC] dark:bg-[#1a1f26] border-[1.5px] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-[#FF6B00] focus:bg-white dark:focus:bg-[#242b33] transition-all duration-200 placeholder:text-slate-300 dark:placeholder:text-slate-500 rounded-none shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center px-0.5">
              <label htmlFor="password" className="text-[10px] font-black text-[#8B4513] dark:text-[#FF6B00] uppercase tracking-[0.15em]">
                Access Password
              </label>
              <Link to="/forgot-password" className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider hover:underline transition-all">
                Forgot Access?
              </Link>
            </div>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 bg-[#F8FAFC] dark:bg-[#1a1f26] border-[1.5px] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-[#FF6B00] focus:bg-white dark:focus:bg-[#242b33] transition-all duration-200 placeholder:text-slate-300 dark:placeholder:text-slate-500 rounded-none shadow-inner"
            />
          </div>
          <button type="submit" disabled={isSubmitting}
            className="group relative w-full h-12 mt-4 bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-[11px] uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center overflow-hidden active:scale-[0.99] shadow-md rounded-none disabled:opacity-70"
          >
            <span className={`transition-all duration-300 ${isSubmitting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              Authorize Access
            </span>
            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <div className="pt-6 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-100 dark:bg-white/10" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300 dark:text-slate-500 whitespace-nowrap">INTERNAL USE ONLY</span>
            <div className="h-[1px] flex-1 bg-slate-100 dark:bg-white/10" />
          </div>
        </form>

        <footer className="mt-12 sm:mt-20 text-center pb-4 sm:pb-0">
          <p className="text-slate-300 dark:text-slate-600 text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-bold">
            &copy; 2026 WellFluid Services Nigeria
          </p>
        </footer>
      </div>

      <div className="absolute top-0 left-0 w-full h-[3px] bg-[#FF6B00]" />
      <div className="absolute top-0 right-0 w-1/4 h-[3px] bg-[#8B4513]" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-50 dark:bg-white/5" />
    </main>
  );
};

export default LoginPage;
