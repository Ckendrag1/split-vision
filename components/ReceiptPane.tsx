
import React from 'react';
import { ReceiptItem } from '../types';

interface ReceiptPaneProps {
  items: ReceiptItem[];
  tax: number;
  tip: number;
  total: number;
  onUpdateTip: (tip: number) => void;
  activeActions?: Record<string, string>;
}

const ReceiptPane: React.FC<ReceiptPaneProps> = ({ items, tax, tip, total, onUpdateTip, activeActions = {} }) => {
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);

  const applyTipPercent = (pct: number) => {
    onUpdateTip(subtotal * pct);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Digitized List</h2>
        <div className="flex gap-1">
          {[0.1, 0.15, 0.2].map(pct => (
            <button 
              key={pct}
              onClick={() => applyTipPercent(pct)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-indigo-600 rounded-md text-[9px] font-bold text-slate-400 hover:text-white transition"
            >
              {pct * 100}% TIP
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const action = activeActions[item.id];
          const isPulsing = action === 'pulse';
          const isShared = item.assignedTo.length > 1;

          return (
            <div 
              key={item.id} 
              className={`bg-slate-900/80 p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group ${
                isPulsing ? 'scale-[1.02] border-indigo-500 shadow-2xl shadow-indigo-500/20' : 
                'border-slate-800 hover:border-slate-700'
              } ${isShared ? 'split-divider' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.assignedTo.length > 0 ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]'}`}></div>
                  <h3 className="font-bold text-slate-200 truncate text-sm tracking-tight">{item.name}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.assignedTo.length > 0 ? (
                    item.assignedTo.map((person, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-md border border-indigo-500/20 flex items-center gap-1"
                      >
                        {person.name.toUpperCase()}
                        {person.weight > 1 && (
                          <span className="text-[8px] opacity-60">x{person.weight}</span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Awaiting Input</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-white">${item.price.toFixed(2)}</p>
                {isShared && (
                  <p className="text-[9px] text-indigo-500/70 font-bold mt-1 uppercase">
                    Split Weight: {item.assignedTo.reduce((s, p) => s + p.weight, 0)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-600 rounded-[32px] p-6 shadow-2xl shadow-indigo-900/30 text-white relative overflow-hidden group">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl transition-all"></div>
        <div className="space-y-3 relative z-10">
          <div className="flex justify-between text-[11px] font-bold text-indigo-200 uppercase tracking-widest opacity-80">
            <span>Subtotal</span>
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] font-bold text-indigo-200 uppercase tracking-widest opacity-80">
            <span>Tax (10% VAT)</span>
            <span className="font-mono">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] font-bold text-indigo-200 uppercase tracking-widest pt-1 border-t border-white/10">
            <span className="flex items-center gap-2">
              Tip
              <input 
                type="number" 
                className="w-16 bg-white/10 border-none rounded-lg px-2 py-1 text-right text-[10px] focus:ring-1 focus:ring-white outline-none text-white font-mono placeholder:text-white/30"
                value={tip || ''} 
                onChange={(e) => onUpdateTip(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </span>
            <span className="font-mono text-white">${tip.toFixed(2)}</span>
          </div>
        </div>
        <div className="pt-5 flex justify-between items-end relative z-10">
          <div>
            <p className="text-[9px] text-white/60 font-black uppercase tracking-[0.2em] mb-1">Final Settlement</p>
            <p className="text-4xl font-black tracking-tighter leading-none italic">${(subtotal + tax + tip).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-white/40 font-bold uppercase mb-1">Original</p>
            <p className="text-sm font-mono text-white/30 line-through tracking-tighter">${total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPane;
