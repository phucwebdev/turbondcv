import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface CvAnalyzerProps {
  onAnalyze: (file: File | File[]) => void;
  isAnalyzing: boolean;
  error: string | null;
  totalProfiles?: number;
  maxProfiles?: number;
}

const CvAnalyzer: React.FC<CvAnalyzerProps> = ({ onAnalyze, isAnalyzing, error, totalProfiles = 0, maxProfiles = 20 }) => {
  const [fileError, setFileError] = useState<string|null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: { errors: { code: string; message: string }[]; file: File }[]) => {
    setFileError(null);
    if (fileRejections.length > 0) {
      setFileError("Chỉ chấp nhận định dạng .docx. Vui lòng lưu lại file dưới dạng DOCX (Word > Save As > .docx).");
      return;
    }
    if (acceptedFiles.length > 0) {
      const allowed = Math.max(0, maxProfiles - totalProfiles);
      if (acceptedFiles.length > allowed) {
        setFileError(`Bạn chọn ${acceptedFiles.length} file, chỉ thêm được ${allowed}. Phần dư bị bỏ qua.`);
      }
      onAnalyze(allowed > 0 ? acceptedFiles.slice(0, allowed) : []);
    }
  }, [onAnalyze]);  

  const limitReached = totalProfiles >= maxProfiles;
  const remainingSlots = Math.max(0, maxProfiles - totalProfiles);
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => onDrop(
      (remainingSlots > 0 ? acceptedFiles.slice(0, remainingSlots) : []) as File[],
      fileRejections as any
    ),
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/octet-stream': ['.docx']
    },
    multiple: true,
    disabled: isAnalyzing || limitReached,
  } as any);
  
  const finalError = error || fileError;

  return (
    <div className="bg-card rounded-2xl shadow-soft p-6 relative overflow-hidden border border-[var(--line)]">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 tracking-wide" style={{color:'var(--text)'}}>
        <img src="/logo.svg" alt="Logo" className="h-9 w-9 rounded-xl ring-2 ring-[var(--accent-border)] bg-white p-1 shadow-soft" />
        <span className="inline-flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-[var(--primary)] mr-3 animate-pulse"></span>
          Phân tích CV mới
        </span>
        <span className={`ml-auto badge-count ${limitReached ? 'opacity-70' : ''}`}>CV: {totalProfiles}/{maxProfiles}{!limitReached && ` (còn ${remainingSlots})`}</span>
      </h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">Chỉ hỗ trợ: <strong>.docx</strong>. Nếu đang ở dạng .doc hoặc PDF, mở bằng Word và dùng "Save As" =&gt; .docx.</p>
      <div
        {...getRootProps()}
        className={`dropzone-base ${isDragActive ? 'dropzone-active' : ''} ${limitReached ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} group`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center" style={{color:'var(--text)'}}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-16 h-16 mb-4 transition-transform duration-300 ${isDragActive ? 'scale-110 text-[var(--primary)]' : 'text-[var(--primary)]/80 group-hover:text-[var(--primary)]'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {limitReached ? (
            <p className="text-sm font-semibold text-error">Đã đạt tối đa {maxProfiles} CV</p>
          ) : isDragActive ? (
            <p className="text-lg font-semibold text-[var(--primary)]">Thả file vào đây...</p>
          ) : (
            <>
              <p className="text-lg font-semibold">Kéo & thả CV (.docx) vào khung</p>
              <p className="text-sm font-medium text-muted mt-1">Có thể thả nhiều file .docx</p>
              <span className="badge-accent mt-3 mb-2">Chỉ nhận .docx</span>
              <p className="text-xs text-muted mb-3">hoặc</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                disabled={isAnalyzing || limitReached}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Chọn file
              </button>
            </>
          )}
        </div>
      </div>

      {finalError && (
        <div className="mt-4 flex items-start gap-3 dropzone-error border rounded-xl-20 p-3 text-sm bg-accent-soft text-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{finalError}</p>
        </div>
      )}

      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
          <svg
            className="animate-spin h-8 w-8 text-[var(--primary)] mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-sm font-medium text-muted">Đang phân tích CV...</span>
        </div>
      )}
      <p className="text-[11px] text-muted text-center mt-5">Kết quả chỉ mang tính hỗ trợ. Hãy kiểm chứng lại thông tin quan trọng.</p>
    </div>
  );
};

// Simple wrapper to avoid tree-shaking issues in some environments.
// It's a common pattern with libraries that attach themselves to the window.
const CvAnalyzerWrapper: React.FC<CvAnalyzerProps> = (props) => {
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return <CvAnalyzer {...props} />;
};

// Using a named export for the dropzone library
export { useDropzone } from 'react-dropzone';
export default CvAnalyzerWrapper;