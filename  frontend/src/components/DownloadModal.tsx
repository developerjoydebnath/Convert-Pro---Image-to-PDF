import { Download, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filename: string) => void;
}

export default function DownloadModal({ isOpen, onClose, onConfirm }: DownloadModalProps) {
  const [filename, setFilename] = useState('my-document');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilename('my-document');
      // Focus and select input after modal opens
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (filename.trim()) {
      onConfirm(filename.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop fade-in">
      <div className="glass-card w-full max-w-md p-6 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Download PDF</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="filename" className="block text-sm font-medium text-gray-300">
              File Name
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-4 py-3 pr-16 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter file name"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                .pdf
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!filename.trim()}
              className="flex-1 btn-primary px-4 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
