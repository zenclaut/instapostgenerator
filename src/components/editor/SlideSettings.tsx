import React from 'react';
import { 
  ArrowRight, 
  SlidersHorizontal, 
  CircleDot
} from 'lucide-react';
import type { SlideData } from '../../types/postTypes';

interface SlideSettingsProps {
  slide: SlideData;
  onChange: (updates: Partial<SlideData>) => void;
}

export const SlideSettings: React.FC<SlideSettingsProps> = ({ slide, onChange }) => {
  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Yana Kaydır & Sayfa Göstergeleri</h3>
          <p className="text-xs text-slate-400">Fotoğraf bazında yana kaydır yönlendirmesi ve sayfa noktaları</p>
        </div>
      </div>

      {/* 1. YANA KAYDIR ROZETİ AYARLARI (Fotoğraf bazında seçim) */}
      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200">"Yana Kaydır ➔" Rozeti</span>
              <p className="text-[11px] text-slate-400">Bu slayt için yana kaydır yönlendirmesini açın/kapatın</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={slide.showSwipeIndicator}
              onChange={(e) => onChange({ showSwipeIndicator: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {slide.showSwipeIndicator && (
          <div className="pt-2.5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-medium">Rozet Metni</label>
              <input
                type="text"
                value={slide.swipeText}
                onChange={(e) => onChange({ swipeText: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-slate-100 font-semibold"
                placeholder="YANA KAYDIR ➔"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-medium">Rozet Rengi</label>
              <div className="flex items-center gap-1.5 mt-1">
                {['#FFFFFF', '#FF5145', '#F6049D', '#FACC15'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onChange({ swipeTextColor: color })}
                    className={`w-6 h-6 rounded-lg border transition-transform ${
                      slide.swipeTextColor === color ? 'scale-110 border-white ring-2 ring-red-500' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SAYFA GÖSTERGE NOKTALARI */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center gap-2">
          <CircleDot className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">Sayfa Gösterge Noktaları (Dots)</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={slide.showPaginationDots}
            onChange={(e) => onChange({ showPaginationDots: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-8 h-4.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>
    </div>
  );
};
