import React, { useState, useContext } from 'react';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/Logo.png';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  
  const { user, t } = useContext(AppContext);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('password_mismatch') || 'Passwords do not match');
      return;
    }
    // Dummy signup logic
    console.log('Signup data:', { firstName, lastName, email, password });
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5 bg-animated-gradient relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-full h-[150%] top-[-25%] bg-tech-grid animate-grid-pan opacity-80"></div>
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl animate-fade-in relative z-10 hover:border-accent/40 transition-colors duration-500 my-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center drop-shadow-md">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t('สมัครสมาชิก') || 'Create Account'}</h1>
        
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm mb-5 bg-red-500/10 border border-red-500/20 text-red-500 animate-slide-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('first_name') || 'First Name'}</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="John" 
                  className="w-full p-3 px-4 pl-11 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                  required
                />
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('last_name') || 'Last Name'}</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Doe" 
                  className="w-full p-3 px-4 pl-11 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                  required
                />
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('email') || 'Email'}</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com" 
                className="w-full p-3 px-4 pl-11 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                required
              />
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('password') || 'Password'}</label>
            <div className="relative">
              <input 
                type={showPw ? 'text' : 'password'} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full p-3 px-4 pl-11 pr-11 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
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

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('confirm_password') || 'Confirm Password'}</label>
            <div className="relative">
              <input 
                type={showPw ? 'text' : 'password'} 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full p-3 px-4 pl-11 pr-11 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                required
              />
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full p-3 mt-4 rounded-xl bg-blue-600 text-white font-semibold text-sm transition-all duration-300 hover:bg-blue-700 active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer border-none"
          >
            {t('signup') || 'Sign Up'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <Link to="/login" className="font-semibold text-accent hover:text-indigo-500 transition-colors ml-1">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
