import React from 'react';
import { 
  CircleDot,
  SlidersHorizontal
} from 'lucide-react';
import type { SlideData } from '../../types/postTypes';
import { useLanguage } from '../../i18n/LanguageContext';

interface SlideSettingsProps {
  slide: SlideData;
  onChange: (updates: Partial<SlideData>) => void;
}

export const SlideSettings: React.FC<SlideSettingsProps> = ({ slide, onChange }) => {
  const { t } = useLanguage();

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{t('slideSettingsTitle')}</h3>
          <p className="text-xs text-slate-400">{t('slideSettingsSub')}</p>
        </div>
      </div>

      {/* SAYFA GÖSTERGE NOKTALARI */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <CircleDot className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-xs font-semibold text-slate-200">{t('paginationDots')}</span>
            <p className="text-[11px] text-slate-400">{t('paginationDotsSub')}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={slide.showPaginationDots}
            onChange={(e) => onChange({ showPaginationDots: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>
    </div>
  );
};
