import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Archive, 
  Check, 
  Sparkles, 
  Copy,
  Sliders
} from 'lucide-react';

import type { ProjectData, SlideData } from '../../types/postTypes';
import { exportProjectAsZip, downloadSingleSlide, renderSlideToDataUrl, copySlideToClipboard } from '../../engine/zipExporter';

interface ExportModalProps {
  project: ProjectData;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, isOpen, onClose }) => {
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Modal açıldığında tüm sayfaların yüksek kaliteli önizleme resimlerini oluştur
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const generateAllPreviews = async () => {
      const urls: string[] = [];
      for (let i = 0; i < project.slides.length; i++) {
        const url = await renderSlideToDataUrl(
          project.slides[i],
          i,
          project.slides.length,
          project.aspectRatio,
          0.8
        );
        urls.push(url);
      }
      if (isMounted) setPreviews(urls);
    };

    generateAllPreviews();

    return () => {
      isMounted = false;
    };
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleExportZip = async () => {
    setIsExportingZip(true);
    setExportProgress({ current: 1, total: project.slides.length });
    try {
      await exportProjectAsZip(project, scaleFactor, (current, total) => {
        setExportProgress({ current, total });
      });
    } catch (err) {
      console.error('ZIP dışa aktarma hatası:', err);
    } finally {
      setIsExportingZip(false);
      setExportProgress(null);
    }
  };

  const handleDownloadSingle = (slide: SlideData, index: number) => {
    downloadSingleSlide(slide, index, project.slides.length, project.aspectRatio, scaleFactor, project.title);
  };

  const handleCopySingle = async (slide: SlideData, index: number) => {
    const ok = await copySlideToClipboard(slide, index, project.slides.length, project.aspectRatio);
    if (ok) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Başlığı */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Dışa Aktarma & İndirme Galerisi
              </h2>
              <p className="text-xs text-slate-400">
                {project.slides.length} Sayfalık Carousel • Instagram {project.aspectRatio === '4:5' ? 'Dikey (1080x1440)' : '1:1 Kare (1080x1080)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orta Alan: Tüm Sayfaların Galeri Grid Görünümü */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Çözünürlük ve Toplu İşlem Çubuğu */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-400" />
                Dışa Aktarma Kalitesi:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setScaleFactor(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    scaleFactor === 1
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Standart (1080×1440)
                </button>
                <button
                  type="button"
                  onClick={() => setScaleFactor(2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    scaleFactor === 2
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ultra HD 2x (2160×2880)
                </button>
              </div>
            </div>

            {/* Toplu ZIP İndirme Butonu */}
            <button
              onClick={handleExportZip}
              disabled={isExportingZip}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-bold shadow-lg shadow-red-950/60 transition-all active:scale-95 disabled:opacity-50"
            >
              <Archive className="w-4 h-4" />
              <span>
                {isExportingZip
                  ? `Paketleniyor... (${exportProgress?.current}/${exportProgress?.total})`
                  : 'Tüm Sayfaları İndir (.ZIP)'}
              </span>
            </button>
          </div>

          {/* Sayfalar Galerisi */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Üretilen Gönderi Sayfaları
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {project.slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="group relative flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg hover:border-red-500/50 transition-all"
                >
                  {/* Sayfa Numarası Rozeti */}
                  <div className="absolute top-2 left-2 z-10 bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                    Sayfa #{idx + 1}
                  </div>

                  {/* Resim Önizlemesi */}
                  <div className="relative aspect-[1080/1440] w-full bg-black flex items-center justify-center overflow-hidden">

                    {previews[idx] ? (
                      <img
                        src={previews[idx]}
                        alt={`Sayfa ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        <span>Render ediliyor...</span>
                      </div>
                    )}
                  </div>

                  {/* Alt İşlem Butonları */}
                  <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopySingle(slide, idx)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-colors ${
                        copiedIndex === idx
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                      }`}
                      title="Panoya Kopyala"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === idx ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadSingle(slide, idx)}
                      className="py-1.5 px-3 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      title="PNG Olarak İndir"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>İndir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Alt Kapatma Çubuğu */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Instagram için ideal formatta yüksek DPI PNG dosyaları hazırlanmıştır.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
