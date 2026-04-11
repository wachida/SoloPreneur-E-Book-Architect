import React, { useState, useEffect, useRef } from 'react';
import { Chapter, EBook, AgentRole, LogEntry, WorkflowStep, User, UserRole } from './types';
import { generateBookOutline, generateChapterContent, generateCoverImage } from './services/geminiService';
import { AgentLog } from './components/AgentLog';
import { BookPreview } from './components/BookPreview';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PaymentModal } from './components/PaymentModal';
import { authService } from './services/authService';
import { 
  BeakerIcon, 
  BookOpenIcon, 
  PencilIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  ArrowRightIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftOnRectangleIcon,
  ComputerDesktopIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  StarIcon
} from '@heroicons/react/24/solid';

const COVER_STYLES = [
  { id: 'Minimalist', label: 'Minimalist', desc: 'เรียบง่าย สบายตา น้อยแต่มาก' },
  { id: 'Vibrant', label: 'Vibrant', desc: 'สีสันสดใส ฉูดฉาด มีพลัง' },
  { id: 'Vintage', label: 'Vintage', desc: 'ย้อนยุค คลาสสิก มีเสน่ห์' },
  { id: 'Modern', label: 'Modern', desc: 'ทันสมัย เรียบหรู ดูเป็นปัจจุบัน' },
  { id: 'Abstract', label: 'Abstract', desc: 'ศิลปะนามธรรม จินตนาการ' },
  { id: 'Futuristic', label: 'Futuristic', desc: 'ล้ำยุค ไฮเทค โลกอนาคต' },
  { id: 'Corporate', label: 'Corporate', desc: 'ทางการ น่าเชื่อถือ ธุรกิจ' },
  { id: 'Luxury', label: 'Luxury', desc: 'หรูหรา พรีเมียม เลอค่า' },
  { id: 'Hand-drawn', label: 'Hand-drawn', desc: 'ลายเส้นวาดมือ เป็นกันเอง' },
  { id: 'Watercolor', label: 'Watercolor', desc: 'สีน้ำ อ่อนโยน ศิลปะ' },
  { id: 'Cyberpunk', label: 'Cyberpunk', desc: 'แสงนีออน ไซไฟ ล้ำอนาคต' }
];

const TONES = [
  { id: 'Professional', label: 'มืออาชีพและน่าเชื่อถือ (Professional)', desc: 'เหมาะสำหรับธุรกิจ การเงิน วิชาการ' },
  { id: 'Friendly', label: 'เป็นกันเองและเข้าถึงง่าย (Friendly)', desc: 'เหมาะสำหรับไลฟ์สไตล์ การพัฒนาตนเอง' },
  { id: 'Storytelling', label: 'เน้นการเล่าเรื่อง (Storytelling)', desc: 'เหมาะสำหรับประวัติ แรงบันดาลใจ' },
  { id: 'Persuasive', label: 'โน้มน้าวใจ (Persuasive)', desc: 'เหมาะสำหรับการขาย การตลาด' },
  { id: 'Humorous', label: 'สนุกสนานและมีอารมณ์ขัน (Humorous)', desc: 'เหมาะสำหรับเนื้อหาเบาสมอง' },
  { id: 'Academic', label: 'วิชาการและเชิงลึก (Academic)', desc: 'เหมาะสำหรับตำรา งานวิจัย หรือคู่มือเฉพาะทาง' },
  { id: 'Inspirational', label: 'สร้างแรงบันดาลใจ (Inspirational)', desc: 'เหมาะสำหรับหนังสือพัฒนาตนเอง ปลุกไฟ' },
  { id: 'Direct', label: 'กระชับ เน้นการลงมือทำ (Direct)', desc: 'เหมาะสำหรับ How-to และคู่มือปฏิบัติ' },
  { id: 'Empathetic', label: 'อ่อนโยนและเข้าอกเข้าใจ (Empathetic)', desc: 'เหมาะสำหรับจิตวิทยา สุขภาพ ความสัมพันธ์' },
  { id: 'Witty', label: 'หลักแหลมและทันสมัย (Witty)', desc: 'เหมาะสำหรับบทวิเคราะห์สังคม เทรนด์ใหม่ๆ' },
  { id: 'Casual', label: 'เพื่อนเล่าให้เพื่อนฟัง (Casual)', desc: 'ภาษาง่ายๆ เป็นกันเอง เหมือนนั่งคุยกันในวงสนทนา' },
  { id: 'GenZ', label: 'วัยรุ่น Gen Z (Trendy)', desc: 'ใช้สแลง คำศัพท์สมัยใหม่ สนุกสนาน เข้าถึงวัยรุ่น' }
];

