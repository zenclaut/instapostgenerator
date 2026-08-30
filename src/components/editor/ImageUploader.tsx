import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, RotateCcw, ZoomIn, Sun, Sliders, Trash2, CheckCircle2 } from 'lucide-react';
import type { SlideData } from '../../types/postTypes';

interface ImageUploaderProps {
  slide: SlideData;
  onChange: (updates: Partial<SlideData>) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ slide, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onChange({
          imageUrl: event.target.result,
          imageScale: 1.0,
          imageOffsetX: 0,
          imageOffsetY: 0
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onChange({
          imageUrl: event.target.result,
          imageScale: 1.0,
          imageOffsetX: 0,
          imageOffsetY: 0
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const resetTransforms = () => {
    onChange({
      imageScale: 1.0,
      imageOffsetX: 0,
      imageOffsetY: 0,
      imageBrightness: 100,
      imageContrast: 100
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Görsel Yükleme & Yerleşim</h3>
            <p className="text-xs text-slate-400">Fotoğrafınızı yükleyin ve kadrajını ayarlayın</p>
          </div>
        </div>

        {slide.imageUrl && (
          <div className="flex items-center gap-2">
            <button
              onClick={resetTransforms}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              title="Kadrajı ve filtreleri sıfırla"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Sıfırla</span>
            </button>
            <button
              onClick={() => onChange({ imageUrl: null })}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-medium transition-colors"
              title="Görseli kaldır"
            >
              <Trash2 className="w-3 h-3" />
              <span>Kaldır</span>
            </button>
          </div>
        )}
      </div>

      {/* Yükleme Alanı */}
      {!slide.imageUrl ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-red-500/70 bg-slate-900/40 hover:bg-red-950/10 rounded-xl p-6 text-center cursor-pointer transition-all duration-200 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-red-600/20 text-slate-400 group-hover:text-red-400 border border-slate-700 group-hover:border-red-500/40 flex items-center justify-center mx-auto mb-3 transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-200 mb-1">
            Fotoğrafınızı buraya sürükleyin veya <span className="text-red-400 underline">gözatın</span>
          </p>
          <p className="text-xs text-slate-500">
            PNG, JPG, WEBP • 1080×1440 veya 1:1 formatında otomatik uyarlanır
          </p>

        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {/* Yüklü Görsel Mini Önizleme & Değiştir Butonu */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={slide.imageUrl}
                alt="Yüklenen Görsel"
                className="w-12 h-12 rounded-lg object-cover border border-slate-700"
              />
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fotoğraf Yüklendi</span>
                </div>
                <p className="text-[11px] text-slate-400">Aşağıdaki kontrollerle kadrajı ayarlayın</p>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              Fotoğrafı Değiştir
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Kadraj ve Zoom Kontrolleri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Zoom / Ölçek */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
                  Zoom (Yakınlaştırma)
                </span>
                <span className="text-slate-400 font-mono">{Math.round(slide.imageScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={slide.imageScale}
                onChange={(e) => onChange({ imageScale: parseFloat(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Dikey Konum (Pan Y) */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Dikey Konum (Yukarı/Aşağı)
                </span>
                <span className="text-slate-400 font-mono">{slide.imageOffsetY}px</span>
              </div>
              <input
                type="range"
                min="-400"
                max="400"
                step="5"
                value={slide.imageOffsetY}
                onChange={(e) => onChange({ imageOffsetY: parseInt(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Yatay Konum (Pan X) */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  Yatay Konum (Sağ/Sol)
                </span>
                <span className="text-slate-400 font-mono">{slide.imageOffsetX}px</span>
              </div>
              <input
                type="range"
                min="-400"
                max="400"
                step="5"
                value={slide.imageOffsetX}
                onChange={(e) => onChange({ imageOffsetX: parseInt(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Parlaklık */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Parlaklık
                </span>
                <span className="text-slate-400 font-mono">{slide.imageBrightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="2"
                value={slide.imageBrightness}
                onChange={(e) => onChange({ imageBrightness: parseInt(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
