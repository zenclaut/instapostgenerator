import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Archive, 
  Sparkles, 
  Sliders
} from 'lucide-react';
import type { ProjectData } from '../../types/postTypes';
import { generateSlideDataUrl, downloadSingleSlide, exportProjectAsZip, type ExportProgress } from '../../engine/zipExporter';
import { useLanguage } from '../../i18n/LanguageContext';


interface ExportModalProps {
  project: ProjectData;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [scaleFactor, setScaleFactor] = useState<1 | 2>(1);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  // Tüm slaytların önizlemelerini oluştur
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const generateAll = async () => {
      const urls: string[] = [];
      for (let i = 0; i < project.slides.length; i++) {
        try {
          const url = await generateSlideDataUrl(
            project.slides[i],
            i,
            project.slides.length,
            project.aspectRatio,
            scaleFactor
          );
          if (active) urls.push(url);
        } catch (e) {
          console.warn('Önizleme oluşturma hatası:', e);
        }
      }
      if (active) setPreviews(urls);
    };

    generateAll();

    return () => {
      active = false;
    };
  }, [isOpen, project, scaleFactor]);

  if (!isOpen) return null;

  // ZIP İndirme
  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      await exportProjectAsZip(project, scaleFactor, (progress) => {
        setExportProgress(progress);
      });
    } catch (err) {
      console.error('ZIP dışa aktarma hatası:', err);
      alert('ZIP indirilirken bir hata oluştu.');
    } finally {
      setIsExportingZip(false);
      setExportProgress(null);
    }
  };

  // Tekli PNG İndirme
  const handleDownloadSingle = (slideIndex: number) => {
    downloadSingleSlide(
      project.slides[slideIndex],
      slideIndex,
      project.slides.length,
      project.aspectRatio,
      scaleFactor,
      project.title
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Başlığı */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {t('exportGalleryTitle')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('exportGallerySub', {
                  count: project.slides.length,
                  ratio: t('portraitRatio')
                })}
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
                {t('exportQuality')}
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
                  {t('qualityStandard')}
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
                  {t('qualityUltra')}
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
                  ? t('packagingZip', { current: exportProgress?.current ?? 0, total: exportProgress?.total ?? project.slides.length })
                  : t('downloadZip')}
              </span>
            </button>
          </div>

          {/* Sayfalar Galerisi */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {t('generatedPages')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {project.slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="group relative flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg hover:border-red-500/50 transition-all"
                >
                  {/* Sayfa Numarası Rozeti */}
                  <div className="absolute top-2 left-2 z-10 bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                    {t('slideCardBadge', { index: idx + 1 })}
                  </div>

                  {/* Resim Önizlemesi */}
                  <div className="relative aspect-[1080/1440] w-full bg-black flex items-center justify-center overflow-hidden">
                    {previews[idx] ? (
                      <img
                        src={previews[idx]}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        <span>{t('processing')}</span>
                      </div>
                    )}
                  </div>

                  {/* Alt Tekil İndirme Butonu */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {scaleFactor === 1 ? '1080×1440' : '2160×2880'}
                    </span>
                    <button
                      onClick={() => handleDownloadSingle(idx)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
                      title={t('downloadPng')}
                    >
                      <Download className="w-3 h-3" />
                      <span>{t('downloadPng')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
