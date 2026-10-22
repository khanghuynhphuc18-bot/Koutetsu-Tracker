import React from 'react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { getTodayDateStr } from '../services/storage';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}) => {
  if (!isOpen) return null;

  const todayStr = getTodayDateStr();
  const [currentYear, currentMonth] = selectedDate.split('-').map(Number);
  const [viewYear, setViewYear] = React.useState(currentYear);
  const [viewMonth, setViewMonth] = React.useState(currentMonth);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-[#1c2541] border border-cyan-500/30 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Chọn ngày theo dõi</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-white px-1">
          <button
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 flex items-center justify-center text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            {monthNames[viewMonth - 1]} năm {viewYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 flex items-center justify-center text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 font-bold mb-1">
          <span>CN</span>
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span>T7</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs">
          {days.map((dayNum, idx) => {
            if (!dayNum) {
              return <div key={`empty_${idx}`} className="h-8" />;
            }
            const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const isToday = todayStr === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => {
                  onSelectDate(dateStr);
                  onClose();
                }}
                className={`h-8 rounded-xl font-medium transition flex items-center justify-center relative ${
                  isSelected
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                    : isToday
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {dayNum}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-700/60">
          <button
            onClick={() => {
              onSelectDate(todayStr);
              onClose();
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Về hôm nay
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
