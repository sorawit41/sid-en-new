import React from 'react';
import { useNavigate } from 'react-router-dom';
import companyLogo from '../assets/Logo.png';

function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-animated-gradient flex flex-col items-center sm:justify-center font-sans relative overflow-x-hidden">

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-[150%] top-[-25%] bg-tech-grid animate-grid-pan opacity-80"></div>
      </div>

      {/* Header: โลโก้ + ชื่อแพลตฟอร์ม */}
      <div className="w-full max-w-md flex flex-col justify-center items-center relative pt-8 pb-5 sm:pt-0 sm:pb-6 z-10 shrink-0">
        <img
          src={companyLogo}
          alt="Company Logo"
          className="w-20 sm:w-28 h-auto object-contain drop-shadow-lg mb-3"
        />
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-widest drop-shadow-md text-center">
          ENGINSPECT
        </h1>
        <p className="text-sm sm:text-base text-[#BDE8F5] font-medium tracking-wider mt-1 drop-shadow">
          Factory Energy Advisor
        </p>
        <p className="text-xs sm:text-sm text-white/60 font-medium tracking-wide mt-1 drop-shadow">
          SID-EN Co., Ltd.
        </p>
      </div>

      {/* ฟอร์ม Login */}
      <div className="bg-[#F7F8F0] w-full max-w-md rounded-t-[3rem] sm:rounded-[2.5rem] px-8 pt-8 pb-10 sm:py-9 shadow-[0_-10px_20px_rgba(0,0,0,0.15)] sm:shadow-2xl z-10 flex-1 sm:flex-none flex flex-col relative overflow-hidden">

        <h2 className="text-3xl font-extrabold text-center text-[#0F2854] tracking-wide mb-7">
          Login
        </h2>

        <form className="space-y-5">

          <div>
            <label className="block text-base font-bold text-gray-900 mb-2 ml-1">E-mail</label>
            <div className="relative shadow-[0_4px_15px_rgba(0,0,0,0.04)] rounded-2xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="example@email.com"
                className="w-full pl-12 pr-4 py-4 bg-white border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F2854] text-base text-gray-700 font-medium placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-2 ml-1">Password</label>
            <div className="relative shadow-[0_4px_15px_rgba(0,0,0,0.04)] rounded-2xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-4 bg-white border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F2854] text-base text-gray-700 font-medium placeholder-gray-400"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-black cursor-pointer hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              </div>
            </div>
            <div className="text-right mt-2 mr-1">
              <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm font-bold text-[#0F2854] hover:underline">ลืมรหัสผ่าน?</button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full bg-[#0F2854] text-white font-bold text-xl py-5 rounded-2xl hover:bg-[#1C4D8D] transition-all duration-300 hover:shadow-[0_8px_25px_rgba(9,18,66,0.5)] hover:-translate-y-1 tracking-wide"
          >
            Login
          </button>
        </form>

        <div className="text-center pb-2 text-sm font-medium text-gray-600 mt-auto pt-8 sm:pt-0 sm:mt-6">
          ยังไม่มีบัญชีใช่ไหม? <button onClick={() => navigate('/signup')} className="text-[#0F2854] font-bold hover:underline">สมัครสมาชิก</button>
        </div>

      </div>
    </div>
  );
}

export default Login;
