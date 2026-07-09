import React, { useState, useContext } from 'react';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import logoImg from '../assets/Logo.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const { t } = useContext(AppContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Dummy submit
    console.log('Forgot password request for:', email);
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
          <h1 className="text-2xl font-bold tracking-tight text-text">ลืมรหัสผ่าน?</h1>
          <p className="text-sm text-muted mt-2">กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="p-4 rounded-xl bg-good/10 border border-good/20 text-good animate-slide-up mb-6">
              หากมีบัญชีที่ใช้อีเมลนี้ เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้คุณแล้ว
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 text-accent font-semibold hover:text-indigo-500 transition-colors">
              <ArrowLeft size={16} /> กลับสู่หน้า Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('email') || 'Email'}</label>
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

            <button 
              type="submit"
              className="w-full p-3 mt-4 rounded-xl bg-gradient-to-r from-accent to-indigo-500 text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer border-none"
            >
              ส่งลิงก์รีเซ็ต <ArrowRight size={16} />
            </button>
            
            <div className="text-center mt-4">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <ArrowLeft size={16} /> กลับสู่หน้า Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
