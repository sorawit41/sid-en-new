import React from 'react';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-animated-gradient flex flex-col items-center sm:justify-center font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-full h-[150%] top-[-25%] bg-tech-grid animate-grid-pan opacity-80"></div>
      </div>

      <div className="w-full max-w-md relative pt-16 pb-6 sm:hidden z-10"></div>

      <div className="bg-[#F7F8F0] w-full max-w-md rounded-t-[3rem] sm:rounded-[2.5rem] px-8 py-10 shadow-2xl z-10 flex-1 sm:flex-none flex flex-col">
        <div className="text-center mb-8">
           <svg className="w-20 h-20 mx-auto text-[#0F2854] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
           </svg>
           <h2 className="text-3xl font-extrabold text-[#0F2854]">Forgot password?</h2>
           <p className="text-sm text-gray-600 mt-2">กรอกอีเมลของคุณ<br />เราจะส่งรหัสยืนยันสำหรับตั้งรหัสผ่านใหม่ให้</p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-900 ml-1">E-mail</label>
          <div className="relative shadow-[0_4px_15px_rgba(0,0,0,0.04)] rounded-2xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <input
              type="email"
              placeholder="example@email.com"
              className="w-full pl-12 pr-4 py-4 bg-white border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F2854] text-gray-700 font-medium placeholder-gray-400"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('/verify', { state: { next: '/reset-password' } })}
            className="w-full bg-[#0F2854] text-white font-bold py-4 rounded-2xl hover:bg-[#1C4D8D] transition-all"
          >
            Send
          </button>
        </div>

        <div className="text-center mt-auto pt-8 text-base font-medium text-gray-600 pb-2">
          จำรหัสผ่านได้แล้ว? <button type="button" onClick={() => navigate('/login')} className="text-[#0F2854] font-bold hover:underline">เข้าสู่ระบบ</button>
        </div>
      </div>
    </div>
  );
}
export default ForgotPassword;