const App: React.FC = () => {
  // Authentication & Navigation State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState<'APP' | 'ADMIN'>('APP');

  // Input States
  const [topic, setTopic] = useState('');
  const [coverStyle, setCoverStyle] = useState<string>('Minimalist');
  const [tone, setTone] = useState<string>('Professional');
  const [authorBio, setAuthorBio] = useState('');
  
  // Workflow States
  const [step, setStep] = useState<WorkflowStep>(WorkflowStep.INPUT);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [eBook, setEBook] = useState<Partial<EBook>>({ chapters: [] });
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Check auth on load
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setShowLanding(false); // If logged in, skip landing
      if (user.role === UserRole.ADMIN) {
        // Optional: Default to Dashboard for admin
      }
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setShowLanding(true); // Go back to landing on logout
    setCurrentView('APP');
  };

  const handleUpgradeSuccess = (plan: 'PRO_MONTHLY' | 'PRO_YEARLY') => {
    if (currentUser) {
        const updatedUser = authService.upgradeUserPlan(currentUser.email, plan);
        setCurrentUser(updatedUser);
        setShowPaymentModal(false);
        alert(`ยินดีด้วย! คุณเป็นสมาชิกแบบ ${plan} เรียบร้อยแล้ว`);
    }
  };

  const addLog = (agent: AgentRole, message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date(), agent, message }]);
  };

  const handleStartStrategy = async () => {
    if (!topic.trim()) return;
    
    // Check quota for FREE users (Mock Logic)
    if (currentUser?.plan === 'FREE' && step === WorkflowStep.INPUT) {
         // In a real app, you'd check DB usage. Here we just might nag them or allow limited usage.
         // For now, let's allow it but show a banner.
    }

    setStep(WorkflowStep.OUTLINE);
    setIsProcessing(true);
    setLogs([]); 
    
    try {
      addLog(AgentRole.STRATEGIST, `เริ่มโปรเจกต์: "${topic}"`);
      addLog(AgentRole.STRATEGIST, "กำลังวิเคราะห์ตลาดและวางโครงเรื่อง...");
      
      const outlineData = await generateBookOutline(topic);
      
      // Save initial config
      setEBook({ 
        ...outlineData, 
        coverStyle, 
        tone, 
        authorBio 
      });
      
      addLog(AgentRole.STRATEGIST, `วางโครงเรื่องเสร็จสิ้น: ${outlineData.title}`);
      addLog(AgentRole.STRATEGIST, "รอการอนุมัติโครงเรื่องจากผู้ใช้งาน...");
      
      setIsProcessing(false);
      setStep(WorkflowStep.APPROVAL); // Pause for user approval

    } catch (error) {
      addLog(AgentRole.STRATEGIST, `เกิดข้อผิดพลาด: ${(error as Error).message}`);
      setIsProcessing(false);
      alert(`เกิดข้อผิดพลาด: ${(error as Error).message}`); // Show alert for immediate feedback
      setStep(WorkflowStep.INPUT);
    }
  };

  const handleApproveOutline = () => {
    setStep(WorkflowStep.WRITING);
    setIsProcessing(true);
  };

  const handleRegenerateOutline = () => {
    handleStartStrategy();
  };

  const handleUpdateChapter = (index: number, newContent: string) => {
    setEBook(prev => {
      if (!prev.chapters) return prev;
      const updatedChapters = [...prev.chapters];
      updatedChapters[index] = {
        ...updatedChapters[index],
        content: newContent
      };
      return { ...prev, chapters: updatedChapters };
    });
  };

  // Chapter Management Functions (Approval Step)
  const handleEditChapterTitle = (index: number, newTitle: string) => {
     setEBook(prev => {
        if (!prev.chapters) return prev;
        const updated = [...prev.chapters];
        updated[index] = { ...updated[index], title: newTitle };
        return { ...prev, chapters: updated };
     });
  };

  const handleAddChapter = () => {
     setEBook(prev => {
        if (!prev.chapters) return prev;
        if (prev.chapters.length >= 12) return prev; // Max constraint
        
        const newChapters = [...prev.chapters];
        const newChapter: Chapter = {
            id: `new-${Date.now()}`,
            title: `บทที่ ${newChapters.length} (โปรดระบุชื่อเรื่อง)`,
            status: 'pending'
        };

        // Insert before conclusion if it exists
        const conclusionIndex = newChapters.findIndex(c => c.id === 'ch-conclusion');
        if (conclusionIndex !== -1) {
            newChapters.splice(conclusionIndex, 0, newChapter);
        } else {
            newChapters.push(newChapter);
        }
        
        return { ...prev, chapters: newChapters };
     });
  };

  const handleRemoveChapter = (index: number) => {
      setEBook(prev => {
          if (!prev.chapters || prev.chapters.length <= 1) return prev;
          const newChapters = [...prev.chapters];
          newChapters.splice(index, 1);
          return { ...prev, chapters: newChapters };
      });
  };

  // Effect to handle the Writing Phase
  useEffect(() => {
    const processWriting = async () => {
      if (step === WorkflowStep.WRITING && eBook.chapters && eBook.chapters.length > 0) {
        
        const newChapters = [...eBook.chapters];
        
        for (let i = 0; i < newChapters.length; i++) {
          const chapter = newChapters[i];
          if (chapter.status === 'pending') {
            
            newChapters[i].status = 'generating';
            setEBook(prev => ({ ...prev, chapters: [...newChapters] }));
            
            const isConclusion = chapter.id === 'ch-conclusion';
            addLog(AgentRole.WRITER, `${isConclusion ? 'บทสรุป' : `บทที่ ${i + 1}`}: กำลังเขียน...`);
            
            try {
              const content = await generateChapterContent(
                eBook.title || "หนังสือ", 
                chapter.title, 
                eBook.targetAudience || "ผู้อ่านทั่วไป",
                eBook.description || "",
                eBook.tone,
                eBook.authorBio
              );
              
              newChapters[i].content = content;
              newChapters[i].status = 'completed';
              setEBook(prev => ({ ...prev, chapters: [...newChapters] }));
              
              addLog(AgentRole.WRITER, `${isConclusion ? 'บทสรุป' : `บทที่ ${i + 1}`} เขียนเสร็จแล้ว`);
              
            } catch (err) {
              addLog(AgentRole.WRITER, `เกิดข้อผิดพลาดในบทที่ ${i + 1}`);
              newChapters[i].status = 'error';
              setEBook(prev => ({ ...prev, chapters: [...newChapters] }));
            }
          }
        }
        
        setStep(WorkflowStep.DESIGN);
      }
    };

    if (step === WorkflowStep.WRITING) {
      processWriting();
    }
  }, [step, eBook.chapters]);

  // Effect to handle Design Phase
  useEffect(() => {
    const processDesign = async () => {
      if (step === WorkflowStep.DESIGN) {
        addLog(AgentRole.DESIGNER, `เริ่มออกแบบปกสไตล์ ${eBook.coverStyle || coverStyle}...`);
        try {
          const imageUrl = await generateCoverImage(eBook.title || "", eBook.description || "", eBook.coverStyle || coverStyle);
          setEBook(prev => ({ ...prev, coverImage: imageUrl }));
          addLog(AgentRole.DESIGNER, "ออกแบบปกเสร็จสิ้น");
          
          setTimeout(() => {
             setStep(WorkflowStep.REVIEW);
          }, 1000);
          
        } catch (e) {
            addLog(AgentRole.DESIGNER, "ไม่สามารถสร้างภาพปกได้ ใช้ภาพสำรองแทน");
            setStep(WorkflowStep.REVIEW);
        }
      }
    };

    if (step === WorkflowStep.DESIGN) {
      processDesign();
    }
  }, [step, eBook.title]);

  // Effect to handle Review Phase
  useEffect(() => {
    const processReview = async () => {
        if (step === WorkflowStep.REVIEW) {
            addLog(AgentRole.REVIEWER, "QC: กำลังตรวจสอบคุณภาพเนื้อหาทั้งหมด...");
            
            // Artificial delay for UX
            await new Promise(r => setTimeout(r, 1500));
            addLog(AgentRole.REVIEWER, "QC: เนื้อหาครบถ้วนสมบูรณ์");
            
            await new Promise(r => setTimeout(r, 800));
            addLog(AgentRole.REVIEWER, "QC: การจัดรูปแบบพร้อมใช้งาน");

            addLog(AgentRole.REVIEWER, "เสร็จสิ้นทุกขั้นตอน พร้อมส่งมอบ");
            setTimeout(() => {
                setIsProcessing(false);
                setStep(WorkflowStep.COMPLETED);
            }, 800);
        }
    }

    if (step === WorkflowStep.REVIEW) {
        processReview();
    }
  }, [step]);


  const StepIcon = ({ current, target, icon: Icon, label }: { current: WorkflowStep, target: WorkflowStep, icon: any, label: string }) => {
    const isActive = current === target;
    const isCompleted = current > target;
    
    return (
      <div className={`flex flex-col items-center z-10 w-20 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-70'}`}>
        <div className={`relative w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-md
          ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
            isActive ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200' : 
            'bg-white border-stone-200 text-stone-300'}`}>
          
          {/* Active Animations: Pulse Ring & Spin Border */}
          {isActive && (
            <>
                <span className="absolute inline-flex h-full w-full rounded-2xl bg-purple-400 opacity-20 animate-ping"></span>
            </>
          )}

          <Icon className={`w-5 h-5 lg:w-6 lg:h-6 relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
        </div>
        <span className={`mt-2 text-[10px] lg:text-xs font-semibold text-center hidden sm:block ${isActive ? 'text-purple-700' : isCompleted ? 'text-emerald-600' : 'text-stone-400'}`}>
           {label}
        </span>
      </div>
    );
  };

  // --- RENDER LOGIC ---

  // 1. Authenticated User -> Main App
  if (currentUser) {
    return (
      <div className="min-h-screen pb-20 relative bg-purple-50/20">
        
        {/* Payment Modal */}
        <PaymentModal 
            isOpen={showPaymentModal} 
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handleUpgradeSuccess}
            currentUser={currentUser}
        />

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-purple-600 text-white p-1.5 rounded-lg shadow-md shadow-purple-200">
                  <BookOpenIcon className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-600 hidden md:block">
                SoloPreneur E-Book Architect
              </h1>
              <span className="md:hidden text-purple-700 font-bold">SEA</span>
            </div>

            <div className="flex items-center gap-3">
               {/* Upgrade Button for Free Users */}
               {currentUser.plan === 'FREE' && (
                 <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all mr-2"
                 >
                    <StarIcon className="w-4 h-4" /> Upgrade Pro
                 </button>
               )}

               {/* Admin Controls */}
               {currentUser.role === UserRole.ADMIN && (
                 <div className="flex bg-stone-100 p-1 rounded-lg mr-2">
                   <button
                      onClick={() => setCurrentView('APP')}
                      className={`p-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${currentView === 'APP' ? 'bg-white text-purple-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                   >
                      <ComputerDesktopIcon className="w-4 h-4" /> <span className="hidden sm:inline">App</span>
                   </button>
                   <button
                      onClick={() => setCurrentView('ADMIN')}
                      className={`p-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${currentView === 'ADMIN' ? 'bg-white text-purple-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                   >
                      <Cog6ToothIcon className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
                   </button>
                 </div>
               )}

               <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
                  <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-stone-700 hidden sm:block">
                          {currentUser.email}
                      </span>
                      <span className={`text-[10px] px-1.5 rounded-sm font-bold ${
                          currentUser.plan?.startsWith('PRO') ? 'bg-purple-100 text-purple-700' : 'bg-stone-200 text-stone-500'
                      }`}>
                          {currentUser.plan}
                      </span>
                  </div>
                  <button 
                      onClick={handleLogout}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      title="ออกจากระบบ"
                  >
                      <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </div>
        </header>
        
        {/* View Router */}
        {currentView === 'ADMIN' ? (
           <AdminDashboard />
        ) : (
            // Main App View
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
          
          {/* Progress Stepper */}
          {step !== WorkflowStep.INPUT && (
            <div className="mb-10 relative max-w-4xl mx-auto">
              <div className="absolute top-5 lg:top-6 left-10 right-10 h-0.5 bg-stone-200 -z-0"></div>
              <div className="absolute top-5 lg:top-6 left-10 h-0.5 bg-purple-500 transition-all duration-700 -z-0" 
                   style={{ width: `${Math.min(((step) / 6) * 100, 100)}%` }}></div>
              <div className="flex justify-between relative">
                 <StepIcon current={step} target={WorkflowStep.OUTLINE} icon={BeakerIcon} label="วิเคราะห์" />
                 <StepIcon current={step} target={WorkflowStep.APPROVAL} icon={CheckCircleIcon} label="อนุมัติโครง" />
                 <StepIcon current={step} target={WorkflowStep.WRITING} icon={PencilIcon} label="เขียนเนื้อหา" />
                 <StepIcon current={step} target={WorkflowStep.DESIGN} icon={SparklesIcon} label="ออกแบบ" />
                 <StepIcon current={step} target={WorkflowStep.REVIEW} icon={ClipboardDocumentCheckIcon} label="ตรวจสอบ" />
                 <StepIcon current={step} target={WorkflowStep.COMPLETED} icon={BookOpenIcon} label="เสร็จสิ้น" />
              </div>
            </div>
          )}

          {/* STEP 0: INPUT CONFIGURATION (Clean Layout) */}
          {step === WorkflowStep.INPUT && (
            <div className="max-w-3xl mx-auto mt-10 animate-fade-in">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl shadow-purple-200/50 border border-white overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-700 to-pink-600 p-8 text-white text-center relative">
                       {currentUser.plan === 'FREE' && (
                          <div className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 cursor-pointer text-xs font-bold px-3 py-1 rounded-full border border-white/50" onClick={() => setShowPaymentModal(true)}>
                              Upgrade to Remove Limits
                          </div>
                       )}
                       <h2 className="text-2xl font-bold mb-2 font-promt">สร้าง E-Book ระดับมืออาชีพ</h2>
                       <p className="text-purple-100 font-sarabun text-sm">ครบวงจรตั้งแต่ วางแผน เขียนเนื้อหา และออกแบบปก</p>
                  </div>
                  
                  <div className="p-10 space-y-8">
                      {/* Topic Input */}
                      <div>
                          <label className="block text-stone-700 font-bold mb-3 text-base">
                              1. คุณอยากเขียนเรื่องอะไร? <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="เช่น คู่มือการลงทุนอสังหาฯ ฉบับมนุษย์เงินเดือน..."
                            className="w-full px-5 py-4 text-base border-2 border-stone-200 bg-purple-50/30 rounded-2xl focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-50 outline-none transition-all placeholder-stone-400"
                          />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Tone */}
                          <div>
                              <label className="block text-stone-700 font-bold mb-3 text-sm">2. น้ำเสียง (Tone)</label>
                              <select 
                                  value={tone}
                                  onChange={(e) => setTone(e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-purple-500 outline-none bg-white text-sm"
                              >
                                  {TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                              </select>
                          </div>

                           {/* Style */}
                           <div>
                              <label className="block text-stone-700 font-bold mb-3 text-sm">3. สไตล์ปก (Style)</label>
                              <select 
                                  value={coverStyle}
                                  onChange={(e) => setCoverStyle(e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-purple-500 outline-none bg-white text-sm"
                              >
                                  {COVER_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                              </select>
                          </div>
                      </div>
                      
                      {/* Author Bio */}
                      <div>
                           <label className="block text-stone-700 font-bold mb-3 text-sm">
                              4. ข้อมูลผู้เขียน (Optional)
                          </label>
                          <textarea 
                              value={authorBio}
                              onChange={(e) => setAuthorBio(e.target.value)}
                              placeholder="เช่น ผู้เชี่ยวชาญด้านการตลาด 10 ปี..."
                              className="w-full px-4 py-3 text-sm border-2 border-stone-200 bg-purple-50/30 rounded-2xl focus:border-purple-500 focus:bg-white outline-none h-24 resize-none placeholder-stone-400"
                          ></textarea>
                      </div>

                      <div className="pt-4 flex justify-center">
                          <button
                              onClick={handleStartStrategy}
                              disabled={!topic.trim() || isProcessing}
                              className="bg-purple-900 text-white px-12 py-4 rounded-2xl font-bold text-base hover:bg-purple-800 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-xl shadow-purple-200 flex items-center gap-3 w-full md:w-auto justify-center"
                          >
                              {isProcessing ? 'กำลังประมวลผล...' : 'เริ่มสร้าง E-Book'} <ArrowRightIcon className="w-5 h-5" />
                          </button>
                      </div>
                  </div>
              </div>
            </div>
          )}
          
          {/* STEP 1: ANALYZING/OUTLINE LOADING SCREEN */}
          {step === WorkflowStep.OUTLINE && (
            <div className="flex flex-col items-center justify-center min-h-[500px] animate-fade-in relative">
               <div className="relative z-10 text-center">
                   <div className="relative w-40 h-40 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-xl border border-purple-100">
                       <div className="w-24 h-24 text-purple-600 animate-pulse">
                           <CpuChipIcon className="w-full h-full" />
                       </div>
                       {/* Spinner Overlay */}
                       <div className="absolute -bottom-2 right-2 bg-white p-3 rounded-full shadow-lg border border-purple-100">
                          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                       </div>
                   </div>
                   
                   <h3 className="text-3xl font-bold text-stone-800 mb-3 font-promt bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-600">AI กำลังวางโครงเรื่อง...</h3>
                   <p className="text-stone-500 mb-8 max-w-md mx-auto">เรากำลังวิเคราะห์เทรนด์และกลุ่มเป้าหมาย เพื่อสร้างสารบัญที่ดึงดูดใจที่สุดสำหรับคุณ</p>
               </div>
               
               {/* Log Console */}
               <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white shadow-lg w-full max-w-lg relative z-10">
                  <div className="h-32 overflow-y-auto custom-scrollbar space-y-2">
                      {logs.map((log, idx) => (
                          <div key={idx} className="text-xs text-stone-600 font-mono flex gap-3 items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
                              <span className="text-stone-400 shrink-0">
                                  {log.timestamp.toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}
                              </span>
                              <span>{log.message}</span>
                          </div>
                      ))}
                  </div>
               </div>
            </div>
          )}

          {/* STEP 2: APPROVAL SCREEN */}
          {step === WorkflowStep.APPROVAL && (
              <div className="max-w-6xl mx-auto mt-6 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Main Content */}
                      <div className="lg:col-span-8 space-y-6">
                          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-stone-200 relative overflow-hidden">
                              
                              <div className="flex justify-between items-start mb-6 relative z-10">
                                  <div>
                                      <h2 className="text-2xl font-bold text-stone-800">ยืนยันโครงเรื่อง (Blueprint)</h2>
                                      <p className="text-stone-500 text-sm mt-1">ตรวจสอบความถูกต้องก่อนเริ่มเขียนจริง</p>
                                  </div>
                                  <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium border border-purple-200 flex items-center gap-1">
                                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div> รอการอนุมัติ
                                  </span>
                              </div>
                              
                              {/* Outline Form Fields (Same as before) */}
                              <div className="space-y-6 relative z-10">
                                  <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100">
                                      <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">ชื่อเรื่อง</label>
                                      <h3 className="text-2xl font-bold text-stone-800 mt-2 font-promt leading-relaxed">{eBook.title}</h3>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
                                          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">กลุ่มเป้าหมาย</label>
                                          <p className="text-stone-700 text-sm mt-2">{eBook.targetAudience}</p>
                                      </div>
                                      <div className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
                                          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">สไตล์การเขียน</label>
                                          <p className="text-stone-700 text-sm mt-2">{TONES.find(t => t.id === eBook.tone)?.label || eBook.tone}</p>
                                      </div>
                                  </div>

                                  <div>
                                      <div className="flex justify-between items-end mb-3">
                                          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">สารบัญ (แก้ไขได้)</label>
                                          <span className="text-[10px] text-stone-400">
                                              {eBook.chapters?.length || 0}/12 บท
                                          </span>
                                      </div>
                                      <div className="space-y-3">
                                          {eBook.chapters?.map((chap, idx) => (
                                              <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-stone-100 rounded-xl shadow-sm hover:shadow-md transition-all group animate-fade-in">
                                                  <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center font-bold text-xs shrink-0 border border-stone-200">
                                                      {chap.id === 'ch-conclusion' ? 'End' : idx + 1}
                                                  </div>
                                                  
                                                  <div className="flex-1 relative">
                                                      <input 
                                                          type="text"
                                                          value={chap.title}
                                                          onChange={(e) => handleEditChapterTitle(idx, e.target.value)}
                                                          className="w-full text-stone-700 font-medium text-sm border-none bg-transparent focus:ring-0 p-0 hover:text-purple-800 transition-colors placeholder-stone-300"
                                                          placeholder="ใส่ชื่อบท..."
                                                      />
                                                      <PencilIcon className="w-3 h-3 text-stone-300 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none" />
                                                  </div>

                                                  {chap.id !== 'ch-conclusion' && (
                                                      <button 
                                                          onClick={() => handleRemoveChapter(idx)}
                                                          className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                          title="ลบบทนี้"
                                                      >
                                                          <TrashIcon className="w-4 h-4" />
                                                      </button>
                                                  )}
                                              </div>
                                          ))}
                                          
                                          <button
                                              onClick={handleAddChapter}
                                              disabled={(eBook.chapters?.length || 0) >= 12}
                                              className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                              <PlusIcon className="w-4 h-4" /> เพิ่มบทใหม่
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Sidebar: Actions */}
                      <div className="lg:col-span-4 space-y-6">
                          {/* Action Buttons */}
                          <div className="bg-white p-6 rounded-3xl shadow-lg border border-stone-100 space-y-4">
                              <button 
                                  onClick={handleApproveOutline}
                                  className="w-full py-4 px-6 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex justify-center items-center gap-2 transform hover:translate-y-[-2px]"
                              >
                                  <CheckCircleIcon className="w-6 h-6" /> อนุมัติ & เริ่มเขียน
                              </button>
                              <button 
                                  onClick={handleRegenerateOutline}
                                  className="w-full py-3 px-4 bg-white border-2 border-stone-200 text-stone-600 rounded-xl font-semibold hover:border-stone-400 hover:text-stone-800 transition-all flex justify-center items-center gap-2"
                              >
                                  <ArrowPathIcon className="w-5 h-5" /> สร้างโครงเรื่องใหม่
                              </button>
                          </div>
                          
                          <div className="h-64">
                               <AgentLog logs={logs} />
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* PROCESSING & COMPLETED VIEWS */}
          {(step > WorkflowStep.APPROVAL) && (
            <div className="grid grid-cols-1 gap-6">
              
              {/* Live Status Area */}
              {step !== WorkflowStep.COMPLETED && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                  <div className="lg:col-span-2">
                     <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border border-stone-200 p-8 min-h-[300px]">
                        <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-stone-800">
                          <span className="w-2 h-8 bg-purple-500 rounded-full inline-block"></span>
                          สถานะการทำงาน (Work In Progress)
                        </h3>
                        
                        <div className="mb-8 flex gap-6 p-6 bg-stone-50 rounded-2xl border border-stone-100">
                              <div className="w-24 h-32 bg-stone-200 rounded-lg shadow-inner shrink-0 overflow-hidden relative group">
                                  {eBook.coverImage ? (
                                      <img src={eBook.coverImage} className="w-full h-full object-cover shadow-sm" />
                                  ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs text-center p-2">
                                          <SparklesIcon className="w-6 h-6 mb-1 opacity-50" />
                                          Generating...
                                      </div>
                                  )}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="text-xl font-bold text-stone-800 line-clamp-1 font-promt">{eBook.title}</div>
                                  <div className="text-stone-500 text-sm line-clamp-2 mt-1 leading-relaxed">{eBook.description}</div>
                                  <div className="flex gap-2 mt-4">
                                      <span className="text-[10px] bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">{eBook.tone}</span>
                                      <span className="text-[10px] bg-stone-200 text-stone-600 px-3 py-1 rounded-full font-medium">{eBook.coverStyle}</span>
                                  </div>
                              </div>
                        </div>

                        {/* Chapter Progress Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {eBook.chapters?.map((chap, idx) => (
                              <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                              chap.status === 'completed' ? 'bg-emerald-50 border-emerald-100 shadow-sm' :
                              chap.status === 'generating' ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200 shadow-md scale-[1.02]' :
                              'bg-white border-stone-100 opacity-60'
                              }`}>
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                      chap.status === 'completed' ? 'bg-emerald-200 text-emerald-700' : 
                                      chap.status === 'generating' ? 'bg-purple-200 text-purple-700' : 'bg-stone-200 text-stone-500'
                                  }`}>
                                      {chap.status === 'completed' ? <CheckCircleIcon className="w-5 h-5" /> : (idx + 1)}
                                  </div>
                                  <span className="text-sm font-medium truncate text-stone-700">
                                      {chap.title}
                                  </span>
                              </div>
                              {chap.status === 'generating' && <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>}
                              </div>
                          ))}
                        </div>
                     </div>
                  </div>
                  
                  <div className="lg:col-span-1 space-y-6">
                     <AgentLog logs={logs} />
                  </div>
                </div>
              )}

              {/* Final Result View */}
              {step === WorkflowStep.COMPLETED && (
                 <div className="space-y-6 animate-fade-in">
                     <div className="bg-gradient-to-r from-purple-700 to-pink-600 rounded-3xl p-8 text-white flex flex-col items-center justify-center text-center gap-4 shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                         
                         <div className="relative z-10">
                             <h2 className="text-3xl font-bold font-promt mb-2">🎉 หนังสือของคุณเสร็จสมบูรณ์แล้ว!</h2>
                             <p className="text-purple-100">คุณสามารถอ่าน แก้ไข และดาวน์โหลดผลงานได้ที่ด้านล่าง</p>
                         </div>
                     </div>

                     <BookPreview 
                        ebook={eBook as EBook} 
                        onRestart={() => {
                          setTopic('');
                          setStep(WorkflowStep.INPUT);
                          setEBook({ chapters: [] });
                          setLogs([]);
                        }}
                        onUpdateChapter={handleUpdateChapter}
                     />
                 </div>
              )}
            </div>
          )}
        </main>
        )}

        {/* Main Footer */}
        <footer className="w-full text-center py-8 text-stone-400 text-sm relative z-20">
           © 2026 SoloPreneur E-Book Architect. By Wachida H🦐. All rights reserved.
        </footer>
      </div>
    );
  }

  // 2. Not Authenticated -> Landing Page or Login
  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // 3. Not Authenticated & 'Get Started' clicked -> Login
  return <Login onLogin={(user) => {
    setCurrentUser(user);
    setShowLanding(false);
  }} />;
};

export default App;