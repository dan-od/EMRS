import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthBackground } from '../components/AuthBackground';
import { AuthLogo } from '../components/AuthLogo';

export const ForgotPasswordPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

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

        <div className="space-y-10 py-4 min-h-[300px] sm:min-h-[320px]">
          <div className="flex flex-col items-center space-y-8">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-16 h-16 relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 12L12 85H88L50 12Z" stroke="#FF6B00" strokeWidth="6" strokeLinejoin="round" />
                <path d="M50 24L24 78H76L50 24Z" stroke="#8B4513" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <rect x="47" y="42" width="6" height="18" fill="#8B4513" rx="1" />
                <rect x="47" y="66" width="6" height="6" fill="#8B4513" rx="1" />
              </svg>
            </div>
            <div className="text-center space-y-5">
              <div className="space-y-2">
                <h2 className="text-[#8B4513] dark:text-[#D4956B] font-[900] text-[13px] uppercase tracking-[0.4em]">Security Alert</h2>
                <div className="h-[2px] w-12 bg-[#FF6B00] mx-auto" />
              </div>
              <div className="space-y-4 px-2">
                <p className="text-slate-600 dark:text-slate-300 text-[11px] font-bold leading-relaxed uppercase tracking-widest opacity-90">
                  Credential recovery is restricted to <span className="text-[#8B4513] dark:text-[#D4956B]">authorized IT administrators</span> only.
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium leading-relaxed uppercase tracking-wider max-w-[260px] mx-auto italic">
                  Please contact your IT department. Self-service password reset is restricted.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#1a1f26] -rotate-1 opacity-50"></div>
            <div className="relative bg-white dark:bg-[#1a1f26] border-[1.5px] border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-sm">
              <p className="text-[#8B4513] dark:text-[#D4956B] text-[9px] font-black uppercase tracking-[0.35em] text-center opacity-60">Technical Support Desk</p>
              <div className="h-[1px] w-full bg-slate-100 dark:bg-white/10"></div>
              <a href="mailto:ICT@WELLFLUIDSERVICES.COM"
                className="block text-[#FF6B00] text-center font-black text-[14px] tracking-[0.05em] hover:text-[#E66000] transition-all hover:scale-[1.02]">
                ICT@WELLFLUIDSERVICES.COM
              </a>
            </div>
          </div>

          <Link to="/login"
            className="group relative w-full h-12 bg-[#8B4513] text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300 flex items-center justify-center active:scale-[0.98] shadow-lg overflow-hidden">
            <span className="relative z-10">Return to Login</span>
            <div className="absolute inset-0 bg-[#FF6B00] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Link>

          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-[#FF6B00] rounded-full"></div>
              <div className="w-1 h-1 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
              <div className="w-1 h-1 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
            </div>
          </div>
        </div>

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

export default ForgotPasswordPage;
