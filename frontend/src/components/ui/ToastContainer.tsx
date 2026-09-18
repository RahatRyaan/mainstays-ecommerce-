import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let cardBg = 'bg-[#FFFDF9] dark:bg-[#1E1C1A] border-[#EBD69D] text-[#1C1917] dark:text-[#FAF7F0] shadow-editorial';
        let badgeBg = 'bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D]';
        let Icon = Info;
        let iconColor = 'text-[#E59819]';

        if (toast.type === 'success') {
          cardBg = 'bg-[#FFFDF9] dark:bg-[#1E1C1A] border-[#C8E0D4] text-[#1C1917] dark:text-[#FAF7F0] shadow-editorial';
          badgeBg = 'bg-[#EDF5F1] text-[#2F5844] border border-[#C8E0D4]';
          Icon = CheckCircle2;
          iconColor = 'text-[#3F5E4D]';
        } else if (toast.type === 'error') {
          cardBg = 'bg-[#FFFDF9] dark:bg-[#1E1C1A] border-[#F2C7C4] text-[#1C1917] dark:text-[#FAF7F0] shadow-editorial';
          badgeBg = 'bg-[#FCEFEF] text-[#B83226] border border-[#F2C7C4]';
          Icon = AlertCircle;
          iconColor = 'text-[#D94E34]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-3 ${cardBg}`}
          >
            <div className={`p-1.5 rounded-xl flex-shrink-0 mt-0.5 ${badgeBg}`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div className="flex-1 text-xs">
              {toast.title && <div className="font-serif font-bold text-sm text-[#1C1917] dark:text-[#FAF7F0] mb-0.5">{toast.title}</div>}
              <div className="font-mono-tag text-xs text-[#6B645C] dark:text-[#A8A29E] leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#9C948A] hover:text-[#1C1917] dark:hover:text-[#FAF7F0] transition-colors p-1 rounded-lg hover:bg-[#F3ECE1] dark:hover:bg-[#2A2724] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
