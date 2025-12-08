import React, { useState, useEffect, useCallback } from 'react';
import type { TutorProfile, FilterState } from './types';
import { VerificationStatus } from './types';
import { SALARY_MIN, SALARY_MAX, SUBJECTS } from './constants';
import FilterSidebar from './components/FilterSidebar';
import CvAnalyzer from './components/CvAnalyzer';
import TutorList from './components/TutorList';
import FilterBar from './components/FilterBar';
import { analyzeCvWithGemini } from './services/geminiService';

declare global {
    interface Window {
        mammoth: any;
        pdfjsLib: any;
    }
}

const App: React.FC = () => {
  const [tutorProfiles, setTutorProfiles] = useState<TutorProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<TutorProfile[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    salary: { min: SALARY_MIN, max: SALARY_MAX },
    subjects: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [activeSidebarTab, setActiveSidebarTab] = useState<'filter' | 'analyzer'>('filter'); // removed sidebar tabs in new horizontal layout
  const [sortOrder, setSortOrder] = useState<'default' | 'salary-asc' | 'salary-desc'>('default');
  const MAX_PROFILES = 20;

  // Helper: normalize subjects (remove diacritics, lower-case, collapse spaces)
  const normalizeSubject = (s: string) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // remove diacritics (Unicode property)
    .replace(/[\u0300-\u036f]/g, '') // fallback for older browsers
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();

  // Map a raw subject to canonical SUBJECTS item if possible
  const canonicalizeSubject = (raw: string) => {
    const norm = normalizeSubject(raw);
    const found = SUBJECTS.find(base => normalizeSubject(base) === norm);
    return found || raw; // fallback to original if not matched
  };


  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    let result = [...tutorProfiles];

    // Salary filter
    result = result.filter(p => p.salaryPerHour !== null && p.salaryPerHour >= filters.salary.min && p.salaryPerHour <= filters.salary.max);

    // Subjects filter
    if (filters.subjects.length > 0) {
      const selectedNorms = filters.subjects.map(normalizeSubject);
      result = result.filter(p =>
        p.subjects.some(profileSubject => {
          const pNorm = normalizeSubject(profileSubject);
          return selectedNorms.some(fNorm => pNorm === fNorm || pNorm.includes(fNorm) || fNorm.includes(pNorm));
        })
      );
    }
    // Search removed per request

    // Default sorting
    result.sort((a, b) => {
        const scoreA = (a.verification.awardValidity === VerificationStatus.VALID ? 2 : a.verification.awardValidity === VerificationStatus.UNCLEAR ? 1 : 0) + 
                       (a.verification.universityValidity === VerificationStatus.VALID ? 2 : a.verification.universityValidity === VerificationStatus.UNCLEAR ? 1 : 0);
        const scoreB = (b.verification.awardValidity === VerificationStatus.VALID ? 2 : b.verification.awardValidity === VerificationStatus.UNCLEAR ? 1 : 0) +
                       (b.verification.universityValidity === VerificationStatus.VALID ? 2 : b.verification.universityValidity === VerificationStatus.UNCLEAR ? 1 : 0);
        return scoreB - scoreA;
    });

    setFilteredProfiles(result);
  }, [filters, tutorProfiles]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      salary: { min: SALARY_MIN, max: SALARY_MAX },
      subjects: []
    });
    setFilteredProfiles(tutorProfiles);
  }, [tutorProfiles]);
  
  const extractTextFromPdf = async (arrayBuffer: ArrayBuffer): Promise<string> => {
      if (!window.pdfjsLib) {
        throw new Error("PDF.js library is not loaded.");
      }
      const PDFJS_VERSION = '3.11.174';
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pagePromises = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        pagePromises.push(
          pdf.getPage(i).then(async (page: any) => {
            const textContent = await page.getTextContent();
            return textContent.items.map((item: any) => item.str).join(' ');
          })
        );
      }
      const pageTexts = await Promise.all(pagePromises);
      return pageTexts.join('\n\n');
  };

  const handleFileAnalyze = async (fileOrFiles: File | File[]) => {
    const files: File[] = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    const remainingSlots = MAX_PROFILES - tutorProfiles.length;
    if (remainingSlots <= 0) {
      setError(`Đã đạt tối đa ${MAX_PROFILES} CV. Vui lòng xóa bớt để phân tích thêm.`);
      return;
    }
    const toProcess = files.slice(0, remainingSlots);
    setIsAnalyzing(true);
    setError(null);
    for (const file of toProcess) {
      try {
        const cvText = await new Promise<string>(async (resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            if (!arrayBuffer) {
              return reject(new Error('Không đọc được nội dung file.'));
            }
            try {
              let text = '';
              const lowerName = file.name.toLowerCase();
              const mime = file.type;
              const isDocx = mime.includes('officedocument.wordprocessingml') || lowerName.endsWith('.docx') || (mime === 'application/octet-stream' && lowerName.endsWith('.docx'));
              if (isDocx) {
                if (!window.mammoth) {
                  return reject(new Error('Thư viện đọc Word (mammoth) chưa tải.')); 
                }
                // Use convertToHtml to access embedded images
                try {
                  const htmlResult = await window.mammoth.convertToHtml({ arrayBuffer }, {
                    convertImage: window.mammoth.images.inline(function(element: any) {
                      return element.read("base64").then(function(imageBuffer: string) {
                        return { src: `data:${element.contentType};base64,${imageBuffer}` };
                      });
                    })
                  });
                  // Extract text by removing tags
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = htmlResult.value;
                  const images = Array.from(tempDiv.querySelectorAll('img')) as HTMLImageElement[];
                  const firstImage = images[0]?.src;
                  const rawText = tempDiv.textContent || '';
                  // Store avatar candidate on file object via symbol or map (simpler: attach property)
                  (file as any)._extractedAvatar = firstImage;
                  resolve(rawText);
                } catch (htmlErr) {
                  // Fallback to raw text if HTML extraction fails
                  const result = window.mammoth.extractRawText({ arrayBuffer });
                  result.then((r: any) => {
                    resolve(r.value);
                  }).catch((e: any) => reject(e));
                }
                return;
              }
              reject(new Error('Định dạng không hỗ trợ. Chỉ nhận .docx. Vui lòng lưu lại file dưới dạng DOCX mới.'));
            } catch (e) {
              reject(e as Error);
            }
          };
          reader.onerror = () => reject(new Error('Không thể đọc file (FileReader lỗi).'));
          reader.readAsArrayBuffer(file);
        });

        if (!cvText.trim()) {
          throw new Error('Không trích xuất được nội dung hoặc file trống.');
        }
  const newProfile = await analyzeCvWithGemini(cvText);
  // Attach avatar from doc/docx if extracted
  const avatarCandidate = (file as any)._extractedAvatar as string | undefined;
  if (avatarCandidate && !newProfile.avatarUrl) {
    newProfile.avatarUrl = avatarCandidate;
  }
  // Canonicalize and deduplicate subjects
  const canonicalSubjects = Array.from(new Set(newProfile.subjects.map(canonicalizeSubject)));
  newProfile.subjects = canonicalSubjects;
  setTutorProfiles(prev => [newProfile, ...prev].slice(0, MAX_PROFILES));
      } catch (err) {
        console.error('Analysis failed:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định trong quá trình phân tích.');
      }
    }
    setIsAnalyzing(false);
  };

  // When the master list of tutors changes (e.g., a new CV is added),
  // reset the filtered list to show all tutors. The user can then re-apply filters.
  useEffect(() => {
    setFilteredProfiles(tutorProfiles);
  }, [tutorProfiles]);

  // Instantly re-sort the visible list when the sort order changes.
  useEffect(() => {
    setFilteredProfiles(currentProfiles => {
      const sorted = [...currentProfiles];
      if (sortOrder === 'salary-asc') {
        sorted.sort((a, b) => {
          if (a.salaryPerHour === b.salaryPerHour) return 0;
          if (a.salaryPerHour === null) return 1;
          if (b.salaryPerHour === null) return -1;
          return a.salaryPerHour - b.salaryPerHour;
        });
      } else if (sortOrder === 'salary-desc') {
        sorted.sort((a, b) => {
          if (a.salaryPerHour === b.salaryPerHour) return 0;
          if (a.salaryPerHour === null) return 1;
          if (b.salaryPerHour === null) return -1;
          return b.salaryPerHour - a.salaryPerHour;
        });
      } else { // 'default'
        sorted.sort((a, b) => {
          const scoreA = (a.verification.awardValidity === VerificationStatus.VALID ? 2 : a.verification.awardValidity === VerificationStatus.UNCLEAR ? 1 : 0) +
            (a.verification.universityValidity === VerificationStatus.VALID ? 2 : a.verification.universityValidity === VerificationStatus.UNCLEAR ? 1 : 0);
          const scoreB = (b.verification.awardValidity === VerificationStatus.VALID ? 2 : b.verification.awardValidity === VerificationStatus.UNCLEAR ? 1 : 0) +
            (b.verification.universityValidity === VerificationStatus.VALID ? 2 : b.verification.universityValidity === VerificationStatus.UNCLEAR ? 1 : 0);
          return scoreB - scoreA;
        });
      }
      return sorted;
    });
  }, [sortOrder]);


  const hasProfiles = tutorProfiles.length > 0;
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleAddCvClick = () => {
    // open hidden file input that forwards to existing analyzer flow (reuse CvAnalyzer logic simplified here)
    fileInputRef.current?.click();
  };

  const handleDirectFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      handleFileAnalyze(Array.from(files));
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen font-sans">
        
      {!hasProfiles && (
  <div className="mx-auto px-4 md:px-6 py-6 flex justify-center items-center max-w-5xl" style={{minHeight: 'calc(100vh - 40px)'}}>
          <div className="w-full max-w-2xl">
            <CvAnalyzer onAnalyze={handleFileAnalyze} isAnalyzing={isAnalyzing} error={error} totalProfiles={tutorProfiles.length} maxProfiles={MAX_PROFILES} />
          </div>
        </div>
      )}

      {hasProfiles && (
        <div className="mx-auto px-4 md:px-6 py-6 space-y-6 max-w-6xl">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            onAddCvClick={handleAddCvClick}
            hasProfiles={hasProfiles}
          />
          {error && (
            <div className="bg-accent-soft border border-[var(--error-border)] text-error text-sm px-4 py-2 rounded-xl-20">
              {error}
            </div>
          )}
          <TutorList
            profiles={filteredProfiles}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            showSort={false}
            activeSubjects={filters.subjects}
          />
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleDirectFileSelect}
      />
    </div>
  );
};

export default App;