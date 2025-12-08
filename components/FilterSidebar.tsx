import React, { useState, useRef, useEffect } from 'react';
import type { FilterState } from '../types';
import { SUBJECTS, SALARY_MIN, SALARY_MAX, SALARY_STEP } from '../constants';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, onApplyFilters, onClearFilters }) => {
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ salary: { ...filters.salary, [name]: Number(value) } });
  };

  const handleSubjectChange = (subject: string) => {
    const newSubjects = filters.subjects.includes(subject)
      ? filters.subjects.filter(s => s !== subject)
      : [...filters.subjects, subject];
    onFilterChange({ subjects: newSubjects });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target as Node)) {
            setIsSubjectDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-200">Bộ lọc</h2>
        <button onClick={onClearFilters} className="text-sm text-blue-400 hover:underline">Xóa lọc</button>
      </div>

      <div className="space-y-6">
        {/* Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Mức lương (VND/giờ)</label>
          <div className="mt-2">
             <input
              type="range"
              min={SALARY_MIN}
              max={SALARY_MAX}
              step={SALARY_STEP}
              value={filters.salary.max}
              onChange={handleSalaryChange}
              name="max"
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{SALARY_MIN.toLocaleString()}</span>
            <span>{filters.salary.max.toLocaleString()}</span>
          </div>
        </div>

        {/* Subjects */}
        <div className="relative" ref={subjectDropdownRef}>
          <label className="block text-sm font-medium text-gray-300 mb-1">Môn học</label>
          <button
            type="button"
            onClick={() => setIsSubjectDropdownOpen(prev => !prev)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white text-left flex justify-between items-center"
            aria-haspopup="listbox"
            aria-expanded={isSubjectDropdownOpen}
          >
            <span className="truncate pr-2">
              {filters.subjects.length > 0 ? filters.subjects.join(', ') : 'Chọn môn học'}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 flex-shrink-0 ${isSubjectDropdownOpen ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {isSubjectDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 space-y-1">
                {SUBJECTS.map(subject => (
                  <label key={subject} className="flex items-center space-x-2 text-sm text-gray-300 p-2 rounded-md hover:bg-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.subjects.includes(subject)}
                      onChange={() => handleSubjectChange(subject)}
                      className="rounded border-gray-500 bg-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    <span>{subject}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
          <button
              onClick={onApplyFilters}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              aria-label="Áp dụng bộ lọc hiện tại"
          >
              Lọc CV
          </button>
      </div>
    </div>
  );
};

export default FilterSidebar;