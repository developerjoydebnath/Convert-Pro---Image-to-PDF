import axios from 'axios';
import { jsPDF } from 'jspdf';
import { FileCheck, LogOut, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConvertButton from '../components/ConvertButton';
import DownloadModal from '../components/DownloadModal';
import ImageGrid from '../components/ImageGrid';
import ImageUploadCard from '../components/ImageUploadCard';
import { useAuth } from '../context/AuthContext';
import type { ImageFile } from '../types';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

export default function ConverterPage() {
  const { user, logout } = useAuth();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalConversions, setTotalConversions] = useState(0);

  useEffect(() => {
    if (user) {
      // Fetch user's total conversions
      axios.get(`${API_URL}/users/${user.id}`, { withCredentials: true })
        .then(res => {
          setTotalConversions(res.data.totalPdfConversions || 0);
        })
        .catch(err => console.error('Failed to fetch conversion count:', err));
    }
  }, [user]);
  const handleImagesAdd = useCallback((newImages: ImageFile[]) => {
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleReorder = useCallback((reorderedImages: ImageFile[]) => {
    setImages(reorderedImages);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
  }, [images]);

  const handleConvertClick = () => {
    setIsModalOpen(true);
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleDownload = async (filename: string) => {
    setIsModalOpen(false);
    setIsConverting(true);

    try {

      // Increment conversion count
      const res = await axios.post(`${API_URL}/users/increment-conversions`, {}, { withCredentials: true });
      setTotalConversions(prev => prev + 1);

      // if status is 401, redirect to login
      if (res.status === 401) {
        logout();
        window.location.href = '/login';
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxWidth = pageWidth - 2 * margin;
      const maxHeight = pageHeight - 2 * margin;

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        if (i > 0) {
          pdf.addPage();
        }

        const img = await loadImage(image.previewUrl);

        let width = img.width;
        let height = img.height;

        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);

        width = width * ratio;
        height = height * ratio;

        const x = margin + (maxWidth - width) / 2;
        const y = margin + (maxHeight - height) / 2;

        pdf.addImage(image.previewUrl, 'JPEG', x, y, width, height);
      }

      pdf.save(`${filename}.pdf`);

      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setImages([]);

      toast.success('PDF generated successfully!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to generate PDF. Please try again.');
      // if status is 401, redirect to login
      if (error?.response?.status === 401) {
        logout();
        window.location.href = '/login';
        return;
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logout successful');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              Image to PDF
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-400 text-sm">
                Welcome, {user?.name}
              </p>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <div className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                <FileCheck className="w-3 h-3" />
                <span>{totalConversions} PDF{totalConversions !== 1 ? 's' : ''} Converted</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Upload Card */}
        <ImageUploadCard onImagesAdd={handleImagesAdd} />

        {/* Image Grid */}
        <ImageGrid
          images={images}
          onReorder={handleReorder}
          onRemove={handleRemove}
        />

        {/* Actions */}
        {images.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleClearAll}
              className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 font-semibold text-lg flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              Clear All
            </button>

            <ConvertButton
              disabled={images.length === 0}
              isConverting={isConverting}
              onClick={handleConvertClick}
              imageCount={images.length}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-gray-500 text-base border-t border-white/10">
        <p>
          Developed by <a className="text-purple-400" href="https://stackrover-landing-v1.vercel.app" target="_blank" rel="noopener noreferrer">StackRover Agency</a>
        </p>
      </footer>

      {/* Download Modal */}
      <DownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDownload}
      />
    </div>
  );
}
