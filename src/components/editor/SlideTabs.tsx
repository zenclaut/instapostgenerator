import React from 'react';
import { Plus, Copy, Trash2, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import type { SlideData } from '../../types/postTypes';

interface SlideTabsProps {
  slides: SlideData[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: (categoryId?: string) => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
}

export const SlideTabs: React.FC<SlideTabsProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide
}) => {
  const currentSlide = slides[activeSlideIndex] || slides[0];

  return (
    <div className="glass-panel rounded-2xl p-3 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Carousel Sayfaları
            </h3>
            <p className="text-xs text-slate-400">
              {slides.length} Sayfa • Aktif: #{activeSlideIndex + 1}
            </p>
          </div>
        </div>

        {/* Sayfa Ekleme Butonu */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddSlide(currentSlide?.categoryId || 'haberler')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all active:scale-95"
            title="Yeni Sayfa Ekle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Sayfa Ekle</span>
          </button>
        </div>
      </div>

      {/* Sayfa Thumbnail / Sekme Listesi */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {slides.map((slide, index) => {
          const isActive = index === activeSlideIndex;
          const activeLayersCount = slide.layers.filter((l) => l.enabled).length;

          return (
            <div
              key={slide.id}
              className={`group relative flex-shrink-0 flex flex-col items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-red-950/40 to-slate-900 border-2 border-red-500 shadow-lg shadow-red-950/50'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
              style={{ width: '112px', minHeight: '102px' }}
              onClick={() => onSelectSlide(index)}
            >
              {/* Sayfa Numarası ve Kategori Rozeti */}
              <div className="w-full flex items-center justify-between text-[10px] mb-1">
                <span className={`font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  #{index + 1}
                </span>
                <span className="text-[9px] font-semibold text-slate-300 uppercase truncate max-w-[55px]">
                  {slide.categoryId}
                </span>
              </div>

              {/* Küçük Görsel / Katman Durumu */}
              <div className="w-full h-12 rounded bg-slate-950/80 border border-slate-800 overflow-hidden relative flex items-center justify-center">
                {slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={`Sayfa ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-[10px] text-slate-400 flex flex-col items-center">
                    <span>{activeLayersCount} Katman</span>
                  </div>
                )}
              </div>

              {/* Hızlı İşlem Düğmeleri */}
              <div className="w-full flex items-center justify-between mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-0.5">
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSlide(index, index - 1);
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                      title="Sola Taşı"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  )}
                  {index < slides.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSlide(index, index + 1);
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                      title="Sağa Taşı"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSlide(index);
                    }}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                    title="Sayfayı Çoğalt"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(index);
                      }}
                      className="p-1 hover:bg-red-950/60 rounded text-slate-500 hover:text-red-400"
                      title="Sayfayı Sil"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
