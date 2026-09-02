import React, { useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Layers, 
  Maximize2, 
  Circle, 
  Square, 
  Sparkles,
  Move,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import type { SlideData, ImageOverlay } from '../../types/postTypes';
import { useLanguage } from '../../i18n/LanguageContext';

interface ImageOverlayManagerProps {
  slide: SlideData;
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string | null) => void;
  onChange: (updates: Partial<SlideData>) => void;
}

export const ImageOverlayManager: React.FC<ImageOverlayManagerProps> = ({
  slide,
  selectedOverlayId,
  onSelectOverlay,
  onChange,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const overlays: ImageOverlay[] = slide.overlays || [];
  const selectedOverlay = overlays.find((o) => o.id === selectedOverlayId) || overlays[0] || null;

  // Yeni Fotoğraf / Çıkartma Yükle
  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const img = new Image();
        img.onload = () => {
          // İdeal başlangıç boyutu hesapla (canvas 1080x1440 üzerinde)
          let initWidth = 400;
          let initHeight = 400;
          const ratio = img.width / img.height;
          if (ratio >= 1) {
            initWidth = 420;
            initHeight = Math.round(420 / ratio);
          } else {
            initHeight = 420;
            initWidth = Math.round(420 * ratio);
          }

          const newOverlay: ImageOverlay = {
            id: `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            imageUrl: event.target?.result as string,
            x: Math.round((1080 - initWidth) / 2),
            y: Math.round((1440 - initHeight) / 2 - 100), // Biraz yukarıda başlasın (metnin üstü)
            width: initWidth,
            height: initHeight,
            rotation: 0,
            borderRadius: 24, // Varsayılan modern hafif yuvarlak köşe
            opacity: 100,
            zIndex: overlays.length + 1,
            shadow: true,
            aspectRatioLocked: true
          };

          const newOverlays = [...overlays, newOverlay];
          onChange({ overlays: newOverlays });
          onSelectOverlay(newOverlay.id);
        };
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Seçili Overlay Güncelle
  const updateOverlay = (id: string, updates: Partial<ImageOverlay>) => {
    const newOverlays = overlays.map((ov) => {
      if (ov.id === id) {
        return { ...ov, ...updates };
      }
      return ov;
    });
    onChange({ overlays: newOverlays });
  };

  // Overlay Sil
  const handleDeleteOverlay = (id: string) => {
    const newOverlays = overlays.filter((ov) => ov.id !== id);
    onChange({ overlays: newOverlays });
    if (selectedOverlayId === id) {
      onSelectOverlay(newOverlays.length > 0 ? newOverlays[newOverlays.length - 1].id : null);
    }
  };

  // Overlay Çoğalt
  const handleDuplicateOverlay = (overlay: ImageOverlay) => {
    const cloned: ImageOverlay = {
      ...overlay,
      id: `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: `${overlay.name || 'Fotoğraf'} (Kopya)`,
      x: Math.min(800, overlay.x + 40),
      y: Math.min(1100, overlay.y + 40),
      zIndex: overlays.length + 1
    };
    const newOverlays = [...overlays, cloned];
    onChange({ overlays: newOverlays });
    onSelectOverlay(cloned.id);
  };

  // Katman Sırası (Öne / Arkaya)
  const handleMoveZIndex = (id: string, direction: 'up' | 'down') => {
    const index = overlays.findIndex((ov) => ov.id === id);
    if (index === -1) return;

    const newOverlays = [...overlays];
    const targetIndex = direction === 'up' ? index + 1 : index - 1;

    if (targetIndex < 0 || targetIndex >= newOverlays.length) return;

    const temp = newOverlays[index];
    newOverlays[index] = newOverlays[targetIndex];
    newOverlays[targetIndex] = temp;

    // Z-indexleri sıralı güncelle
    newOverlays.forEach((ov, idx) => {
      ov.zIndex = idx + 1;
    });

    onChange({ overlays: newOverlays });
  };

  // Merkeze Hizala
  const handleCenter = (id: string) => {
    const target = overlays.find((ov) => ov.id === id);
    if (!target) return;
    updateOverlay(id, {
      x: Math.round((1080 - target.width) / 2),
      y: Math.round((1440 - target.height) / 2 - 80)
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl space-y-4">
      {/* Başlık & Ekle Butonu */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <span>{t('overlaySectionTitle')}</span>
              {overlays.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 font-mono font-bold border border-red-500/40">
                  {overlays.length}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">{t('overlaySectionSub')}</p>
          </div>
        </div>

        {/* Görsel Ekle Butonu */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAddFile}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-md shadow-red-950/60 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addOverlayImage')}</span>
          </button>
        </div>
      </div>

      {/* Eklenen Fotoğraflar Listesi & Seçici */}
      {overlays.length > 0 ? (
        <div className="space-y-3">
          {/* Fotoğraf Küçük Resim Sekmeleri */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            {overlays.map((ov, index) => {
              const isSelected = selectedOverlay?.id === ov.id;
              return (
                <div
                  key={ov.id}
                  onClick={() => onSelectOverlay(ov.id)}
                  className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl border cursor-pointer transition-all flex-shrink-0 select-none ${
                    isSelected
                      ? 'bg-red-950/40 border-red-500/80 text-white shadow-lg shadow-red-950/50'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <img
                    src={ov.imageUrl}
                    alt={ov.name || `Fotoğraf ${index + 1}`}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-700/80 bg-black/40"
                    style={{
                      borderRadius: ov.borderRadius ? `${Math.min(14, (ov.borderRadius / (ov.width || 100)) * 28)}px` : '4px'
                    }}
                  />
                  <span className="text-xs font-medium max-w-[100px] truncate">
                    {ov.name || `Fotoğraf ${index + 1}`}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Seçili Fotoğrafın Detaylı Kontrolleri */}
          {selectedOverlay && (
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-3.5 shadow-inner">
              {/* Seçili Başlık & Hızlı Butonlar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">
                    {selectedOverlay.name || t('selectedOverlay')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCenter(selectedOverlay.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    title={t('centerOverlay')}
                  >
                    <Move className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveZIndex(selectedOverlay.id, 'up')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    title={t('bringForward')}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveZIndex(selectedOverlay.id, 'down')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    title={t('sendBackward')}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicateOverlay(selectedOverlay)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    title={t('duplicateOverlay')}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteOverlay(selectedOverlay.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-400 text-xs transition-colors"
                    title={t('deleteOverlay')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 1. KÖŞE YUVARLAMA KONTROLÜ (Border Radius) */}
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/70">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Circle className="w-3.5 h-3.5 text-red-400" />
                    <span>{t('cornerRadius')}</span>
                  </span>
                  <span className="font-mono text-red-400 font-bold text-[11px]">
                    {selectedOverlay.borderRadius || 0}px
                  </span>
                </div>

                {/* Hızlı Köşe Şekli Önayarları (Presets) */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateOverlay(selectedOverlay.id, { borderRadius: 0 })}
                    className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                      (selectedOverlay.borderRadius || 0) === 0
                        ? 'bg-red-600 text-white border-red-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Square className="w-3 h-3" />
                    <span>{t('cornerSharp')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateOverlay(selectedOverlay.id, { borderRadius: 36 })}
                    className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                      (selectedOverlay.borderRadius || 0) > 0 && (selectedOverlay.borderRadius || 0) < Math.min(selectedOverlay.width, selectedOverlay.height) / 2
                        ? 'bg-red-600 text-white border-red-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{t('cornerSoft')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const maxR = Math.round(Math.min(selectedOverlay.width, selectedOverlay.height) / 2);
                      updateOverlay(selectedOverlay.id, { borderRadius: maxR });
                    }}
                    className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                      (selectedOverlay.borderRadius || 0) >= Math.floor(Math.min(selectedOverlay.width, selectedOverlay.height) / 2) - 2
                        ? 'bg-red-600 text-white border-red-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Circle className="w-3 h-3" />
                    <span>{t('cornerCircle')}</span>
                  </button>
                </div>

                {/* Hassas Yuvarlama Slider'ı */}
                <input
                  type="range"
                  min="0"
                  max={Math.round(Math.min(selectedOverlay.width || 400, selectedOverlay.height || 400) / 2)}
                  step="2"
                  value={selectedOverlay.borderRadius || 0}
                  onChange={(e) => updateOverlay(selectedOverlay.id, { borderRadius: parseInt(e.target.value) })}
                  className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* 2. Boyut, Saydamlık ve Konum Kaydırıcıları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Genişlik / Boyut */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      <span>{t('overlayScale')}</span>
                    </span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {selectedOverlay.width}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1080"
                    step="10"
                    value={selectedOverlay.width}
                    onChange={(e) => {
                      const newW = parseInt(e.target.value);
                      const currentRatio = (selectedOverlay.width || 1) / (selectedOverlay.height || 1);
                      const newH = Math.round(newW / currentRatio);
                      updateOverlay(selectedOverlay.id, { width: newW, height: newH });
                    }}
                    className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Saydamlık (Opacity) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-[11px] text-slate-400">{t('overlayOpacity')}</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {selectedOverlay.opacity ?? 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={selectedOverlay.opacity ?? 100}
                    onChange={(e) => updateOverlay(selectedOverlay.id, { opacity: parseInt(e.target.value) })}
                    className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* X Konumu */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-[11px] text-slate-400">{t('panX')}</span>
                    <span className="font-mono text-slate-300 text-[11px]">{selectedOverlay.x}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="1080"
                    step="5"
                    value={selectedOverlay.x}
                    onChange={(e) => updateOverlay(selectedOverlay.id, { x: parseInt(e.target.value) })}
                    className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Y Konumu */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-[11px] text-slate-400">{t('panY')}</span>
                    <span className="font-mono text-slate-300 text-[11px]">{selectedOverlay.y}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="1440"
                    step="5"
                    value={selectedOverlay.y}
                    onChange={(e) => updateOverlay(selectedOverlay.id, { y: parseInt(e.target.value) })}
                    className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Canlı Önizleme İpucu */}
          <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/30 text-[11px] text-red-300/90 flex items-center gap-2">
            <span>{t('interactiveHelp')}</span>
          </div>
        </div>
      ) : (
        /* Boş Durum */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-slate-700/80 hover:border-red-500/60 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-900/30 hover:bg-slate-900/60 group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800 group-hover:bg-red-600/20 text-slate-400 group-hover:text-red-400 border border-slate-700 flex items-center justify-center mx-auto mb-2 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-300 mb-0.5">
            {t('addOverlayImage')}
          </p>
          <p className="text-[11px] text-slate-500">
            {t('noOverlaysYet')}
          </p>
        </div>
      )}
    </div>
  );
};
