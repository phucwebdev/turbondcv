import React from 'react';
import { VerificationStatus } from '../types';
import CheckIcon from './icons/CheckIcon';
import QuestionIcon from './icons/QuestionIcon';
import WarningIcon from './icons/WarningIcon';

interface BadgeProps {
  status: VerificationStatus;
  text: string;
  tooltip: string;
}

const Badge: React.FC<BadgeProps> = ({ status, text, tooltip }) => {
  const statusConfig = {
    [VerificationStatus.VALID]: {
      bgClass: 'bg-accent-soft border-[var(--accent-border)] text-[var(--primary)]',
      icon: <CheckIcon />,
      label: 'Hợp lệ'
    },
    [VerificationStatus.UNCLEAR]: {
      bgClass: 'bg-[#FFF9E8] border-[#FDE6CE] text-[#B7791F]',
      icon: <QuestionIcon />,
      label: 'Chưa rõ'
    },
    [VerificationStatus.SUSPECT]: {
      bgClass: 'bg-[#FEECEC] border-[#FCA5A5] text-[#B91C1C]',
      icon: <WarningIcon />,
      label: 'Nghi vấn'
    }
  } as const;

  const config = statusConfig[status];

  return (
    <div className="group relative">
      <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm transition-colors ${config.bgClass}`}>
        {React.cloneElement(config.icon, { className: 'w-4 h-4 mr-1.5' })}
        <span>{text}: <strong>{config.label}</strong></span>
      </div>
      <div className="absolute bottom-full mb-2 w-72 p-2 rounded-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none bg-white shadow-soft border border-[var(--line)] text-[var(--text)]">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4" style={{borderTopColor:'var(--line)'}}></div>
      </div>
    </div>
  );
};

export default Badge;