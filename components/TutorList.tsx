import React from 'react';
import type { TutorProfile } from '../types';
import TutorCard from './TutorCard';

interface TutorListProps {
  profiles: TutorProfile[];
  sortOrder: 'default' | 'salary-asc' | 'salary-desc';
  onSortChange: (order: 'default' | 'salary-asc' | 'salary-desc') => void;
  showSort?: boolean;
  activeSubjects?: string[]; // currently selected filter subjects
}

const TutorList: React.FC<TutorListProps> = ({ profiles, sortOrder, onSortChange, showSort = true, activeSubjects = [] }) => {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-800 rounded-lg shadow p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10a.01.01 0 01.01-.01H10a.01.01 0 01.01.01V10a.01.01 0 01-.01.01H10a.01.01 0 01-.01-.01V10z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-200">Không tìm thấy gia sư phù hợp</h3>
        <p className="text-gray-400 mt-2">Vui lòng thử thay đổi bộ lọc hoặc thêm hồ sơ mới.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active subject filters display */}
      {activeSubjects.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2">
          <span className="text-xs font-semibold text-gray-300 tracking-wide">Đang lọc môn:</span>
          {activeSubjects.map((s, i) => (
            <span key={i} className="inline-flex items-center rounded-full bg-blue-600/25 border border-blue-500/40 text-[11px] text-blue-200 px-2 py-1">
              {s}
            </span>
          ))}
        </div>
      )}
      {showSort && (
        <div className="flex justify-end items-center mb-4">
          <label htmlFor="sort-order" className="text-sm font-medium text-gray-400 mr-2">Sắp xếp theo:</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as 'default' | 'salary-asc' | 'salary-desc')}
            className="bg-gray-700 border border-gray-600 rounded-md text-white text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="default">Mặc định</option>
            <option value="salary-asc">Lương tăng dần</option>
            <option value="salary-desc">Lương giảm dần</option>
          </select>
        </div>
      )}
      {profiles.map(profile => (
        <TutorCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
};

export default TutorList;