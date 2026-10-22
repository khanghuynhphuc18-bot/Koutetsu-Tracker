import React, { useState, useEffect } from 'react';
import { X, Plus, Tag, Trash2, Brain, Check, Layers, AlertCircle } from 'lucide-react';
import { Habit, DEFAULT_HABIT_CATEGORIES, MAX_HABIT_CATEGORIES } from '../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
  availableCategories?: string[];
  onAddCategory?: (name: string) => boolean;
  onSave: (
    title: string,
    frequency: 'daily' | 'weekdays' | 'weekends',
    categories: string[]
  ) => void;
  onDelete?: (id: string) => void;
  existingHabitsCount?: number;
}

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  habitToEdit,
  availableCategories = DEFAULT_HABIT_CATEGORIES,
  onAddCategory,
  onSave,
  onDelete,
  existingHabitsCount = 0,
}) => {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends'>('daily');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCatInput, setShowAddCatInput] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setFrequency(habitToEdit.frequency || 'daily');
      const cats = habitToEdit.categories && habitToEdit.categories.length > 0
        ? habitToEdit.categories
        : habitToEdit.category
        ? [habitToEdit.category]
        : [availableCategories[0] || 'Thể chất'];
      setSelectedCategories(cats);
    } else {
      setTitle('');
      setFrequency('daily');
      setSelectedCategories([availableCategories[0] || 'Thể chất']);
    }
    setShowAddCatInput(false);
    setNewCatInput('');
    setCatError(null);
  }, [habitToEdit, isOpen, availableCategories]);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        if (prev.length === 1) {
          // Keep at least one category selected
          return prev;
        }
        return prev.filter((c) => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (availableCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCatError('Mục này đã tồn tại');
      return;
    }
    if (availableCategories.length >= MAX_HABIT_CATEGORIES) {
      setCatError(`Tối đa ${MAX_HABIT_CATEGORIES} mục`);
      return;
    }
    if (onAddCategory) {
      const ok = onAddCategory(trimmed);
      if (ok) {
        setSelectedCategories((prev) => [...prev, trimmed]);
        setNewCatInput('');
        setShowAddCatInput(false);
        setCatError(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const finalCategories = selectedCategories.length > 0
      ? selectedCategories
      : [availableCategories[0] || 'Thể chất'];
    onSave(title.trim(), frequency, finalCategories);
    onClose();
  };

  const quickSuggestions = [
    { title: 'Tập thể dục 30 phút', cats: ['Thể chất'] },
    { title: 'Đọc 20 trang sách', cats: ['Tri thức'] },
    { title: 'Uống 2 lít nước', cats: ['Thể chất'] },
    { title: 'Thở hộp / Thiền tịnh', cats: ['Tinh thần'] },
    { title: 'Gọi điện hỏi thăm bạn bè/gia đình', cats: ['Xã hội'] },
    { title: 'Học ngoại ngữ 25p', cats: ['Tri thức'] },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-[#1c2541] border border-cyan-500/30 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-700/80">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-cyan-400" />
            {habitToEdit ? 'Chỉnh Sửa Thói Quen' : 'Thêm Thói Quen Mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1" aria-label="Đóng">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!habitToEdit && existingHabitsCount >= 3 && (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1 text-xs text-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
                <Brain className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Nhắc nhở khoa học:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Bạn đã có <strong className="text-cyan-400">{existingHabitsCount} thói quen</strong>. Tạo nhiều hơn 3 thói quen cùng lúc dễ gây quá tải. Nên tập trung rèn luyện 1 - 3 thói quen cốt lõi trước.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Tên thói quen</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Chạy bộ, Đọc sách, Thiền định..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              autoFocus
            />
          </div>

          {/* PHÂN LOẠI MỤC (HỖ TRỢ ĐA MỤC CHO BIỂU ĐỒ ĐA GIÁC) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mục hiển thị biểu đồ đa giác:</span>
              </label>
              <span className="text-[10px] text-cyan-400 font-mono">
                {selectedCategories.length} mục đã chọn
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Có thể chọn 1 hoặc nhiều mục để phân bố vào biểu đồ:
            </p>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {availableCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                        : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                        isSelected
                          ? 'bg-cyan-400 border-cyan-400 text-slate-950 font-black'
                          : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>{cat}</span>
                  </button>
                );
              })}

              {availableCategories.length < MAX_HABIT_CATEGORIES && !showAddCatInput && (
                <button
                  type="button"
                  onClick={() => setShowAddCatInput(true)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-dashed border-slate-600 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm mục</span>
                </button>
              )}
            </div>

            {/* Quick add category inline */}
            {showAddCatInput && (
              <div className="pt-2 p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Tạo thêm mục mới (Tối đa {MAX_HABIT_CATEGORIES} mục):</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCatInput(false);
                      setCatError(null);
                    }}
                    className="text-slate-500 hover:text-white"
                  >
                    Hủy
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => {
                      setNewCatInput(e.target.value);
                      if (catError) setCatError(null);
                    }}
                    placeholder="VD: Sự nghiệp, Tài chính..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    maxLength={15}
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    disabled={!newCatInput.trim()}
                    className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition"
                  >
                    Lưu
                  </button>
                </div>
                {catError && (
                  <div className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{catError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Tần suất thực hiện</label>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`py-2 rounded-xl border text-center transition ${
                  frequency === 'daily'
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300'
                }`}
              >
                Mỗi ngày
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekdays')}
                className={`py-2 rounded-xl border text-center transition ${
                  frequency === 'weekdays'
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300'
                }`}
              >
                Thứ 2 - 6
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekends')}
                className={`py-2 rounded-xl border text-center transition ${
                  frequency === 'weekends'
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300'
                }`}
              >
                Cuối tuần
              </button>
            </div>
          </div>

          {!habitToEdit && (
            <div>
              <span className="block text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-cyan-400" /> Gợi ý nhanh:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.map((sug) => (
                  <button
                    key={sug.title}
                    type="button"
                    onClick={() => {
                      setTitle(sug.title);
                      // Auto-select corresponding categories if available
                      const matching = sug.cats.filter((c) => availableCategories.includes(c));
                      if (matching.length > 0) setSelectedCategories(matching);
                    }}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-2.5 py-1 rounded-lg transition"
                  >
                    + {sug.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/60">
            {habitToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(habitToEdit.id);
                  onClose();
                }}
                className="px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-5 py-2 text-xs bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 font-bold text-slate-950 rounded-xl transition shadow-lg shadow-cyan-500/20"
              >
                {habitToEdit ? 'Lưu thay đổi' : 'Tạo thói quen'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
