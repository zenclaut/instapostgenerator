import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Trash2,
  Copy,
  Circle,
  Square,
  Move,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import type { SlideData, AspectRatioType, ImageOverlay } from '../../types/postTypes';
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
  selectedOverlayId?: string | null;
  onSelectOverlay?: (id: string | null) => void;
  onUpdateSlide?: (updates: Partial<SlideData>, recordHistory?: boolean) => void;
  onStartTransaction?: () => void;
  onCommitTransaction?: () => void;
}

type DragHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface DragState {
  type: 'move' | 'resize';
  handle?: DragHandleType;
  overlayId: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
  ratio: number;
  origRadius: number;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  slide,
  slideIndex,
  totalSlides,
  aspectRatio,
  onPrevSlide,
  onNextSlide,
  selectedOverlayId = null,
  onSelectOverlay,
  onUpdateSlide,
  onStartTransaction,
  onCommitTransaction
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [canvasDisplaySize, setCanvasDisplaySize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Canlı sürükleme/boyutlandırma durumu
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const overlays = slide.overlays || [];
  const selectedOverlay = overlays.find((ov) => ov.id === selectedOverlayId) || null;

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

  // Canvas boyutlarını takip et (Ekran koordinatı eşleştirmesi için)
  const updateCanvasDisplaySize = useCallback(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasDisplaySize({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  useEffect(() => {
    updateCanvasDisplaySize();
    window.addEventListener('resize', updateCanvasDisplaySize);
    return () => window.removeEventListener('resize', updateCanvasDisplaySize);
  }, [updateCanvasDisplaySize]);

  // Render tamamlandığında da boyutları güncelle
  useEffect(() => {
    const timer = setTimeout(updateCanvasDisplaySize, 50);
    return () => clearTimeout(timer);
  }, [isRendering, updateCanvasDisplaySize]);

  // Swipe (Dokunarak Sayfa Değiştirme) İşleyicileri
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Eğer kullanıcı bir overlay veya handle'a dokunuyorsa swipe'ı tetikleme
    if (dragStateRef.current) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStateRef.current) return;
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

  // Overlay Güncelleme Yardımcısı
  const updateOverlayItem = useCallback((overlayId: string, updates: Partial<ImageOverlay>, recordHistory: boolean = false) => {
    if (!onUpdateSlide) return;
    const newOverlays = (slide.overlays || []).map((ov) => {
      if (ov.id === overlayId) {
        return { ...ov, ...updates };
      }
      return ov;
    });
    onUpdateSlide({ overlays: newOverlays }, recordHistory);
  }, [slide.overlays, onUpdateSlide]);

  // Taşıma (Move) Başlat
  const handleStartMove = (e: React.MouseEvent | React.TouchEvent, overlay: ImageOverlay) => {
    e.stopPropagation();
    onSelectOverlay?.(overlay.id);
    onStartTransaction?.();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragState({
      type: 'move',
      overlayId: overlay.id,
      startX: clientX,
      startY: clientY,
      origX: overlay.x,
      origY: overlay.y,
      origW: overlay.width,
      origH: overlay.height,
      ratio: (overlay.width || 400) / (overlay.height || 400),
      origRadius: overlay.borderRadius || 0
    });
  };

  // Boyutlandırma (Resize) Başlat
  const handleStartResize = (e: React.MouseEvent | React.TouchEvent, overlay: ImageOverlay, handle: DragHandleType) => {
    e.stopPropagation();
    onSelectOverlay?.(overlay.id);
    onStartTransaction?.();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragState({
      type: 'resize',
      handle,
      overlayId: overlay.id,
      startX: clientX,
      startY: clientY,
      origX: overlay.x,
      origY: overlay.y,
      origW: overlay.width,
      origH: overlay.height,
      ratio: (overlay.width || 400) / (overlay.height || 400),
      origRadius: overlay.borderRadius || 0
    });
  };

  // Global MouseMove ve TouchMove (Taşıma ve Boyutlandırma)
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const currentDrag = dragStateRef.current;
      if (!currentDrag || !canvasDisplaySize.width || !canvasDisplaySize.height) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Ekran pikselinden 1080x1440 Canvas koordinatına dönüşüm oranı
      const scaleX = 1080 / canvasDisplaySize.width;
      const scaleY = 1440 / canvasDisplaySize.height;

      const deltaX = (clientX - currentDrag.startX) * scaleX;
      const deltaY = (clientY - currentDrag.startY) * scaleY;

      if (currentDrag.type === 'move') {
        const newX = Math.round(currentDrag.origX + deltaX);
        const newY = Math.round(currentDrag.origY + deltaY);
        updateOverlayItem(currentDrag.overlayId, { x: newX, y: newY }, false);
      } else if (currentDrag.type === 'resize' && currentDrag.handle) {
        const { handle, origX, origY, origW, origH, ratio } = currentDrag;
        let newW = origW;
        let newH = origH;
        let newX = origX;
        let newY = origY;

        if (handle === 'se') {
          newW = Math.max(60, Math.round(origW + deltaX));
          newH = Math.round(newW / ratio);
        } else if (handle === 'sw') {
          newW = Math.max(60, Math.round(origW - deltaX));
          newH = Math.round(newW / ratio);
          newX = Math.round(origX + (origW - newW));
        } else if (handle === 'ne') {
          newW = Math.max(60, Math.round(origW + deltaX));
          newH = Math.round(newW / ratio);
          newY = Math.round(origY + (origH - newH));
        } else if (handle === 'nw') {
          newW = Math.max(60, Math.round(origW - deltaX));
          newH = Math.round(newW / ratio);
          newX = Math.round(origX + (origW - newW));
          newY = Math.round(origY + (origH - newH));
        } else if (handle === 'e') {
          newW = Math.max(60, Math.round(origW + deltaX));
        } else if (handle === 'w') {
          newW = Math.max(60, Math.round(origW - deltaX));
          newX = Math.round(origX + (origW - newW));
        } else if (handle === 's') {
          newH = Math.max(60, Math.round(origH + deltaY));
        } else if (handle === 'n') {
          newH = Math.max(60, Math.round(origH - deltaY));
          newY = Math.round(origY + (origH - newH));
        }

        // Köşe yuvarlama değerini yeni boyut sınırına göre ayarla
        const maxRadius = Math.round(Math.min(newW, newH) / 2);
        const newRadius = Math.min(currentDrag.origRadius, maxRadius);

        updateOverlayItem(
          currentDrag.overlayId,
          {
            x: newX,
            y: newY,
            width: newW,
            height: newH,
            borderRadius: newRadius
          },
          false
        );
      }
    };

    const handlePointerUp = () => {
      if (dragStateRef.current) {
        onCommitTransaction?.();
        setDragState(null);
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: false });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [dragState, canvasDisplaySize, updateOverlayItem, onCommitTransaction]);

  // Hızlı Floating Toolbar İşlemleri
  const handleQuickDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onStartTransaction?.();
    const newOverlays = (slide.overlays || []).filter((ov) => ov.id !== id);
    onUpdateSlide?.({ overlays: newOverlays }, true);
    onSelectOverlay?.(null);
  };

  const handleQuickDuplicate = (e: React.MouseEvent, overlay: ImageOverlay) => {
    e.stopPropagation();
    onStartTransaction?.();
    const cloned: ImageOverlay = {
      ...overlay,
      id: `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: `${overlay.name || 'Fotoğraf'} (Kopya)`,
      x: Math.min(800, overlay.x + 30),
      y: Math.min(1100, overlay.y + 30),
      zIndex: (slide.overlays?.length || 0) + 1
    };
    const newOverlays = [...(slide.overlays || []), cloned];
    onUpdateSlide?.({ overlays: newOverlays }, true);
    onSelectOverlay?.(cloned.id);
  };

  const handleQuickRadius = (e: React.MouseEvent, overlay: ImageOverlay, type: 'sharp' | 'soft' | 'circle') => {
    e.stopPropagation();
    onStartTransaction?.();
    let newRadius = 0;
    if (type === 'soft') newRadius = 36;
    if (type === 'circle') newRadius = Math.round(Math.min(overlay.width, overlay.height) / 2);
    updateOverlayItem(overlay.id, { borderRadius: newRadius }, true);
  };

  const handleQuickCenter = (e: React.MouseEvent, overlay: ImageOverlay) => {
    e.stopPropagation();
    onStartTransaction?.();
    updateOverlayItem(overlay.id, {
      x: Math.round((1080 - overlay.width) / 2),
      y: Math.round((1440 - overlay.height) / 2 - 80)
    }, true);
  };

  const handleQuickZIndex = (e: React.MouseEvent, id: string, direction: 'up' | 'down') => {
    e.stopPropagation();
    onStartTransaction?.();
    const currentOverlays = [...(slide.overlays || [])];
    const idx = currentOverlays.findIndex((ov) => ov.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= currentOverlays.length) return;

    const temp = currentOverlays[idx];
    currentOverlays[idx] = currentOverlays[targetIdx];
    currentOverlays[targetIdx] = temp;

    currentOverlays.forEach((ov, i) => {
      ov.zIndex = i + 1;
    });

    onUpdateSlide?.({ overlays: currentOverlays }, true);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Ana Canvas Önizleme Sahnesi */}
      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (!dragState) onSelectOverlay?.(null);
        }}
        className="relative flex-1 min-h-[440px] max-h-[640px] rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900 border border-slate-800/80 shadow-2xl flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none cursor-default"
      >
        {/* Arka Plan Izgarası / Ambient Işık */}
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Sayfa Göstergesi */}
        {totalSlides > 1 && (
          <div className="absolute top-3 left-3 z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono font-bold text-slate-300 px-2.5 py-1 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>{slideIndex + 1} / {totalSlides}</span>
          </div>
        )}

        {/* Canlı HTML5 Canvas + İnteraktif Katman Sarmalayıcı */}
        <div className="relative flex items-center justify-center max-w-full max-h-full">
          <canvas
            ref={canvasRef}
            className="max-h-[520px] max-w-full w-auto h-auto object-contain shadow-2xl block pointer-events-none"
            style={{
              aspectRatio: '1080/1440'
            }}
          />

          {/* İNTERAKTİF CANVAS ÜSTÜ SEÇİM & SÜRÜKLEME KATMANI */}
          {canvasDisplaySize.width > 0 && canvasDisplaySize.height > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                width: canvasDisplaySize.width,
                height: canvasDisplaySize.height
              }}
            >
              {overlays.map((ov) => {
                const isSelected = selectedOverlay?.id === ov.id;
                const scaleFactorX = canvasDisplaySize.width / 1080;
                const scaleFactorY = canvasDisplaySize.height / 1440;

                const displayLeft = (ov.x || 0) * scaleFactorX;
                const displayTop = (ov.y || 0) * scaleFactorY;
                const displayWidth = (ov.width || 400) * scaleFactorX;
                const displayHeight = (ov.height || 400) * scaleFactorY;
                const displayRadius = ((ov.borderRadius || 0) / (ov.width || 400)) * displayWidth;

                return (
                  <div
                    key={ov.id}
                    onMouseDown={(e) => handleStartMove(e, ov)}
                    onTouchStart={(e) => handleStartMove(e, ov)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOverlay?.(ov.id);
                    }}
                    className={`absolute pointer-events-auto transition-shadow ${
                      isSelected
                        ? 'ring-2 ring-red-500 shadow-2xl shadow-red-950/80 cursor-move z-30'
                        : 'hover:ring-1 hover:ring-red-400/50 cursor-pointer z-20'
                    }`}
                    style={{
                      left: `${displayLeft}px`,
                      top: `${displayTop}px`,
                      width: `${displayWidth}px`,
                      height: `${displayHeight}px`,
                      borderRadius: `${displayRadius}px`
                    }}
                  >
                    {/* SEÇİLİ OVERLAY: 8 BOYUTLANDIRMA TUTAMACI (RESIZE HANDLES) */}
                    {isSelected && (
                      <>
                        {/* 4 Köşe Tutamaçları */}
                        <div
                          onMouseDown={(e) => handleStartResize(e, ov, 'nw')}
                          onTouchStart={(e) => handleStartResize(e, ov, 'nw')}
                          className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-red-600 rounded-full shadow-md cursor-nwse-resize z-40 hover:scale-125 transition-transform"
                        />
                        <div
                          onMouseDown={(e) => handleStartResize(e, ov, 'ne')}
                          onTouchStart={(e) => handleStartResize(e, ov, 'ne')}
                          className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-red-600 rounded-full shadow-md cursor-nesw-resize z-40 hover:scale-125 transition-transform"
                        />
                        <div
                          onMouseDown={(e) => handleStartResize(e, ov, 'sw')}
                          onTouchStart={(e) => handleStartResize(e, ov, 'sw')}
                          className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-red-600 rounded-full shadow-md cursor-nesw-resize z-40 hover:scale-125 transition-transform"
                        />
                        <div
                          onMouseDown={(e) => handleStartResize(e, ov, 'se')}
                          onTouchStart={(e) => handleStartResize(e, ov, 'se')}
                          className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-red-600 rounded-full shadow-md cursor-nwse-resize z-40 hover:scale-125 transition-transform"
                        />

                        {/* 4 Kenar Orta Tutamaçları */}
                        <div
                          onMouseDown={(e) => handleStartResize(e, ov, 'n')}
                          onTouchStart={(e) => handleStartResize(e, ov, 'n')}
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-red-600 rounded-sm shadow-md cursor-ns-resize z-40 hover:scale-125 transition-transform"
                        />
                        <div
                          onMouseDown={(e) => handleStartResize(e, ov, 's')}
                          onTouchStart={(e) => handleStartResize(e, ov, 's')}
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-red-600 rounded-sm shadow-md cursor-ns-resize z-40 hover:scale-125 transition-transform"
                        />
                        <div
                          onMouseDown={(e) => handleStartResize(e, ov, 'w')}
                          onTouchStart={(e) => handleStartResize(e, ov, 'w')}
                          className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-red-600 rounded-sm shadow-md cursor-ew-resize z-40 hover:scale-125 transition-transform"
                        />
                        <div
                          onMouseDown={(e) => handleStartResize(e, ov, 'e')}
                          onTouchStart={(e) => handleStartResize(e, ov, 'e')}
                          className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-red-600 rounded-sm shadow-md cursor-ew-resize z-40 hover:scale-125 transition-transform"
                        />

                        {/* CANLI FLOATING MINI TOOLBAR (Fotoğrafın hemen üstünde/altında yüzen araçlar) */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 bg-slate-950/95 backdrop-blur-xl border border-slate-700/90 rounded-xl shadow-2xl text-white pointer-events-auto ${
                            displayTop > 45 ? '-top-11' : '-bottom-11'
                          }`}
                        >
                          {/* Keskin Köşe */}
                          <button
                            type="button"
                            onClick={(e) => handleQuickRadius(e, ov, 'sharp')}
                            className={`p-1 rounded-lg text-xs font-semibold transition-colors ${
                              (ov.borderRadius || 0) === 0 ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                            title={t('cornerSharp')}
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>

                          {/* Yumuşak Yuvarlak */}
                          <button
                            type="button"
                            onClick={(e) => handleQuickRadius(e, ov, 'soft')}
                            className={`p-1 rounded-lg text-xs font-semibold transition-colors ${
                              (ov.borderRadius || 0) > 0 && (ov.borderRadius || 0) < Math.min(ov.width, ov.height) / 2
                                ? 'bg-red-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                            title={t('cornerSoft')}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          {/* Tam Daire */}
                          <button
                            type="button"
                            onClick={(e) => handleQuickRadius(e, ov, 'circle')}
                            className={`p-1 rounded-lg text-xs font-semibold transition-colors ${
                              (ov.borderRadius || 0) >= Math.floor(Math.min(ov.width, ov.height) / 2) - 2
                                ? 'bg-red-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                            title={t('cornerCircle')}
                          >
                            <Circle className="w-3.5 h-3.5" />
                          </button>

                          <div className="w-px h-3.5 bg-slate-800 my-auto" />

                          {/* Merkeze Hizala */}
                          <button
                            type="button"
                            onClick={(e) => handleQuickCenter(e, ov)}
                            className="p-1 rounded-lg text-slate-300 hover:bg-slate-800 text-xs transition-colors"
                            title={t('centerOverlay')}
                          >
                            <Move className="w-3.5 h-3.5" />
                          </button>

                          {/* Öne / Arkaya */}
                          <button
                            type="button"
                            onClick={(e) => handleQuickZIndex(e, ov.id, 'up')}
                            className="p-1 rounded-lg text-slate-300 hover:bg-slate-800 text-xs transition-colors"
                            title={t('bringForward')}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickZIndex(e, ov.id, 'down')}
                            className="p-1 rounded-lg text-slate-300 hover:bg-slate-800 text-xs transition-colors"
                            title={t('sendBackward')}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <div className="w-px h-3.5 bg-slate-800 my-auto" />

                          {/* Çoğalt */}
                          <button
                            type="button"
                            onClick={(e) => handleQuickDuplicate(e, ov)}
                            className="p-1 rounded-lg text-slate-300 hover:bg-slate-800 text-xs transition-colors"
                            title={t('duplicateOverlay')}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Sil */}
                          <button
                            type="button"
                            onClick={(e) => handleQuickDelete(e, ov.id)}
                            className="p-1 rounded-lg text-red-400 hover:bg-red-950/60 hover:text-red-300 text-xs transition-colors"
                            title={t('deleteOverlay')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

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

