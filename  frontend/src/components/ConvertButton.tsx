import { FileDown, Loader2 } from 'lucide-react';

interface ConvertButtonProps {
  disabled: boolean;
  isConverting: boolean;
  onClick: () => void;
  imageCount: number;
}

export default function ConvertButton({ disabled, isConverting, onClick, imageCount }: ConvertButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isConverting}
      className={`btn-primary px-8 py-4 rounded-2xl text-white font-semibold text-lg flex items-center gap-3 ${
        !disabled && !isConverting ? 'pulse-glow' : ''
      }`}
    >
      {isConverting ? (
        <>
          <Loader2 className="w-6 h-6 spin" />
          <span>Converting...</span>
        </>
      ) : (
        <>
          <FileDown className="w-6 h-6" />
          <span>Convert to PDF</span>
          {imageCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-sm">
              {imageCount} {imageCount === 1 ? 'page' : 'pages'}
            </span>
          )}
        </>
      )}
    </button>
  );
}
