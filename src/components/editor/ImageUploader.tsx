import React, { useRef } from 'react';
import { 
  Upload, 
  RotateCcw, 
  Trash2, 
  Crop
} from 'lucide-react';
import type { SlideData } from '../../types/postTypes';
import { useLanguage } from '../../i18n/LanguageContext';

interface ImageUploaderProps {
  slide: SlideData;
  onChange: (updates: Partial<SlideData>) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ slide, onChange }) => {
  const { t } = useLanguage();
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
          imageOffsetY: 0,
          imageBrightness: 100,
          imageContrast: 100
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onChange({
      imageUrl: null,
      imageScale: 1.0,
      imageOffsetX: 0,
      imageOffsetY: 0
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetFraming = () => {
    onChange({
      imageScale: 1.0,
      imageOffsetX: 0,
      imageOffsetY: 0,
      imageBrightness: 100,
      imageContrast: 100
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          onChange({
            imageUrl: event.target.result,
            imageScale: 1.0,
            imageOffsetX: 0,
            imageOffsetY: 0,
            imageBrightness: 100,
            imageContrast: 100
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Crop className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{t('imageUploadFraming')}</h3>
            <p className="text-xs text-slate-400">{t('imageUploadSub')}</p>
          </div>
        </div>
      </div>

      {!slide.imageUrl ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-red-500/60 rounded-xl p-6 text-center cursor-pointer transition-all duration-200 bg-slate-900/40 hover:bg-slate-900/80 group"
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
            {t('dragDropText')} <span className="text-red-400 underline">{t('browse')}</span>
          </p>
          <p className="text-xs text-slate-500">
            {t('formatHint')}
          </p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {/* Yüklü Görsel Mini Önizleme & Değiştir Butonu */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={slide.imageUrl}
                alt={t('uploadedImage')}
                className="w-12 h-12 rounded-lg object-cover border border-slate-700"
              />
              <div>
                <span className="text-xs font-semibold text-slate-200">{t('uploadedImage')}</span>
                <p className="text-[11px] text-slate-400">{t('reframeSub')}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              >
                {t('changeImage')}
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-400 text-xs transition-colors"
                title={t('removeImage')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Kadrajlama ve Filtre Ayarları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Zoom / Scale */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="text-[11px] text-slate-400">{t('zoomScale')}</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {Math.round(slide.imageScale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={slide.imageScale}
                onChange={(e) => onChange({ imageScale: parseFloat(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Pan X */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="text-[11px] text-slate-400">{t('panX')}</span>
                <span className="font-mono text-slate-300 text-[11px]">{slide.imageOffsetX}px</span>
              </div>
              <input
                type="range"
                min="-600"
                max="600"
                step="5"
                value={slide.imageOffsetX}
                onChange={(e) => onChange({ imageOffsetX: parseInt(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Pan Y */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="text-[11px] text-slate-400">{t('panY')}</span>
                <span className="font-mono text-slate-300 text-[11px]">{slide.imageOffsetY}px</span>
              </div>
              <input
                type="range"
                min="-600"
                max="600"
                step="5"
                value={slide.imageOffsetY}
                onChange={(e) => onChange({ imageOffsetY: parseInt(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Parlaklık (Brightness) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="text-[11px] text-slate-400">{t('brightness')}</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {slide.imageBrightness ?? 100}%
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                step="2"
                value={slide.imageBrightness ?? 100}
                onChange={(e) => onChange({ imageBrightness: parseInt(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleResetFraming}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('resetFraming')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
