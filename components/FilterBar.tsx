import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal, Eraser, UserPlus } from 'lucide-react';
import type { FilterState } from '../types';
import { SUBJECTS, SALARY_MIN, SALARY_MAX, SALARY_STEP } from '../constants';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onSortChange: (order: 'default' | 'salary-asc' | 'salary-desc') => void;
  sortOrder: 'default' | 'salary-asc' | 'salary-desc';
  onAddCvClick: () => void;
  hasProfiles: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onSortChange,
  sortOrder,
  onAddCvClick,
  hasProfiles
}) => {
  const [openSubjects, setOpenSubjects] = useState(false);
  const subjectsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownPosRef = useRef<{ left: number; top: number; width: number } | null>(null);
  const [dropdownMetrics, setDropdownMetrics] = useState<{ left: number; top: number; width: number } | null>(null);
  // Derived state
  const defaultSalaryMin = SALARY_MIN;
  const defaultSalaryMax = SALARY_MAX;
  const activeFilterCount = (
    (filters.subjects.length > 0 ? 1 : 0) +
    (filters.salary.min !== defaultSalaryMin || filters.salary.max !== defaultSalaryMax ? 1 : 0)
  );
  const isDirty = activeFilterCount > 0;

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ salary: { ...filters.salary, [name]: Number(value) } });
  };

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = filters.subjects.includes(subject)
      ? filters.subjects.filter(s => s !== subject)
      : [...filters.subjects, subject];
    onFilterChange({ subjects: newSubjects });
    // Tự động áp dụng lọc sau khi chọn môn để kết quả cập nhật ngay
    // Dùng setTimeout để đảm bảo state filters ở App đã kịp cập nhật trước khi áp dụng
    setTimeout(() => {
      onApplyFilters();
    }, 0);
  };

  // Outside click close & dynamic position recompute
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!openSubjects) return;
      const triggerEl = subjectsRef.current;
      const dropdownEl = dropdownRef.current;
      const target = e.target as Node;
      // If click is inside trigger button area OR inside dropdown portal, ignore
      if (triggerEl && triggerEl.contains(target)) return;
      if (dropdownEl && dropdownEl.contains(target)) return;
      setOpenSubjects(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openSubjects]);

  useEffect(() => {
    const recompute = () => {
      if (subjectsRef.current) {
        const rect = subjectsRef.current.getBoundingClientRect();
        dropdownPosRef.current = { left: rect.left, top: rect.bottom + window.scrollY + 8, width: rect.width };
        setDropdownMetrics(dropdownPosRef.current);
      }
    };
    if (openSubjects) {
      recompute();
      window.addEventListener('scroll', recompute, true);
      window.addEventListener('resize', recompute);
    }
    return () => {
      window.removeEventListener('scroll', recompute, true);
      window.removeEventListener('resize', recompute);
    };
  }, [openSubjects]);

  // Escape key close
  useEffect(() => {
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSubjects(false);
    };
    if (openSubjects) window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, [openSubjects]);

  // Keyboard shortcuts
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      // Apply: Enter or Ctrl+Enter when dirty
      if ((e.key === 'Enter' && (isMeta || document.activeElement && document.activeElement.tagName !== 'BUTTON')) && isDirty) {
        onApplyFilters();
      }
      // Clear: Esc or Ctrl+Backspace when dirty
      if ((e.key === 'Escape' || (isMeta && e.key === 'Backspace')) && isDirty) {
        onClearFilters();
      }
      // Add CV: Ctrl+U
      if (isMeta && (e.key.toLowerCase() === 'u')) {
        onAddCvClick();
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [isDirty, onApplyFilters, onClearFilters, onAddCvClick]);

  return (
    <>
  <div className="w-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 border border-[var(--line)] rounded-2xl px-5 py-4 flex flex-col lg:flex-row gap-6 lg:items-center shadow-soft sticky top-0 z-40 isolation:isolate">
      {/* Salary dual range */}
      <div className="flex flex-col min-w-[230px]">
        <label className="text-xs font-semibold text-muted tracking-wide uppercase flex items-center gap-2">
          <span className="relative group inline-flex items-center">
            <img src="/logo.svg" alt="TutorBond" className="h-5 w-5 rounded-md ring-2 ring-[var(--primary)] bg-white p-[2px] shadow-soft transition-transform group-hover:scale-105" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap bg-white text-[10px] font-medium text-[var(--text)] px-2 py-1 rounded-md shadow-soft border border-[var(--line)]">
              TutorBond
              <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4" style={{borderTopColor:'var(--line)'}}></span>
            </span>
          </span>
          <span>Mức lương (VND/giờ)</span>
        </label>
        <div className="mt-2 flex flex-col gap-2">
          <div className="relative h-6 flex items-center">
            <div className="absolute left-0 right-0 h-1 bg-[var(--accent-soft)] rounded" />
            {/* active range bar */}
            <div
              className="absolute h-1 rounded"
              style={{
                background: 'var(--primary)',
                left: `${((filters.salary.min - SALARY_MIN) / (SALARY_MAX - SALARY_MIN)) * 100}%`,
                right: `${(1 - (filters.salary.max - SALARY_MIN) / (SALARY_MAX - SALARY_MIN)) * 100}%`
              }}
            />
            <input
              type="range"
              min={SALARY_MIN}
              max={SALARY_MAX}
              step={SALARY_STEP}
              name="min"
              value={filters.salary.min}
              onChange={handleSalaryChange}
              className="absolute w-full appearance-none bg-transparent pointer-events-auto"
              style={{ WebkitAppearance: 'none' }}
            />
            <input
              type="range"
              min={SALARY_MIN}
              max={SALARY_MAX}
              step={SALARY_STEP}
              name="max"
              value={filters.salary.max}
              onChange={handleSalaryChange}
              className="absolute w-full appearance-none bg-transparent pointer-events-auto"
              style={{ WebkitAppearance: 'none' }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted">
            <span>{filters.salary.min.toLocaleString()}</span>
            <span>{filters.salary.max.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="relative" ref={subjectsRef}>
  <label className="text-xs font-semibold text-muted tracking-wide uppercase block">Môn học</label>
        <button
          type="button"
          onClick={() => setOpenSubjects(o => !o)}
          className="mt-1 min-w-[180px] max-w-[240px] inline-flex items-center justify-between gap-2 bg-white hover:bg-[var(--accent-soft)] transition-colors text-sm text-[var(--text)] px-3 py-2 rounded-xl border border-[var(--accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          aria-expanded={openSubjects}
          aria-haspopup="listbox"
        >
          <span className="truncate text-left flex-1">{filters.subjects.length ? filters.subjects.join(', ') : 'Chọn môn'}</span>
          <svg className={`h-4 w-4 text-gray-400 transition-transform ${openSubjects ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/></svg>
        </button>
        {openSubjects && dropdownMetrics && createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[70] rounded-2xl border border-[var(--accent-border)] shadow-soft bg-white/95 backdrop-blur-lg p-3 grid grid-cols-2 gap-2 text-sm overflow-y-auto"
            style={{
              top: dropdownMetrics.top,
              left: dropdownMetrics.left,
              width: dropdownMetrics.width,
              maxHeight: '56vh'
            }}
            role="listbox"
            aria-label="Chọn môn học"
          >
            {SUBJECTS.map(s => {
              const active = filters.subjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSubjectToggle(s)}
                  className={`group relative text-xs px-2.5 py-2 rounded-xl border flex items-center justify-between gap-2 transition-colors
                    ${active ? 'bg-accent-soft border-[var(--primary)]/70 text-[var(--primary)] shadow-inner' : 'bg-white border-[var(--accent-border)] text-muted hover:border-[var(--accent-border-hover)] hover:bg-[var(--accent-soft)]'}`}
                  role="option"
                  aria-selected={active}
                >
                  <span className="truncate flex-1 text-left">{s}</span>
                  {active && (
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-500/80 text-white text-[10px] font-bold">✓</span>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
      </div>

      {/* Search removed per request */}

      {/* Sort */}
      <div className="flex flex-col">
  <label className="text-xs font-semibold text-muted uppercase tracking-wide">Sắp xếp</label>
        <select
          value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as 'default' | 'salary-asc' | 'salary-desc')}
          className="mt-1 bg-white border border-[var(--accent-border)] rounded-xl text-[var(--text)] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="default">Mặc định</option>
          <option value="salary-asc">Lương tăng dần</option>
          <option value="salary-desc">Lương giảm dần</option>
        </select>
      </div>

  {/* Actions (icon-only) desktop/tablet */}
  <div className="hidden sm:flex items-end gap-3 ml-auto">
        <div className="flex items-center gap-3">
          {/* Apply / Filter icon button */}
          <button
            type="button"
            onClick={onApplyFilters}
            disabled={!isDirty}
            aria-label="Lọc kết quả"
            title={`Lọc kết quả${isDirty ? '' : ' (không có thay đổi)'}`}
            className={`relative inline-flex items-center justify-center rounded-full border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-0 h-10 w-10
            ${isDirty ? 'border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--primary)] hover:bg-[#FFEAD7]' : 'border-[var(--accent-border)] text-muted hover:bg-[var(--accent-soft)]'}
            disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <SlidersHorizontal size={20} strokeWidth={2} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          {/* Clear icon button */}
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!isDirty}
            aria-label="Xóa bộ lọc"
            title="Xóa bộ lọc"
            className={`inline-flex items-center justify-center rounded-full border h-10 w-10 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] border-[var(--accent-border)] text-muted
              ${isDirty ? 'hover:bg-[var(--accent-soft)]' : ''} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Eraser size={20} strokeWidth={2} />
          </button>
          {/* Add CV icon button */}
          <button
            type="button"
            onClick={onAddCvClick}
            aria-label="Thêm CV mới"
            title="Thêm CV mới"
            className="inline-flex items-center justify-center rounded-full border h-10 w-10 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] border-[var(--accent-border)] text-muted hover:bg-[var(--accent-soft)]"
          >
            <UserPlus size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
  </div>
  {/* Mobile bottom bar */}
  <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-[var(--line)] px-6 py-2 flex justify-between items-center shadow-soft">
      <button
        type="button"
        onClick={onClearFilters}
        disabled={!isDirty}
        aria-label="Xóa bộ lọc"
        title="Xóa bộ lọc (Esc)"
  className={`relative inline-flex items-center justify-center rounded-full border h-11 w-11 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] border-[var(--accent-border)] text-muted ${isDirty ? 'hover:bg-[var(--accent-soft)]' : 'disabled:opacity-40'} disabled:cursor-not-allowed`}
      >
        <Eraser size={22} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={onApplyFilters}
        disabled={!isDirty}
        aria-label="Lọc kết quả"
        title="Lọc kết quả (Enter / Ctrl+Enter)"
  className={`relative inline-flex items-center justify-center rounded-full border h-12 w-12 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${isDirty ? 'border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--primary)] hover:bg-[#FFEAD7]' : 'border-[var(--accent-border)] text-muted'} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <SlidersHorizontal size={22} strokeWidth={2} />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={onAddCvClick}
        aria-label="Thêm CV mới"
        title="Thêm CV mới (Ctrl+U)"
  className="relative inline-flex items-center justify-center rounded-full border h-11 w-11 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] border-[var(--accent-border)] text-muted hover:bg-[var(--accent-soft)]"
      >
        <UserPlus size={22} strokeWidth={2} />
      </button>
    </div>
    </>
  );
};

export default FilterBar;
