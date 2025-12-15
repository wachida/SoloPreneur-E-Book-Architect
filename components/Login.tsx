import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { BookOpenIcon, LockClosedIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/solid';

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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl text-white shadow-lg shadow-purple-200 mb-4">
            <BookOpenIcon className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 font-promt">เข้าสู่ระบบ</h1>
          <p className="text-stone-500 text-sm mt-1">SoloPreneur E-Book Architect</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-stone-100 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-all"
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
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-stone-100 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <LockClosedIcon className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-purple-900 text-white rounded-xl font-bold hover:bg-purple-800 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
          >
            เข้าใช้งาน <SparklesIcon className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-stone-400">
           Protected System. Unauthorized access is prohibited.
        </div>
      </div>
    </div>
  );
};