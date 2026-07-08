import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = () => {
    setShowToast(true);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-animated-gradient flex flex-col items-center sm:justify-center font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-full h-[150%] top-[-25%] bg-tech-grid animate-grid-pan opacity-80"></div>
      </div>

      <div className="w-full max-w-md relative pt-16 pb-4 sm:pt-0 sm:pb-4 z-10 px-6 shrink-0">
        <button onClick={() => navigate('/login')} className="text-white flex items-center hover:text-gray-300 transition-colors">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          Back to Login
        </button>
      </div>

      <div className="bg-[#F7F8F0] w-full max-w-md rounded-t-[3rem] sm:rounded-[2.5rem] px-8 py-10 shadow-2xl z-10 flex-1 sm:flex-none flex flex-col">
        <div className="text-center mb-8">
          <svg className="w-20 h-20 mx-auto text-[#0F2854] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 5a2 2 0 11-2 2"/>
          </svg>
          <h2 className="text-3xl font-extrabold text-[#0F2854]">Reset your password</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 ml-1">New Password</label>
            <div className="relative shadow-[0_4px_15px_rgba(0,0,0,0.04)] rounded-2xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-4 bg-white border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F2854] text-gray-700 font-medium placeholder-gray-400"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-black cursor-pointer hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 ml-1">Confirm Password</label>
            <div className="relative shadow-[0_4px_15px_rgba(0,0,0,0.04)] rounded-2xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-4 bg-white border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F2854] text-gray-700 font-medium placeholder-gray-400"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-black cursor-pointer hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-[#0F2854] text-white font-bold text-xl py-4 rounded-2xl hover:bg-[#1C4D8D] transition-all duration-300 hover:shadow-[0_8px_25px_rgba(9,18,66,0.5)] hover:-translate-y-1 tracking-wide"
            >
              Reset password
            </button>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6 animate-fade-in">
          <div className="bg-[#F7F8F0] rounded-3xl shadow-2xl w-full max-w-xs px-6 sm:px-10 py-8 sm:py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <svg className="w-9 h-9 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-base sm:text-lg font-bold text-[#0F2854] leading-snug">บันทึกข้อมูลเรียบร้อย</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
