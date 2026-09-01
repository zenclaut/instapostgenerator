import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  ChevronDown,
  ChevronUp,
  Move,
  RotateCcw
} from 'lucide-react';
import type { SlideData, AspectRatioType, CategoryDefinition } from '../../types/postTypes';
import { renderSlideToCanvas } from '../../engine/canvasRenderer';
import { copySlideToClipboard, downloadSingleSlide } from '../../engine/zipExporter';
import { useLanguage } from '../../i18n/LanguageContext';
import { PRESET_CATEGORIES } from '../../engine/categoryLoader';

interface CanvasPreviewProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  aspectRatio: AspectRatioType;
  categories?: CategoryDefinition[];
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onChangeSlide?: (updates: Partial<SlideData>) => void;
  projectTitle: string;
}

const CLASSIC_COLORS = [
  { name: 'Beyaz', color: '#FFFFFF' },
  { name: 'Kırmızı', color: '#FF5145' },
  { name: 'Pembe', color: '#F6049D' },
  { name: 'Sarı', color: '#FACC15' },
  { name: 'Yeşil', color: '#10B981' },
  { name: 'Mavi', color: '#3B82F6' },
  { name: 'Turuncu', color: '#F97316' },
  { name: 'Mor', color: '#8B5CF6' }
];

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  slide,
  slideIndex,
  totalSlides,
  aspectRatio,
  categories = PRESET_CATEGORIES,
  onPrevSlide,
  onNextSlide,
  onChangeSlide,
  projectTitle
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLiveEditorOpen, setIsLiveEditorOpen] = useState(true);
  const [isPositionOpen, setIsPositionOpen] = useState(false);

  const currentCategory = categories.find((c) => c.id === slide.categoryId) || PRESET_CATEGORIES[0];
  const primaryAccent = currentCategory.fontInfo.colors.find((c) => c.color !== '#FFFFFF')?.color || '#FF5145';

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

  // Canlı editör içeriği senkronizasyonu
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== slide.contentHtml) {
      editorRef.current.innerHTML = slide.contentHtml;
    }
  }, [slide.contentHtml, slide.id]);

  // Panoya Kopyalama
  const handleCopy = async () => {
    if (!slide) return;
    const ok = await copySlideToClipboard(slide, slideIndex, totalSlides, aspectRatio);
    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  // Tek Sayfa İndirme
  const handleSingleDownload = () => {
    if (!slide) return;
    downloadSingleSlide(slide, slideIndex, totalSlides, aspectRatio, 1, projectTitle);
  };

  // Canlı Metin Düzenleme İşleyicileri
  const handleLiveInput = () => {
    if (editorRef.current && onChangeSlide) {
      onChangeSlide({ contentHtml: editorRef.current.innerHTML });
    }
  };

  const applyFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current && onChangeSlide) {
      onChangeSlide({ contentHtml: editorRef.current.innerHTML });
    }
  };

  const handleApplyCategoryHighlight = () => {
    document.execCommand('bold', false);
    document.execCommand('foreColor', false, primaryAccent);
    if (editorRef.current && onChangeSlide) {
      onChangeSlide({ contentHtml: editorRef.current.innerHTML });
    }
  };

  const applyColor = (color: string) => {
    document.execCommand('foreColor', false, color);
    if (editorRef.current && onChangeSlide) {
      onChangeSlide({ contentHtml: editorRef.current.innerHTML });
    }
  };

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
      {/* Üst Kontrol Çubuğu */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex items-center justify-between gap-2 shadow-lg">
        {/* Canlı Editörü Aç / Kapat Butonu */}
        <div>
          {onChangeSlide && (
            <button
              type="button"
              onClick={() => setIsLiveEditorOpen(!isLiveEditorOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isLiveEditorOpen 
                  ? 'bg-red-600/20 border-red-500/40 text-red-300 shadow' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={t('quickTextEditorSub')}
            >
              <Type className="w-3.5 h-3.5" />
              <span>{isLiveEditorOpen ? t('closeQuickEditor') : t('openQuickEditor')}</span>
            </button>
          )}
        </div>

        {/* Hızlı Aksiyonlar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isCopied
                ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title={t('copyToClipboard')}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? t('copied') : t('copyToClipboard')}</span>
          </button>

          <button
            onClick={handleSingleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            title={t('downloadThisSlide')}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('downloadThisSlide')}</span>
          </button>
        </div>
      </div>

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

      {/* CANLI METİN EDİTÖRÜ (Önizleme Üzerinde Hızlı Düzenleme) */}
      {onChangeSlide && isLiveEditorOpen && (
        <div className="glass-panel rounded-2xl p-3.5 border border-red-500/20 shadow-2xl space-y-3 animate-fadeIn bg-slate-950/90 backdrop-blur-xl">
          {/* Başlık ve Kategori Vurgusu */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Type className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{t('quickTextEditor')}</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-red-600/30 text-red-300 px-1.5 py-0.2 rounded">
                    Live
                  </span>
                </h4>
              </div>
            </div>

            {/* 1-Tıkla Kategori Vurgusu */}
            <button
              type="button"
              onClick={handleApplyCategoryHighlight}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white transition-all shadow active:scale-95 border"
              style={{
                backgroundColor: `${primaryAccent}22`,
                borderColor: primaryAccent,
                color: primaryAccent
              }}
              title={t('applyHighlightHint')}
            >
              <Sparkles className="w-3 h-3" />
              <span>{t('applyHighlight', { name: currentCategory.name })}</span>
            </button>
          </div>

          {/* Araç Çubuğu: Bold, Italic, Underline, Hizalama, Punto */}
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
            {/* Metin Formatlama Düğmeleri */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => applyFormat('bold')}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
                title={t('bold')}
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormat('italic')}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
                title={t('italic')}
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormat('underline')}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
                title={t('underline')}
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              <div className="h-3.5 w-[1px] bg-slate-800 mx-1" />

              {/* Hizalama */}
              <button
                type="button"
                onClick={() => onChangeSlide({ textAlign: 'left' })}
                className={`p-1 rounded transition-colors ${
                  slide.textAlign === 'left' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
                title={t('alignLeft')}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeSlide({ textAlign: 'center' })}
                className={`p-1 rounded transition-colors ${
                  slide.textAlign === 'center' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
                title={t('alignCenter')}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeSlide({ textAlign: 'right' })}
                className={`p-1 rounded transition-colors ${
                  slide.textAlign === 'right' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
                title={t('alignRight')}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Gövde Punto Boyutu */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium">{t('fontSize')}:</span>
              <input
                type="range"
                min="20"
                max="42"
                step="1"
                value={slide.fontSize || 29}
                onChange={(e) => onChangeSlide({ fontSize: parseInt(e.target.value) || 29 })}
                className="w-16 accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[11px] font-mono text-slate-300 w-6 text-right">
                {slide.fontSize || 29}px
              </span>
            </div>
          </div>

          {/* Gövde Metni Renk Paleti */}
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
            {/* Kategori Renkleri */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium">
                {currentCategory.name}:
              </span>
              <div className="flex items-center gap-1">
                {currentCategory.fontInfo.colors.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => applyColor(c.color)}
                    className="w-4 h-4 rounded border border-slate-700 shadow hover:scale-110 active:scale-95 transition-transform"
                    style={{ backgroundColor: c.color }}
                    title={`${c.name} (${c.color})`}
                  />
                ))}
              </div>
            </div>

            {/* Klasik Renkler */}
            <div className="flex items-center gap-1">
              {CLASSIC_COLORS.filter(cc => !currentCategory.fontInfo.colors.some(catc => catc.color.toLowerCase() === cc.color.toLowerCase())).slice(0, 5).map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => applyColor(c.color)}
                  className="w-3.5 h-3.5 rounded border border-slate-700 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}

              {/* Özel Renk Seçici */}
              <div className="flex items-center ml-1">
                <label className="cursor-pointer relative flex items-center" title={t('customColor')}>
                  <input
                    type="color"
                    onChange={(e) => applyColor(e.target.value)}
                    className="w-4 h-4 opacity-0 absolute cursor-pointer"
                  />
                  <div className="w-4 h-4 rounded border border-slate-700 flex items-center justify-center hover:scale-110 transition-transform bg-slate-800">
                    <Palette className="w-2.5 h-2.5 text-slate-300" />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Üst Başlık ("SON DAKİKA") Canlı Kontrolleri */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-[10px] text-slate-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                {t('titleOptional')}
              </label>

              {/* Başlık Punto Boyutu */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">{t('titleFontSizeLabel')}:</span>
                <input
                  type="range"
                  min="18"
                  max="64"
                  step="1"
                  value={slide.titleFontSize || 32}
                  onChange={(e) => onChangeSlide({ titleFontSize: parseInt(e.target.value) || 32 })}
                  className="w-16 accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-[11px] font-mono text-slate-300 w-6 text-right">
                  {slide.titleFontSize || 32}px
                </span>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={slide.title}
                onChange={(e) => onChangeSlide({ title: e.target.value })}
                placeholder={t('titlePlaceholder')}
                style={{ color: slide.titleColor || '#FFFFFF' }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-black uppercase tracking-wider focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Başlık Renk Paleti */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-400">{t('titleColorLabel')}:</span>
                {currentCategory.fontInfo.colors.map((c) => {
                  const isSelected = (slide.titleColor || '#FFFFFF').toLowerCase() === c.color.toLowerCase();
                  return (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => onChangeSlide({ titleColor: c.color })}
                      className={`w-4 h-4 rounded border transition-all ${
                        isSelected ? 'ring-2 ring-white scale-110 border-white' : 'border-slate-700 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={`${c.name} (${c.color})`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-1">
                {CLASSIC_COLORS.slice(0, 4).map((c) => {
                  const isSelected = (slide.titleColor || '#FFFFFF').toLowerCase() === c.color.toLowerCase();
                  return (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => onChangeSlide({ titleColor: c.color })}
                      className={`w-3.5 h-3.5 rounded border transition-all ${
                        isSelected ? 'ring-2 ring-white scale-110 border-white' : 'border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  );
                })}

                <label className="cursor-pointer relative flex items-center ml-0.5" title={t('customColor')}>
                  <input
                    type="color"
                    value={(slide.titleColor && slide.titleColor.startsWith('#') && slide.titleColor.length === 7) ? slide.titleColor : '#FFFFFF'}
                    onChange={(e) => onChangeSlide({ titleColor: e.target.value })}
                    className="w-4 h-4 opacity-0 absolute cursor-pointer"
                  />
                  <div 
                    className="w-3.5 h-3.5 rounded border border-slate-700 flex items-center justify-center"
                    style={{ backgroundColor: slide.titleColor || '#FFFFFF' }}
                  >
                    <Palette className="w-2 h-2 text-white drop-shadow" />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Gövde Metni Giriş Alanı (ContentEditable) */}
          <div className="relative">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleLiveInput}
              className="w-full min-h-[90px] max-h-[180px] overflow-y-auto px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
              style={{
                textAlign: slide.textAlign,
                fontFamily: currentCategory.fontInfo.mediumFont
              }}
              data-placeholder={t('contentPlaceholder')}
            />
          </div>

          {/* Metin Konumu (Y ve X Offset Katlanır Alanı) */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsPositionOpen(!isPositionOpen)}
              className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Move className="w-3 h-3 text-blue-400" />
                <span className="text-[11px] font-semibold text-slate-300">{t('textPositioning')}</span>
                {(slide.textOffsetX !== 0 || slide.textOffsetY !== 0) && (
                  <span className="text-[9px] px-1 bg-red-950 text-red-400 rounded font-mono">
                    X:{slide.textOffsetX || 0} Y:{slide.textOffsetY || 0}
                  </span>
                )}
              </div>
              <div className="text-slate-400">
                {isPositionOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </div>
            </button>

            {isPositionOpen && (
              <div className="p-2.5 border-t border-slate-800 space-y-2 bg-slate-950/40">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{t('textOffsetYLabel')}</span>
                      <span className="font-mono text-slate-200">{slide.textOffsetY || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-1000"
                      max="150"
                      step="5"
                      value={slide.textOffsetY || 0}
                      onChange={(e) => onChangeSlide({ textOffsetY: parseInt(e.target.value) })}
                      className="w-full accent-red-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{t('textOffsetXLabel')}</span>
                      <span className="font-mono text-slate-200">{slide.textOffsetX || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-400"
                      max="400"
                      step="5"
                      value={slide.textOffsetX || 0}
                      onChange={(e) => onChangeSlide({ textOffsetX: parseInt(e.target.value) })}
                      className="w-full accent-red-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => onChangeSlide({ textOffsetX: 0, textOffsetY: 0 })}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>{t('resetTextPosition')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

