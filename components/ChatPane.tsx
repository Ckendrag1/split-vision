
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Person } from '../types';

interface ChatPaneProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  personTotals: Person[];
  total: number;
}

const ChatPane: React.FC<ChatPaneProps> = ({ messages, onSend, personTotals, total }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const grandTotal = personTotals.reduce((sum, p) => sum + p.totalOwed, 0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported");
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <header className="p-6 border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <i className="fa-solid fa-sparkles text-sm"></i>
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight">AI LOGIC CORE</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Listening</p>
            </div>
          </div>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 opacity-30">
            <i className="fa-solid fa-microphone-lines text-4xl text-slate-700"></i>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Awaiting Command</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
          >
            <div 
              className={`max-w-[88%] rounded-3xl px-5 py-3 shadow-xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.content}
              
              {msg.alerts && msg.alerts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                  {msg.alerts.map((alert, i) => (
                    <div key={i} className="flex gap-2 items-start text-[10px] bg-amber-500/10 text-amber-500 p-2.5 rounded-xl border border-amber-500/20 font-black uppercase tracking-tight">
                      <i className="fa-solid fa-triangle-exclamation mt-0.5 shrink-0"></i>
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-2 mx-2">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      {personTotals.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-md border-t border-slate-900 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Real-time Ledger</h3>
            <div className="px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">Live Audit</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar">
            {personTotals.map((person, idx) => {
              const percentage = grandTotal > 0 ? (person.totalOwed / grandTotal) * 100 : 0;
              return (
                <div key={idx} className="bg-slate-900/80 p-3 rounded-[20px] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {person.name.substring(0, 1).toUpperCase()}
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 truncate">{person.name}</span>
                    </div>
                    <span className="text-xs font-black text-indigo-400 font-mono">${person.totalOwed.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-6 bg-slate-950 border-t border-slate-900">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center bg-slate-900 p-1.5 rounded-[24px] border border-slate-800 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
          <button 
            type="button" 
            onClick={startListening}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-microphone"></i>
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to the Logic Engine..."
            className="flex-1 px-2 py-2 bg-transparent text-sm focus:outline-none placeholder:text-slate-600 text-slate-100 font-medium"
          />
          <button 
            type="submit" 
            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[18px] flex items-center justify-center transition shadow-xl shadow-indigo-900/40 disabled:opacity-20 disabled:grayscale"
            disabled={!input.trim()}
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPane;
