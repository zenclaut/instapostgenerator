import React, { useRef, useEffect, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Download, 
  Check, 
  Smartphone, 
  Square, 
  Sparkles 
} from 'lucide-react';
import type { SlideData, AspectRatioType } from '../../types/postTypes';
import { renderSlideToCanvas } from '../../engine/canvasRenderer';
import { copySlideToClipboard, downloadSingleSlide } from '../../engine/zipExporter';

interface CanvasPreviewProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  aspectRatio: AspectRatioType;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onChangeAspectRatio: (ratio: AspectRatioType) => void;
  projectTitle: string;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  slide,
  slideIndex,
  totalSlides,
  aspectRatio,
  onPrevSlide,
  onNextSlide,
  onChangeAspectRatio,
  projectTitle
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isRendering, setIsRendering] = useState(false);


  // Slide verileri değiştikçe Canvas'ı yeniden render et
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current) return;
      setIsRendering(true);
      try {
        await renderSlideToCanvas(canvasRef.current, {
          slide,
          slideIndex,
          totalSlides,
          aspectRatio,
          scaleFactor: 1 // Önizleme için 1080p standart
        });
      } catch (err) {
        console.error('Canvas render hatası:', err);
      } finally {
        if (!isCancelled) setIsRendering(false);
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [slide, slideIndex, totalSlides, aspectRatio]);

  const handleCopy = async () => {
    const success = await copySlideToClipboard(slide, slideIndex, totalSlides, aspectRatio);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSingleDownload = () => {
    downloadSingleSlide(slide, slideIndex, totalSlides, aspectRatio, 1, projectTitle);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Üst Kontrol & Oran Çubuğu */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex items-center justify-between gap-2 shadow-lg">
        {/* En Boy Oranı Seçici (4:5 Dikey vs 1:1 Kare) */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onChangeAspectRatio('4:5')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              aspectRatio === '4:5'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Dikey (1080×1440)</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeAspectRatio('1:1')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              aspectRatio === '1:1'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1:1 Kare (1080×1080)</span>
          </button>
        </div>

        {/* Hızlı Aksiyonlar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isCopied
                ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="Slaytı panoya kopyalar"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Kopyalandı!' : 'Panoya Kopyala'}</span>
          </button>

          <button
            onClick={handleSingleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            title="Sadece bu sayfayı PNG olarak indir"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Bu Sayfayı İndir</span>
          </button>
        </div>
      </div>

      {/* Ana Canvas Önizleme Sahnesi */}
      <div className="relative flex-1 min-h-[460px] max-h-[680px] rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900 border border-slate-800/80 shadow-2xl flex items-center justify-center p-6 overflow-hidden">
        {/* Arka Plan Izgarası / Ambient Işık */}
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Canlı HTML5 Canvas (Kenarları kesilmeden tam görünür) */}
        <div className="relative flex items-center justify-center max-w-full max-h-full">
          <canvas
            ref={canvasRef}
            className="max-h-[580px] max-w-full w-auto h-auto object-contain shadow-2xl block"
            style={{
              aspectRatio: aspectRatio === '4:5' ? '1080/1440' : '1/1'
            }}
          />

          {/* Render Oluyor Göstergesi */}
          {isRendering && (
            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[11px] text-slate-300 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>İşleniyor...</span>
            </div>
          )}
        </div>

        {/* Carousel Sol/Sağ Navigasyon Butonları */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={onPrevSlide}
              disabled={slideIndex === 0}
              className={`absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/85 hover:bg-red-600 text-white backdrop-blur-md border border-slate-700 hover:border-red-500 shadow-xl transition-all ${
                slideIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:opacity-100 hover:scale-110'
              }`}
              title="Önceki Sayfa"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={onNextSlide}
              disabled={slideIndex === totalSlides - 1}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/85 hover:bg-red-600 text-white backdrop-blur-md border border-slate-700 hover:border-red-500 shadow-xl transition-all ${
                slideIndex === totalSlides - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:opacity-100 hover:scale-110'
              }`}
              title="Sonraki Sayfa"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Önizleme Altı Sayfa Sayacı ve Hızlı Geçiş Çubuğu (Resmin üstünü kapatmaz) */}
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
        <button
          onClick={onPrevSlide}
          disabled={slideIndex === 0}
          className="flex items-center gap-1 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Önceki</span>
        </button>

        <div className="bg-slate-950 px-3 py-1 rounded-full border border-slate-800 font-mono text-xs flex items-center gap-2 text-slate-200 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span>Sayfa {slideIndex + 1} / {totalSlides}</span>
        </div>

        <button
          onClick={onNextSlide}
          disabled={slideIndex === totalSlides - 1}
          className="flex items-center gap-1 hover:text-white disabled:opacity-30 transition-colors"
        >
          <span>Sonraki</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

