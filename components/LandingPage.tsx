import React from 'react';
import { 
  SparklesIcon, 
  BookOpenIcon, 
  CpuChipIcon, 
  PencilSquareIcon, 
  PaintBrushIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/solid';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white selection:bg-purple-200">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-purple-50 to-transparent -z-10"></div>
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/30 rounded-full blur-3xl -z-10"></div>

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2">
           <div className="bg-purple-600 text-white p-1.5 rounded-lg shadow-md shadow-purple-200">
                <BookOpenIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-stone-800 tracking-tight font-promt">SoloPreneur AI</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-bold hover:bg-stone-50 transition-all text-sm shadow-sm"
        >
          เข้าสู่ระบบ
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center relative z-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-6 border border-purple-200">
          <SparklesIcon className="w-4 h-4" />
          <span>นวัตกรรม AI ล่าสุดสำหรับนักเขียนและผู้ประกอบการ</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-stone-900 mb-6 font-promt leading-tight">
          เปลี่ยนไอเดียให้เป็น <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">E-Book ขายดี</span><br className="hidden md:block"/> ด้วย AI Automation อัจฉริยะใน 3 ขั้นตอน
        </h1>
        
        <p className="text-lg text-stone-500 mb-10 max-w-2xl mx-auto font-sarabun leading-relaxed">
          ไม่ต้องจ้าง Ghostwriter ราคาแพง ไม่ต้องปวดหัวกับการจัดหน้า หรือออกแบบปก 
          ให้ AI จัดการให้คุณแบบครบวงจร ตั้งแต่ "คิดโครงเรื่อง" จนถึง "ไฟล์พร้อมขาย"
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onGetStarted}
            className="px-8 py-4 bg-purple-900 text-white rounded-2xl font-bold text-lg hover:bg-purple-800 hover:scale-105 transition-all shadow-xl shadow-purple-200 flex items-center gap-2"
          >
            เริ่มสร้าง E-Book <ArrowRightIcon className="w-5 h-5" />
          </button>
          <a 
            href="https://line.me/ti/p/~0987429552" 
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 bg-white text-stone-700 border border-stone-200 rounded-2xl font-bold text-lg hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center gap-2"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-500" /> สมัครใช้บริการ
          </a>
        </div>
      </section>

      {/* Features Grid & Animation */}
      <section className="bg-white py-20 relative z-10 border-t border-stone-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-stone-800 mb-4 font-promt">ทำงานแทนคุณเหมือนมีทีมงานมืออาชีพ</h2>
                <p className="text-stone-500">ระบบ AI Agent 4 ตำแหน่ง ที่จะช่วยคุณทำงานพร้อมกันอย่างมีประสิทธิภาพ</p>
            </div>

            {/* --- 3D Rotating Workflow Animation --- */}
            <div className="relative w-[340px] h-[340px] mx-auto mb-20 hidden lg:block perspective-1000">
                
                {/* 1. Orbit Tracks */}
                <div className="absolute inset-0 rounded-full border border-stone-100 scale-100"></div>
                <div className="absolute inset-10 rounded-full border border-dashed border-purple-100 scale-90 animate-[spin_60s_linear_infinite]"></div>

                {/* 2. Rotating Arrows Ring (The "Workflow") */}
                <div className="absolute inset-[-20px] animate-[spin_12s_linear_infinite]">
                     <svg className="w-full h-full opacity-60" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#9333ea" stopOpacity="0" />
                                <stop offset="100%" stopColor="#9333ea" stopOpacity="1" />
                            </linearGradient>
                             <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L0,6 L6,3 z" fill="#9333ea" />
                             </marker>
                        </defs>
                        {/* 4 Colored Arcs representing 4 Agents Flow */}
                        <path d="M50 5 A45 45 0 0 1 95 50" fill="none" stroke="#9333ea" strokeWidth="0.8" markerEnd="url(#arrow)" /> {/* Top to Right (Purple) */}
                        <path d="M95 50 A45 45 0 0 1 50 95" fill="none" stroke="#db2777" strokeWidth="0.8" markerEnd="url(#arrow)" /> {/* Right to Bottom (Pink) */}
                        <path d="M50 95 A45 45 0 0 1 5 50" fill="none" stroke="#2563eb" strokeWidth="0.8" markerEnd="url(#arrow)" />  {/* Bottom to Left (Blue) */}
                        <path d="M5 50 A45 45 0 0 1 50 5" fill="none" stroke="#059669" strokeWidth="0.8" markerEnd="url(#arrow)" />   {/* Left to Top (Emerald) */}
                     </svg>
                </div>

                {/* 3. Central AI Core */}
                <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full shadow-[0_0_30px_rgba(168,85,247,0.3)] flex flex-col items-center justify-center z-10 border border-purple-50 animate-pulse">
                     <div className="relative">
                        <CpuChipIcon className="w-10 h-10 text-purple-600 mb-1" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                        </span>
                     </div>
                     <div className="text-[10px] text-stone-400 font-bold tracking-widest uppercase">System</div>
                     <div className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-promt">CORE AI</div>
                </div>

                {/* 4. The 4 Agents (Nodes) */}
                {/* Top: Strategist */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-2xl shadow-xl border border-purple-100 flex flex-col items-center justify-center z-20 animate-[bounce_3s_infinite]">
                     <div className="p-2 bg-purple-50 rounded-lg mb-1">
                        <CpuChipIcon className="w-6 h-6 text-purple-600" />
                     </div>
                     <span className="text-[10px] font-bold text-stone-600">Strategist</span>
                     {/* Connecting Line to Center */}
                     <div className="absolute top-full left-1/2 w-px h-10 bg-gradient-to-b from-purple-200 to-transparent -z-10"></div>
                </div>

                {/* Right: Writer */}
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-20 h-20 bg-white rounded-2xl shadow-xl border border-pink-100 flex flex-col items-center justify-center z-20 animate-[bounce_3s_infinite_delay-1s]">
                     <div className="p-2 bg-pink-50 rounded-lg mb-1">
                        <PencilSquareIcon className="w-6 h-6 text-pink-600" />
                     </div>
                     <span className="text-[10px] font-bold text-stone-600">Writer</span>
                     <div className="absolute right-full top-1/2 h-px w-10 bg-gradient-to-r from-pink-200 to-transparent -z-10"></div>
                </div>

                {/* Bottom: Designer */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-2xl shadow-xl border border-blue-100 flex flex-col items-center justify-center z-20 animate-[bounce_3s_infinite_delay-2s]">
                     <div className="p-2 bg-blue-50 rounded-lg mb-1">
                        <PaintBrushIcon className="w-6 h-6 text-blue-600" />
                     </div>
                     <span className="text-[10px] font-bold text-stone-600">Designer</span>
                     <div className="absolute bottom-full left-1/2 w-px h-10 bg-gradient-to-t from-blue-200 to-transparent -z-10"></div>
                </div>

                {/* Left: Editor */}
                <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-20 h-20 bg-white rounded-2xl shadow-xl border border-emerald-100 flex flex-col items-center justify-center z-20 animate-[bounce_3s_infinite_delay-1.5s]">
                     <div className="p-2 bg-emerald-50 rounded-lg mb-1">
                        <ClipboardDocumentCheckIcon className="w-6 h-6 text-emerald-600" />
                     </div>
                     <span className="text-[10px] font-bold text-stone-600">Editor</span>
                     <div className="absolute left-full top-1/2 h-px w-10 bg-gradient-to-l from-emerald-200 to-transparent -z-10"></div>
                </div>

            </div>

            {/* Grid Cards (Existing) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {/* Horizontal Connecting Line for Desktop */}
                <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-100 to-transparent -z-10"></div>

                {/* Feature 1 */}
                <div className="p-6 rounded-3xl bg-purple-50/50 border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white/60 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-purple-600 ring-4 ring-purple-50">
                        <CpuChipIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-800 mb-2 font-promt">1. นักวางกลยุทธ์ (Strategist)</h3>
                    <p className="text-stone-600 leading-relaxed text-sm">
                        วิเคราะห์กลุ่มเป้าหมาย คิดชื่อเรื่องที่ดึงดูด และวางโครงสารบัญ (Outline) ให้ขายดีที่สุด
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="p-6 rounded-3xl bg-pink-50/50 border border-pink-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white/60 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-pink-600 ring-4 ring-pink-50">
                        <PencilSquareIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-800 mb-2 font-promt">2. นักเขียนมือทอง (Writer)</h3>
                    <p className="text-stone-600 leading-relaxed text-sm">
                        เขียนเนื้อหาทีละบทอย่างละเอียด ด้วยภาษาที่สละสลวย อ่านง่าย และให้ความรู้จริง
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white/60 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-blue-600 ring-4 ring-blue-50">
                        <PaintBrushIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-800 mb-2 font-promt">3. นักออกแบบ (Designer)</h3>
                    <p className="text-stone-600 leading-relaxed text-sm">
                        สร้างภาพปก E-Book ที่สวยงาม โดดเด่น ตามสไตล์ที่คุณเลือกได้ (Minimal, Luxury, etc.)
                    </p>
                </div>

                {/* Feature 4 (New) */}
                <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white/60 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-emerald-600 ring-4 ring-emerald-50">
                        <ClipboardDocumentCheckIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-800 mb-2 font-promt">4. บรรณาธิการ (Editor)</h3>
                    <p className="text-stone-600 leading-relaxed text-sm">
                         ตรวจสอบความถูกต้อง เรียบเรียงสำนวน ปรับโทนเสียงให้เหมาะสม และการันตีคุณภาพงานเขียนระดับมืออาชีพ
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Promotion Section */}
      <section className="py-20 bg-gradient-to-br from-stone-900 to-purple-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-promt">พิเศษ! โปรโมชั่นก่อนสิ้นปี</h2>
            <p className="text-purple-200 mb-10 text-lg">เป็นเจ้าของระบบผลิต E-Book ส่วนตัว ใช้งานได้ไม่จำกัด สร้างกี่เล่มก็ได้</p>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 inline-block max-w-2xl w-full relative">
                <div className="absolute -top-4 -right-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg transform rotate-6 animate-bounce">
                    คุ้มที่สุด!
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                    <div className="text-center md:text-right">
                        <p className="text-stone-400 text-lg line-through mb-1">ราคาปกติ 5,900 บาท</p>
                        <div className="text-5xl md:text-6xl font-bold text-white font-promt">2,990.-</div>
                        <p className="text-emerald-400 font-bold mt-2">จ่ายครั้งเดียว / ตลอดชีพ</p>
                    </div>
                    
                    <div className="h-px w-full md:w-px md:h-24 bg-white/20"></div>
                    
                    <div className="text-left space-y-3">
                        <div className="flex items-center gap-2 text-sm text-purple-100">
                            <CheckCircleIcon className="w-5 h-5 text-emerald-400" /> ใช้งาน AI ครบทุกฟีเจอร์
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-100">
                            <CheckCircleIcon className="w-5 h-5 text-emerald-400" /> Export เป็น PDF, EPUB, HTML
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-100">
                            <CheckCircleIcon className="w-5 h-5 text-emerald-400" /> อัปเดตฟีเจอร์ใหม่ฟรี
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <a 
                         href="https://line.me/ti/p/~0987429552" 
                         target="_blank" 
                         rel="noreferrer"
                         className="block w-full py-4 bg-[#06C755] hover:bg-[#05b64d] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        <span className="flex items-center justify-center gap-2">
                             <ChatBubbleLeftRightIcon className="w-6 h-6" />
                             ทักไลน์สมัครโปรนี้ คลิกเลย
                        </span>
                    </a>
                    <p className="text-xs text-white/50 mt-4">ติดต่อ LINE ID: 0987429552 เพื่อเปิดระบบทันที</p>
                </div>
            </div>
        </div>
      </section>

      <footer className="bg-stone-50 py-10 text-center border-t border-stone-200">
         <p className="text-stone-400 text-sm">© 2026 SoloPreneur E-Book Architect. All rights reserved.</p>
      </footer>
    </div>
  );
};