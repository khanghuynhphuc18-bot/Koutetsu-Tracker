import React, { useState } from 'react';
import {
  BookOpen,
  Edit3,
  Trash2,
  Star,
  Search,
  Sparkles,
  Calendar,
  Save,
  X,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { JournalEntry } from '../types';
import { playCompleteChime, triggerHaptic } from '../utils/haptics';

interface JournalSectionProps {
  journalEntries: JournalEntry[];
  selectedDate: string;
  habitsCompletedCount: number;
  habitsTotalCount: number;
  onSaveEntry: (entry: {
    id?: string;
    date: string;
    title: string;
    content: string;
    mood?: 'steady' | 'fire' | 'calm' | 'triumph' | 'tired';
    rating?: number;
    habitsCompletedCount?: number;
    habitsTotalCount?: number;
  }) => void;
  onDeleteEntry: (id: string) => void;
  onSelectDate: (date: string) => void;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const MOODS: {
  key: 'steady' | 'fire' | 'calm' | 'triumph' | 'tired';
  label: string;
  emoji: string;
  color: string;
  border: string;
}[] = [
  { key: 'steady', label: 'Kiên định', emoji: '⚔️', color: 'text-cyan-300 bg-cyan-950/60', border: 'border-cyan-500/50' },
  { key: 'fire', label: 'Quyết tâm', emoji: '🔥', color: 'text-amber-300 bg-amber-950/60', border: 'border-amber-500/50' },
  { key: 'calm', label: 'Bình thản', emoji: '🧘', color: 'text-blue-300 bg-blue-950/60', border: 'border-blue-500/50' },
  { key: 'triumph', label: 'Tự hào', emoji: '🏆', color: 'text-emerald-300 bg-emerald-950/60', border: 'border-emerald-500/50' },
  { key: 'tired', label: 'Mệt mỏi', emoji: '🌧️', color: 'text-slate-300 bg-slate-800/60', border: 'border-slate-600/50' },
];

export const JournalSection: React.FC<JournalSectionProps> = ({
  journalEntries,
  selectedDate,
  habitsCompletedCount,
  habitsTotalCount,
  onSaveEntry,
  onDeleteEntry,
  onSelectDate,
  soundEnabled,
  hapticEnabled,
}) => {
  const selectedDateEntry = journalEntries.find((e) => e.date === selectedDate);
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<'steady' | 'fire' | 'calm' | 'triumph' | 'tired'>('steady');
  const [rating, setRating] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const startEditing = (entry?: JournalEntry) => {
    if (entry) {
      setTitleInput(entry.title);
      setContentInput(entry.content);
      setSelectedMood(entry.mood || 'steady');
      setRating(entry.rating || 5);
    } else if (selectedDateEntry) {
      setTitleInput(selectedDateEntry.title);
      setContentInput(selectedDateEntry.content);
      setSelectedMood(selectedDateEntry.mood || 'steady');
      setRating(selectedDateEntry.rating || 5);
    } else {
      setTitleInput('');
      setContentInput('');
      setSelectedMood('steady');
      setRating(5);
    }
    setIsEditing(true);
    triggerHaptic('light', hapticEnabled);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setTitleInput('');
    setContentInput('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentInput.trim()) return;

    onSaveEntry({
      id: selectedDateEntry?.id,
      date: selectedDate,
      title: titleInput.trim() || `Nhật ký ngày ${selectedDate}`,
      content: contentInput.trim(),
      mood: selectedMood,
      rating,
      habitsCompletedCount,
      habitsTotalCount,
    });
    playCompleteChime(soundEnabled);
    triggerHaptic('success', hapticEnabled);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    onDeleteEntry(id);
    setEntryToDelete(null);
    triggerHaptic('medium', hapticEnabled);
  };

  const formatDateVi = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      return `${days[dateObj.getDay()]}, ${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  const filteredEntries = journalEntries
    .filter((entry) => {
      const matchesSearch =
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.date.includes(searchQuery);
      return matchesSearch;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalEntries = journalEntries.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            NHẬT KÝ
          </h3>
        </div>
        {!isEditing && (
          !selectedDateEntry ? (
            <button
              onClick={() => startEditing()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Viết</span>
            </button>
          ) : (
            <button
              onClick={() => startEditing(selectedDateEntry)}
              className="p-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-400 transition"
              title="Chỉnh sửa nhật ký"
              aria-label="Chỉnh sửa nhật ký"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {formatDateVi(selectedDate)}
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Tiêu đề nhật ký
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="VD: Rèn luyện buổi sáng, Giữ tâm kiên định..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Tâm trạng rèn luyện hôm nay:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => {
                      setSelectedMood(m.key);
                      triggerHaptic('light', hapticEnabled);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition ${
                      selectedMood === m.key
                        ? `${m.color} ${m.border} ring-1 ring-cyan-400`
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Mức độ hài lòng với bản thân:
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      triggerHaptic('light', hapticEnabled);
                    }}
                    className="p-1 text-slate-600 hover:text-amber-400 transition"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-[11px] font-bold text-amber-300 ml-2">
                  {rating === 5 && 'Tuyệt vời!'}
                  {rating === 4 && 'Rất tốt, tiếp tục phát huy.'}
                  {rating === 3 && 'Tạm ổn, cần kiên trì.'}
                  {rating === 2 && 'Cố gắng, mai phải tốt hơn.'}
                  {rating === 1 && 'Cần chấn chỉnh tinh thần.'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Nội dung trang nhật ký
              </label>
              <textarea
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                placeholder="Ghi lại cảm nghĩ, khó khăn đã vượt qua, bài học rút ra..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition resize-y leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!contentInput.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu Nhật Ký
              </button>
            </div>
          </form>
        ) : selectedDateEntry ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {selectedDateEntry.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {selectedDateEntry.mood && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        MOODS.find((m) => m.key === selectedDateEntry.mood)?.color || 'bg-slate-800 text-slate-300'
                      } ${
                        MOODS.find((m) => m.key === selectedDateEntry.mood)?.border || 'border-slate-700'
                      }`}
                    >
                      <span>{MOODS.find((m) => m.key === selectedDateEntry.mood)?.emoji}</span>
                      <span>{MOODS.find((m) => m.key === selectedDateEntry.mood)?.label}</span>
                    </span>
                  )}
                  {selectedDateEntry.rating && (
                    <div className="flex items-center">
                      {Array.from({ length: selectedDateEntry.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEditing(selectedDateEntry)}
                  className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-400 hover:text-white transition"
                  title="Sửa nhật ký"
                  aria-label="Sửa nhật ký"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEntryToDelete(selectedDateEntry.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                  title="Xóa trang nhật ký"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {selectedDateEntry.content}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Lưu trữ ngoại tuyến an toàn
              </span>
              <span>Cập nhật: {new Date(selectedDateEntry.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Nay chưa viết nhật ký
            </p>
            <button
              onClick={() => startEditing()}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Viết</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Lịch Sử Các Trang Nhật Ký
          </h4>
          <span className="text-[10px] text-slate-400 font-medium">
            {filteredEntries.length} bài viết
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc ngày..."
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-1 text-xs text-slate-400">
            <p>Không tìm thấy trang nhật ký nào phù hợp.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredEntries.map((entry) => {
              const isCurrentSelected = entry.date === selectedDate;
              const moodObj = MOODS.find((m) => m.key === entry.mood);
              return (
                <div
                  key={entry.id}
                  className={`p-3.5 rounded-2xl border transition relative space-y-2 cursor-pointer ${
                    isCurrentSelected
                      ? 'bg-slate-900/90 border-cyan-500/70 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                  onClick={() => {
                    onSelectDate(entry.date);
                    triggerHaptic('light', hapticEnabled);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {entry.title}
                        </span>
                        {isCurrentSelected && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                            Đang xem
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300">
                        <span className="flex items-center gap-1 font-medium text-cyan-300">
                          <Calendar className="w-3 h-3" />
                          {formatDateVi(entry.date)}
                        </span>
                        {moodObj && (
                          <span className="flex items-center gap-0.5">
                            <span>{moodObj.emoji}</span>
                            <span className="text-[10px] text-slate-300">{moodObj.label}</span>
                          </span>
                        )}
                        {entry.rating && (
                          <span className="flex items-center text-amber-400">
                            {Array.from({ length: entry.rating }).map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          onSelectDate(entry.date);
                          startEditing(entry);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEntryToDelete(entry.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>

                  {entry.habitsCompletedCount !== undefined && entry.habitsTotalCount !== undefined && (
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Đạt {entry.habitsCompletedCount}/{entry.habitsTotalCount} thói quen
                      </span>
                      <span className="text-cyan-400 flex items-center gap-0.5">
                        Xem chi tiết <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              Xác Nhận Xóa Nhật Ký
            </h4>
            <p className="text-xs text-slate-300">
              Bạn có chắc chắn muốn xóa trang nhật ký này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEntryToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(entryToDelete)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition shadow-md shadow-rose-500/20"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
