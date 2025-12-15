import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { BookOpenIcon, LockClosedIcon, UserIcon, SparklesIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.login(email, password);
    if (user) {
      onLogin(user);
    } else {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-purple-50">
      {/* Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl -z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-200/40 rounded-full blur-3xl -z-0 pointer-events-none"></div>

      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl text-white shadow-lg shadow-purple-200 mb-4">
            <BookOpenIcon className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 font-promt">เข้าสู่ระบบ</h1>
          <p className="text-stone-500 text-sm mt-1">SoloPreneur E-Book Architect</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">อีเมล</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-stone-100 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm"
                placeholder="name@example.com"
                required
              />
              <UserIcon className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">รหัสผ่าน</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-stone-100 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm"
                placeholder="••••••••"
                required
              />
              <LockClosedIcon className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-purple-900 text-white rounded-xl font-bold hover:bg-purple-800 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2 text-base"
          >
            เข้าใช้งาน <SparklesIcon className="w-5 h-5" />
          </button>
        </form>
        
        {/* Call to Action Section */}
        <div className="mt-8 pt-6 border-t border-stone-100">
           <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
              
              <h3 className="text-stone-700 font-bold text-sm mb-3">ยังไม่มีบัญชีใช้งาน?</h3>
              
              <a 
                href="https://line.me/ti/p/~0987429552" 
                target="_blank" 
                rel="noreferrer"
                className="block w-full py-3 bg-[#06C755] hover:bg-[#05b64d] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-3 transform hover:-translate-y-0.5"
              >
                 <ChatBubbleLeftRightIcon className="w-5 h-5" />
                 สมัครใช้บริการ คลิก
              </a>

              <div className="text-xs text-stone-500 leading-relaxed space-y-1">
                 <p className="font-semibold text-purple-700">ติดต่อแอดมินเพื่อเปิดระบบ</p>
                 <div className="bg-red-50 text-red-600 px-2 py-1.5 rounded-lg border border-red-100 inline-block mt-1">
                    <span className="font-bold">🔥 โปรโมชั่นก่อนสิ้นปี!</span><br/>
                    จากราคา <span className="line-through opacity-60">5,900</span> เหลือเพียง <span className="font-bold text-sm">1,900 บาท</span><br/>
                    (ใช้ได้ตลอดชีพ)
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-6 text-center text-[10px] text-stone-300">
           Protected System. Unauthorized access is prohibited.
        </div>
      </div>
    </div>
  );
};