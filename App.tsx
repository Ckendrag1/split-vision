
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReceiptItem, Person, ChatMessage, ReceiptSession, AssignmentResult } from './types';
import { parseReceiptImage, processAssignmentCommand } from './geminiService';
import ReceiptPane from './components/ReceiptPane';
import ChatPane from './components/ChatPane';

const App: React.FC = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ReceiptSession[]>([]);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [tip, setTip] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeActions, setActiveActions] = useState<Record<string, string>>({});
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('splitvision_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) loadSession(parsed[0]);
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) localStorage.setItem('splitvision_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, items, tax, total, tip, messages } : s
      ));
    }
  }, [items, tax, total, tip, messages]);

  const loadSession = (session: ReceiptSession) => {
    setCurrentSessionId(session.id);
    setItems(session.items);
    setTax(session.tax);
    setTotal(session.total);
    setTip(session.tip);
    setMessages(session.messages);
    setIsHistoryOpen(false);
  };

  const createNewSession = (data?: any) => {
    const newId = `session-${Date.now()}`;
    const newSession: ReceiptSession = {
      id: newId,
      date: new Date().toLocaleDateString(),
      items: data?.items || [],
      tax: data?.tax || 0,
      total: data?.total || 0,
      tip: 0,
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setItems(newSession.items);
    setTax(newSession.tax);
    setTotal(newSession.total);
    setTip(0);
    setMessages([]);
  };

  const calculateTotals = useCallback(() => {
    const peopleMap: Record<string, number> = {};
    const subtotal = items.reduce((acc, item) => acc + item.price, 0);
    
    items.forEach(item => {
      if (item.assignedTo.length > 0) {
        const totalWeight = item.assignedTo.reduce((sum, p) => sum + p.weight, 0);
        item.assignedTo.forEach(person => {
          const share = (person.weight / totalWeight) * item.price;
          peopleMap[person.name] = (peopleMap[person.name] || 0) + share;
        });
      }
    });

    const taxAndTipRatio = subtotal > 0 ? (tax + tip) / subtotal : 0;
    
    return Object.entries(peopleMap).map(([name, personSubtotal]) => ({
      name,
      subtotal: personSubtotal,
      totalOwed: personSubtotal * (1 + taxAndTipRatio)
    }));
  }, [items, tax, tip]);

  const [personTotals, setPersonTotals] = useState<Person[]>([]);

  useEffect(() => {
    setPersonTotals(calculateTotals());
  }, [calculateTotals]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const data = await parseReceiptImage(base64);
        const mappedItems: ReceiptItem[] = data.items.map((item, index) => ({
          id: `item-${index}-${Date.now()}`,
          name: item.name,
          price: item.price,
          assignedTo: []
        }));
        createNewSession({ items: mappedItems, tax: data.tax, total: data.total });
        setMessages([{
          id: 'msg-init',
          role: 'assistant',
          content: `Bill digitized! Total is $${data.total.toFixed(2)}. I'm ready for assignments. Who had what?`,
          timestamp: new Date()
        }]);
      } catch (error) { console.error(error); } finally { setIsParsing(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const existingPeople = personTotals.map(p => p.name);
      const result: AssignmentResult = await processAssignmentCommand(text, items, existingPeople);
      
      const newActions: Record<string, string> = {};
      
      setItems(prevItems => prevItems.map(item => {
        const update = result.assignments.find(a => a.itemId === item.id);
        if (update) {
          if (update.action) newActions[item.id] = update.action;
          
          // Merge new weighted assignments into existing ones
          const currentMap = new Map(item.assignedTo.map(p => [p.name, p]));
          update.persons.forEach(p => {
            currentMap.set(p.name, p); // Overwrite or add with new weight
          });
          
          return { ...item, assignedTo: Array.from(currentMap.values()) };
        }
        return item;
      }));

      setActiveActions(newActions);
      setTimeout(() => setActiveActions({}), 2000);

      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        role: 'assistant',
        content: result.reconciliation_alerts.length > 0 
          ? `Calculated! Note: ${result.reconciliation_alerts.join('. ')}`
          : `All set. I've updated the shares proportionally.`,
        timestamp: new Date(),
        alerts: result.reconciliation_alerts
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) { console.error(error); }
  };

  const unassignedCount = items.filter(i => i.assignedTo.length === 0).length;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-950 overflow-hidden text-slate-100">
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-80 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col animate-fade-in">
            <header className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400">Bill Vault</h2>
              <button onClick={() => setIsHistoryOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {sessions.map(s => (
                <button key={s.id} onClick={() => loadSession(s)} className={`w-full text-left p-4 rounded-2xl transition ${currentSessionId === s.id ? 'bg-indigo-600' : 'hover:bg-slate-800 border border-slate-800/50'}`}>
                  <p className="text-xs font-bold">{s.date}</p>
                  <p className="text-sm font-black mt-1">${s.total.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)}></div>
        </div>
      )}

      <div className="w-full md:w-[45%] lg:w-[40%] h-1/2 md:h-full border-r border-slate-900 overflow-hidden flex flex-col bg-slate-900/30">
        <header className="p-6 bg-slate-900/80 backdrop-blur-md flex justify-between items-center shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsHistoryOpen(true)} className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </button>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-none italic">SplitVision</h1>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mt-1">Vision Engine</p>
            </div>
          </div>
          <label className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-2xl cursor-pointer transition-all text-xs font-bold active:scale-95 shadow-lg shadow-indigo-900/20">
            <i className="fa-solid fa-camera mr-2"></i> SCAN
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
        </header>

        {unassignedCount > 0 && items.length > 0 && (
          <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 flex justify-between items-center animate-pulse">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation"></i>
              {unassignedCount} Items unassigned
            </span>
            <button onClick={() => handleSendMessage(`Which items are still unassigned?`)} className="text-[10px] font-black text-amber-400 hover:underline">LOCATE</button>
          </div>
        )}
        
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {!isParsing && items.length > 0 ? (
            <ReceiptPane items={items} tax={tax} tip={tip} total={total} onUpdateTip={(t) => setTip(t)} activeActions={activeActions} />
          ) : isParsing ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-indigo-900 rounded-full border-t-indigo-500 animate-spin"></div>
              </div>
              <p className="text-sm font-bold text-white">Neural Processing...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-6 text-center p-8 opacity-40">
              <i className="fa-solid fa-file-invoice text-5xl text-slate-600"></i>
              <p className="text-slate-400 text-sm font-medium">Scan a receipt to activate the logic engine.</p>
            </div>
          )}
        </main>
      </div>

      <div className="w-full md:flex-1 h-1/2 md:h-full overflow-hidden flex flex-col relative">
        <ChatPane messages={messages} onSend={handleSendMessage} personTotals={personTotals} total={total} />
      </div>
    </div>
  );
};

export default App;
