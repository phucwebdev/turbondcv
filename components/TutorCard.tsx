import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TutorProfile } from '../types';
import { VerificationStatus } from '../types';
import Badge from './Badge';

interface TutorCardProps {
  profile: TutorProfile;
}

const TutorCard: React.FC<TutorCardProps> = ({ profile }) => {
  const [open, setOpen] = useState(false);
  return (
  <div className="bg-card rounded-2xl shadow-soft overflow-hidden transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[var(--line)]">
      {/* Subject badges row */}
      {profile.subjects && profile.subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-4">
          {profile.subjects.map((subj, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-accent-soft border border-[var(--accent-border)] text-[11px] font-medium text-[var(--primary)] px-2 py-1 hover:bg-[#FFEAD7] transition-colors"
              title={subj}
            >
              {subj}
            </span>
          ))}
        </div>
      )}
      <div className="p-5 flex items-start justify-between gap-5">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Avatar */}
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-[var(--accent-border)] flex-shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[#FF9F4D] flex items-center justify-center text-white text-lg font-semibold ring-2 ring-[var(--accent-border)] flex-shrink-0">
              {profile.fullName.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold truncate" style={{color:'var(--text)'}} title={profile.fullName}>{profile.fullName}</h3>
              <Badge status={profile.verification.universityValidity} text="Trường ĐH" tooltip={profile.verification.notes} />
            </div>
            {profile.email && (
              <p className="text-xs mt-0.5 truncate" style={{color:'var(--primary)'}} title={profile.email}>{profile.email}</p>
            )}
            <p className="text-[11px] mt-0.5 truncate flex items-center gap-1" style={{color:'var(--primary)'}} title={profile.phone || 'Chưa có số'}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a2 2 0 011.79 1.106l1.3 2.6a2 2 0 01-.45 2.31l-1.2 1.2a16 16 0 006.9 6.9l1.2-1.2a2 2 0 012.31-.45l2.6 1.3A2 2 0 0121 18.72V21a2 2 0 01-2 2h-.01C9.4 23 1 14.6 1 4.99V5a2 2 0 012-2z" />
              </svg>
              {profile.phone ? (
                <a href={`tel:${profile.phone}`} className="hover:underline" >{profile.phone}</a>
              ) : (
                <span className="italic text-muted">Chưa có số</span>
              )}
            </p>
            <p className="text-xs mt-1 truncate text-muted" title={`${profile.education.degree}, ${profile.education.university}`}>{profile.education.degree}, {profile.education.university}</p>
          </div>
          <div className="mt-2 text-sm flex flex-wrap gap-x-4 gap-y-1" style={{color:'var(--text)'}}>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              {profile.location.district}, {profile.location.city}
            </span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61v5.07L4.03 12.68a1 1 0 00-1.53.86v1.44a1 1 0 001.53.86L9 18.38v-5.07l5.03 2.64a1 1 0 001.53-.86v-1.44a1 1 0 00-1.53-.86L11 14.68v-5.07l6.61-3.48a1 1 0 000-1.84l-7-3z" /></svg>
              <span className="capitalize">{profile.mode}</span>
            </span>
            {profile.salaryPerHour ? (
              <span className="flex items-center gap-1 font-semibold" style={{color:'var(--primary)'}} title="Mức lương mong muốn">
                {profile.salaryPerHour.toLocaleString()} VND/giờ
              </span>
            ) : (
              <span className="italic text-muted">Chưa có lương</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="mt-1 shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md border border-[var(--accent-border)] bg-white text-muted hover:bg-[var(--accent-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/></svg>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="px-5 pb-5 overflow-hidden"
          >
            <div className="pt-2 border-t border-gray-700">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.05 }
                  }
                }}
              >
                <motion.div variants={{ hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } }} className="text-sm" style={{color:'var(--text)'}}>
                  <span className="font-semibold">Môn:</span> {profile.subjects.join(', ')}
                </motion.div>
                {profile.experienceSummary && (
                  <motion.p
                    variants={{ hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } }}
                    className="mt-3 text-sm leading-relaxed whitespace-pre-line" style={{color:'var(--text)'}}
                  >
                    {profile.experienceSummary}
                  </motion.p>
                )}
                {/* Contact Section */}
                {(profile.email || (profile.evidenceUrls && profile.evidenceUrls.length)) && (
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } }}
                    className="mt-4 space-y-1 text-sm" style={{color:'var(--text)'}}
                  >
                    <h4 className="font-semibold" style={{color:'var(--text)'}}>Liên hệ:</h4>
                    {profile.email && (
                      <div className="flex items-center gap-2 text-blue-300 truncate">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <a href={`mailto:${profile.email}`} className="hover:underline" title={profile.email}>{profile.email}</a>
                      </div>
                    )}
                    {profile.evidenceUrls && profile.evidenceUrls.length > 0 && (
                      <EvidenceUrlList urls={profile.evidenceUrls} />
                    )}
                  </motion.div>
                )}
                {profile.awards.length > 0 && (
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } }}
                    className="mt-3"
                  >
                    <h4 className="font-semibold text-sm" style={{color:'var(--text)'}}>Giải thưởng:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1" style={{color:'var(--text)'}}>
                      {profile.awards.map((award, i) => (
                        <li key={i}>{award.name} {award.year && `(${award.year})`}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorCard;

// Sub-component for evidence URLs with truncation and expand behavior
const EvidenceUrlList: React.FC<{ urls: string[] }> = ({ urls }) => {
  const [expanded, setExpanded] = useState(false);
  const MAX_VISIBLE = 3;
  const visible = expanded ? urls : urls.slice(0, MAX_VISIBLE);
  const hiddenCount = urls.length - MAX_VISIBLE;
  return (
    <div className="mt-2">
      <p className="font-semibold text-gray-200 text-xs mb-1">Nguồn dẫn chứng:</p>
      <ul className="space-y-1">
        {visible.map((url, i) => (
          <li key={i} className="text-[11px] text-gray-400 truncate flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M12.586 4.586a2 2 0 010 2.828l-5 5a2 2 0 01-2.828-2.828l5-5a2 2 0 012.828 0z" /><path d="M7.05 9.879l2.122 2.121a2 2 0 002.828 0l2.829-2.828a4 4 0 00-5.657-5.657L6.343 6.05a4 4 0 000 5.657z" /></svg>
            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300" title={url}>{url}</a>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && !expanded && (
        <button onClick={() => setExpanded(true)} className="mt-1 text-[11px] text-blue-400 hover:underline">+{hiddenCount} thêm</button>
      )}
      {expanded && hiddenCount > 0 && (
        <button onClick={() => setExpanded(false)} className="mt-1 text-[11px] text-blue-400 hover:underline">Thu gọn</button>
      )}
    </div>
  );
};