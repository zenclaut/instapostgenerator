import React, { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Type, 
  Sparkles,
  Palette
} from 'lucide-react';
import type { SlideData, CategoryDefinition } from '../../types/postTypes';
import { PRESET_CATEGORIES } from '../../engine/categoryLoader';
import { useLanguage } from '../../i18n/LanguageContext';

interface RichTextEditorProps {
  slide: SlideData;
  categories: CategoryDefinition[];
  onChange: (updates: Partial<SlideData>) => void;
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

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ slide, categories, onChange }) => {
  const { t } = useLanguage();
  const editorRef = useRef<HTMLDivElement>(null);

  const currentCategory = categories.find((c) => c.id === slide.categoryId) || PRESET_CATEGORIES[0];
  const primaryAccent = currentCategory.fontInfo.colors.find((c) => c.color !== '#FFFFFF')?.color || '#FF5145';

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== slide.contentHtml) {
      editorRef.current.innerHTML = slide.contentHtml;
    }
  }, [slide.contentHtml]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange({ contentHtml: editorRef.current.innerHTML });
    }
  };

  const applyFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange({ contentHtml: editorRef.current.innerHTML });
    }
  };

  const handleApplyCategoryHighlight = () => {
    document.execCommand('bold', false);
    document.execCommand('foreColor', false, primaryAccent);
    if (editorRef.current) {
      onChange({ contentHtml: editorRef.current.innerHTML });
    }
  };

  const applyColor = (color: string) => {
    document.execCommand('foreColor', false, color);
    if (editorRef.current) {
      onChange({ contentHtml: editorRef.current.innerHTML });
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
      {/* Başlık ve Kategori Font Bilgisi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{t('richTextTitle')}</h3>
            <p className="text-xs text-slate-400">{t('richTextSub')}</p>
          </div>
        </div>

        {/* 1-Tıkla Kategori Vurgusu */}
        <button
          type="button"
          onClick={handleApplyCategoryHighlight}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-md active:scale-95 border"
          style={{
            backgroundColor: `${primaryAccent}22`,
            borderColor: primaryAccent,
            color: primaryAccent
          }}
          title={t('applyHighlightHint')}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('applyHighlight', { name: currentCategory.name })}</span>
        </button>
      </div>

      {/* Araç Çubuğu (Toolbar) */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
        {/* Metin Formatlama Düğmeleri */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            title={t('bold')}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('italic')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            title={t('italic')}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('underline')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            title={t('underline')}
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Hizalama */}
          <button
            type="button"
            onClick={() => onChange({ textAlign: 'left' })}
            className={`p-1.5 rounded-lg transition-colors ${
              slide.textAlign === 'left' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title={t('alignLeft')}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ textAlign: 'center' })}
            className={`p-1.5 rounded-lg transition-colors ${
              slide.textAlign === 'center' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title={t('alignCenter')}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ textAlign: 'right' })}
            className={`p-1.5 rounded-lg transition-colors ${
              slide.textAlign === 'right' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title={t('alignRight')}
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Punto Boyutu */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">{t('fontSize')}:</span>
          <div className="flex items-center gap-1">
            <input
              type="range"
              min="20"
              max="42"
              step="1"
              value={slide.fontSize}
              onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
              className="w-20 accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="text-xs font-mono text-slate-300 w-7 text-right">
              {slide.fontSize}px
            </span>
          </div>
        </div>
      </div>

      {/* Renk Paleti Çubuğu */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Kategori Renkleri */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">
            {t('categoryColors', { name: currentCategory.name })}:
          </span>
          <div className="flex items-center gap-1.5">
            {currentCategory.fontInfo.colors.map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => applyColor(c.color)}
                className="w-6 h-6 rounded-lg border border-slate-700 shadow hover:scale-110 active:scale-95 transition-transform"
                style={{ backgroundColor: c.color }}
                title={`${c.name} (${c.color})`}
              />
            ))}
          </div>
        </div>

        {/* Klasik Renkler */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">{t('classicColors')}:</span>
          <div className="flex items-center gap-1.5">
            {CLASSIC_COLORS.map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => applyColor(c.color)}
                className="w-5 h-5 rounded-md border border-slate-700 hover:scale-110 transition-transform"
                style={{ backgroundColor: c.color }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Özel Renk Seçici */}
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="color"
            onChange={(e) => applyColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            title={t('customColor')}
          />
        </div>
      </div>

      {/* Üst Başlık (Opsiyonel) */}
      <div>
        <label className="text-[11px] text-slate-400 font-medium mb-1 block">
          {t('titleOptional')}
        </label>
        <input
          type="text"
          value={slide.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={t('titlePlaceholder')}
          className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-slate-100 uppercase tracking-wider"
        />
      </div>

      {/* Zengin Metin Giriş Alanı (ContentEditable) */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full min-h-[110px] max-h-[220px] overflow-y-auto px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm leading-relaxed text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
          style={{
            textAlign: slide.textAlign,
            fontFamily: currentCategory.fontInfo.mediumFont
          }}
          data-placeholder={t('contentPlaceholder')}
        />
      </div>
    </div>
  );
};
