import React, { useState, useContext } from 'react';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { Navigate, Link } from 'react-router-dom';
import logoImg from '../assets/Logo.png';

const USERS = [
  {email:'admin@example.com', pw:'admin1234', name:'สมชาย วิศวกร', role:'Administrator', initials:'S'},
  {email:'consult@example.com', pw:'consult1234', name:'วิภาพร ที่ปรึกษา', role:'Consultant', initials:'V'}
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  
  const { user, login, t } = useContext(AppContext);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    const u = USERS.find(u => u.email === email && u.pw === password);
    if (!u) {
      setError(t('invalid_login'));
      return;
    }
    setError('');
    login(u);
  };

  const autofillUser = (u) => {
    setEmail(u.email);
    setPassword(u.pw);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5 bg-animated-gradient relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-full h-[150%] top-[-25%] bg-tech-grid animate-grid-pan opacity-80"></div>
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl animate-fade-in relative z-10 hover:border-accent/40 transition-colors duration-500">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center drop-shadow-md">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">{t('welcome_title')}</h1>
          <p className="text-sm text-muted mt-2">{t('welcome_sub')}</p>
        </div>

        {/* Demo Access Helpers */}
        <div className="p-4 rounded-xl text-xs text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 leading-relaxed">
          <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            {t('demo_access')}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {USERS.map((u, i) => (
              <button
                key={i}
                type="button"
                onClick={() => autofillUser(u)}
                className="p-2 text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-accent/40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-[11px] truncate flex flex-col justify-between active:scale-[0.97]"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{u.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{u.role}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm mb-5 bg-red-500/10 border border-red-500/20 text-red-500 animate-slide-up">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('email')}</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com" 
                className="w-full p-3 px-4 pl-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:border-accent focus:ring-4 focus:ring-accent/10 focus:bg-white dark:focus:bg-slate-800 outline-none shadow-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                required
              />
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('password')}</label>
              <Link to="/forgot-password" className="text-xs font-medium text-accent hover:text-indigo-500 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPw ? 'text' : 'password'} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full p-3 px-4 pl-11 pr-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:border-accent focus:ring-4 focus:ring-accent/10 focus:bg-white dark:focus:bg-slate-800 outline-none shadow-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                required
              />
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <button 
                type="button" 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-transparent border-none p-0 cursor-pointer"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full p-3 mt-4 rounded-xl bg-gradient-to-r from-accent to-indigo-500 text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer border-none"
          >
            {t('signin')} <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:border-accent/40 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:border-accent/40 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account? <Link to="/signup" className="font-semibold text-accent hover:text-indigo-500 transition-colors ml-1">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
