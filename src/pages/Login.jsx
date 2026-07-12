import React, { useState, useContext } from 'react';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, ArrowRight, Factory } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { Navigate, Link } from 'react-router-dom';
import logoImg from '../assets/Logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  
  const { user, login, data, t } = useContext(AppContext);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const users = data?.users || [];

  const handleLogin = (e) => {
    e.preventDefault();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      setError(t('invalid_login'));
      return;
    }
    setError('');
    login({ ...found, initials: found.initials || found.name?.[0] || 'U' });
  };

  const autofillUser = (u) => {
    setEmail(u.email);
    setPassword(u.password);
    setError('');
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return { label: 'Admin', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' };
    return { label: 'Engineer', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' };
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
          <div className="grid grid-cols-1 gap-2 mt-1 max-h-36 overflow-y-auto pr-1">
            {users.map((u, i) => {
              const badge = getRoleBadge(u.role);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => autofillUser(u)}
                  className="p-2.5 text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-accent/40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-[11px] flex items-center gap-2 active:scale-[0.97]"
                >
                  <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center text-accent font-bold text-[11px] shrink-0">
                    {u.initials || u.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{u.email}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${badge.cls}`}>{badge.label}</span>
                </button>
              );
            })}
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
              <Link to="/forgot-password" the className="text-xs font-medium text-accent hover:text-indigo-500 transition-colors">
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

        <div className="mt-6 text-center text-xs text-slate-400">
          <ShieldCheck size={14} className="inline mr-1" />
          ระบบรักษาความปลอดภัยข้อมูลพลังงานองค์กร
        </div>
      </div>
    </div>
  );
}
