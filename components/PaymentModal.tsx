import React, { useState } from 'react';
import { CheckCircleIcon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { User } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (plan: 'PRO_MONTHLY' | 'PRO_YEARLY') => void;
  currentUser: User;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, currentUser }) => {
  const [selectedPlan, setSelectedPlan] = useState<'PRO_MONTHLY' | 'PRO_YEARLY'>('PRO_YEARLY');

  if (!isOpen) return null;

  const handleSelectPlan = (plan: 'PRO_MONTHLY' | 'PRO_YEARLY') => {
    setSelectedPlan(plan);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative border border-stone-200 flex flex-col md:flex-row h-auto md:h-[600px]">
        
        {/* Close Button */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full transition-all text-stone-400 hover:text-stone-800"
        >
            <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Sidebar / Branding */}
        <div className="w-full md:w-1/3 bg-gradient-to-br from-stone-900 to-purple-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10">
                <h2 className="text-2xl font-bold font-promt mb-2">SoloPreneur AI <span className="text-yellow-400">PRO</span></h2>
                <p className="text-purple-200 text-sm">ปลดล็อกขีดจำกัดงานเขียนของคุณ</p>
            </div>

            <div className="relative z-10 space-y-4 my-8">
                <div className="flex items-center gap-3 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>สร้าง E-Book ไม่จำกัดจำนวน</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>ใช้ AI โมเดลรุ่นล่าสุด (Gemini 2.0)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Export เป็น PDF & EPUB ไม่มีลายน้ำ</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>เข้าถึงฟีเจอร์ Editor & Rewriter</span>
                </div>
            </div>

            <div className="relative z-10 text-xs text-white/40">
                Powered by Stripe • Secure Payment
            </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-2/3 bg-white p-8 flex flex-col justify-center relative">
            
            {/* SELECT PLAN */}
            <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-stone-800 mb-6 font-promt text-center">เลือกแผนสมาชิกของคุณ</h3>
                    
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        {/* Monthly */}
                        <div 
                            onClick={() => setSelectedPlan('PRO_MONTHLY')}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative group ${selectedPlan === 'PRO_MONTHLY' ? 'border-purple-600 bg-purple-50' : 'border-stone-100 hover:border-purple-200'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-stone-800">รายเดือน (Monthly)</h4>
                                    <p className="text-stone-500 text-sm">จ่ายสบายกระเป๋า ยกเลิกเมื่อไหร่ก็ได้</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-purple-700">฿790</span>
                                    <span className="text-stone-400 text-xs">/เดือน</span>
                                </div>
                            </div>
                        </div>

                        {/* Yearly */}
                        <div 
                            onClick={() => setSelectedPlan('PRO_YEARLY')}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative group ${selectedPlan === 'PRO_YEARLY' ? 'border-purple-600 bg-purple-50' : 'border-stone-100 hover:border-purple-200'}`}
                        >
                            <div className="absolute -top-3 left-6 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                SAVE 26% (แนะนำ)
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-stone-800">รายปี (Yearly)</h4>
                                    <p className="text-stone-500 text-sm">คุ้มค่าที่สุด จ่ายครั้งเดียวใช้ยาว</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-stone-400 text-sm line-through">฿9,480</div>
                                    <span className="text-2xl font-bold text-purple-700">฿7,000</span>
                                    <span className="text-stone-400 text-xs">/ปี</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <a 
                        href="https://line.me/ti/p/~0987429552"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center justify-center"
                    >
                        ดำเนินการต่อ (สมัครผ่าน LINE)
                    </a>
            </div>
        </div>
      </div>
    </div>
  );
};