import React, { useEffect, useRef } from 'react';
import { LogEntry, AgentRole } from '../types';

interface AgentLogProps {
  logs: LogEntry[];
}

const getAgentColor = (role: AgentRole) => {
  switch (role) {
    case AgentRole.STRATEGIST: return 'text-purple-700 bg-purple-100 border border-purple-200';
    case AgentRole.WRITER: return 'text-blue-700 bg-blue-100 border border-blue-200';
    case AgentRole.DESIGNER: return 'text-pink-700 bg-pink-100 border border-pink-200';
    case AgentRole.REVIEWER: return 'text-emerald-700 bg-emerald-100 border border-emerald-200';
    default: return 'text-stone-600 bg-stone-100 border border-stone-200';
  }
};

export const AgentLog: React.FC<AgentLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-stone-200 h-96 flex flex-col overflow-hidden">
      <div className="p-4 bg-purple-50/80 border-b border-purple-100 font-bold text-stone-700 flex justify-between items-center">
        <span>บันทึกการทำงาน AI</span>
        <span className="flex items-center gap-1.5 text-xs font-normal text-stone-500 bg-white px-2 py-1 rounded-full border border-stone-200">
           <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
           Live
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-2 opacity-60">
             <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
             </div>
             <p className="text-sm italic">รอรับคำสั่ง...</p>
          </div>
        )}
        {logs.map((log, index) => (
          <div key={index} className="flex gap-3 items-start animate-fade-in group">
            <div className="min-w-[3.5rem] text-[10px] text-stone-400 mt-1.5 font-mono text-right group-hover:text-stone-600 transition-colors">
              {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="flex-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold mr-2 mb-1 shadow-sm ${getAgentColor(log.agent)}`}>
                {log.agent}
              </span>
              <p className="text-sm text-stone-700 leading-relaxed bg-stone-50/50 p-2 rounded-lg border border-transparent hover:border-purple-100 transition-all">
                {log.message}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};