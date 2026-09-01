import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles
} from 'lucide-react';
import type { SlideData, AspectRatioType } from '../../types/postTypes';
import { renderSlideToCanvas } from '../../engine/canvasRenderer';
import { useLanguage } from '../../i18n/LanguageContext';

interface CanvasPreviewProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  aspectRatio: AspectRatioType;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  projectTitle?: string;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  slide,
  slideIndex,
  totalSlides,
  aspectRatio,
  onPrevSlide,
  onNextSlide,
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Canlı Canvas Render Fonksiyonu
  const doRender = useCallback(async () => {
    if (!canvasRef.current || !slide) return;
    setIsRendering(true);
    try {
      await renderSlideToCanvas(canvasRef.current, {
        slide,
        slideIndex,
        totalSlides,
        aspectRatio,
        scaleFactor: 1
      });
    } catch (err) {
      console.warn('Canvas render hatası:', err);
    } finally {
      setIsRendering(false);
    }
  }, [slide, slideIndex, totalSlides, aspectRatio]);

  // Her değişiklikte canvas'ı yeniden çiz
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) doRender();
    }, 15);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [doRender]);

  // Swipe (Dokunarak Sayfa Değiştirme) İşleyicileri
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Yatay kaydırma dikeyden daha baskınsa ve min 45px eşiği geçildiyse
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX > 0 && slideIndex < totalSlides - 1) {
        onNextSlide();
      } else if (diffX < 0 && slideIndex > 0) {
        onPrevSlide();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Ana Canvas Önizleme Sahnesi (Dokunmatik Swipe & Ok Butonları) */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex-1 min-h-[440px] max-h-[640px] rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900 border border-slate-800/80 shadow-2xl flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none cursor-grab active:cursor-grabbing"
      >
        {/* Arka Plan Izgarası / Ambient Işık */}
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Sayfa Göstergesi (Sol Üstte Yüzen Rozet) */}
        {totalSlides > 1 && (
          <div className="absolute top-3 left-3 z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono font-bold text-slate-300 px-2.5 py-1 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>{slideIndex + 1} / {totalSlides}</span>
          </div>
        )}

        {/* Canlı HTML5 Canvas (Kenarları kesilmeden tam görünür) */}
        <div className="relative flex items-center justify-center max-w-full max-h-full">
          <canvas
            ref={canvasRef}
            className="max-h-[520px] max-w-full w-auto h-auto object-contain shadow-2xl block pointer-events-none"
            style={{
              aspectRatio: '1080/1440'
            }}
          />

          {/* Render Oluyor Göstergesi */}
          {isRendering && (
            <div className="absolute top-3 right-3 z-10 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[11px] text-slate-300 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{t('processing')}</span>
            </div>
          )}
        </div>

        {/* Carousel Sol/Sağ Navigasyon Ok Butonları */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrevSlide();
              }}
              disabled={slideIndex === 0}
              className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-950/90 hover:bg-red-600 text-white backdrop-blur-md border border-slate-700 hover:border-red-500 shadow-2xl transition-all active:scale-95 ${
                slideIndex === 0 ? 'opacity-20 cursor-not-allowed pointer-events-none' : 'opacity-85 hover:opacity-100 hover:scale-110'
              }`}
              title={t('prev')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNextSlide();
              }}
              disabled={slideIndex === totalSlides - 1}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-950/90 hover:bg-red-600 text-white backdrop-blur-md border border-slate-700 hover:border-red-500 shadow-2xl transition-all active:scale-95 ${
                slideIndex === totalSlides - 1 ? 'opacity-20 cursor-not-allowed pointer-events-none' : 'opacity-85 hover:opacity-100 hover:scale-110'
              }`}
              title={t('next')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
