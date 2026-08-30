import React, { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Type, 
  Palette, 
  RotateCcw,
  Sparkles,
  Heading
} from 'lucide-react';
import type { SlideData, CategoryDefinition } from '../../types/postTypes';
import { PRESET_CATEGORIES } from '../../engine/categoryLoader';

interface RichTextEditorProps {
  slide: SlideData;
  categories: CategoryDefinition[];
  onChange: (updates: Partial<SlideData>) => void;
}

const CLASSIC_COLOR_PRESETS = [
  { name: 'Sarı', color: '#FACC15', bg: 'bg-yellow-400' },
  { name: 'Yeşil', color: '#4ADE80', bg: 'bg-green-400' },
  { name: 'Mavi / Cyan', color: '#38BDF8', bg: 'bg-sky-400' },
  { name: 'Turuncu', color: '#FB923C', bg: 'bg-orange-400' },
  { name: 'Mor', color: '#C084FC', bg: 'bg-purple-400' }
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ slide, categories, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const currentCategory = categories.find((c) => c.id === slide.categoryId) || PRESET_CATEGORIES[0];
  const primaryHighlightColor = slide.highlightColor || currentCategory.fontInfo.colors.find((c) => c.color !== '#FFFFFF')?.color || '#FF5145';

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== slide.contentHtml) {
      editorRef.current.innerHTML = slide.contentHtml;
    }
  }, [slide.id]);

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

  const applyColor = (colorHex: string) => {
    applyFormat('foreColor', colorHex);
  };

  const highlightSelectionCategoryColor = () => {
    applyFormat('bold');
    applyFormat('foreColor', primaryHighlightColor);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Zengin Metin Editörü (font.txt Entegre)</h3>
            <p className="text-xs text-slate-400">
              Font: <span className="text-slate-200 font-semibold">{currentCategory.fontInfo.boldFont}</span> • 
              Vurgu Rengi: <span className="font-bold" style={{ color: primaryHighlightColor }}>{primaryHighlightColor}</span>
            </p>
          </div>
        </div>

        {/* Kategori Özel Vurgu Butonu */}
        <button
          type="button"
          onClick={highlightSelectionCategoryColor}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold shadow-sm transition-all"
          style={{
            backgroundColor: `${primaryHighlightColor}20`,
            borderColor: `${primaryHighlightColor}50`,
            color: primaryHighlightColor
          }}
          title="Seçili kelimeleri kalınlaştırır ve kategori rengine boyar"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{currentCategory.name} Vurgusu Yap</span>
        </button>
      </div>

      {/* Başlık Alanı */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="text-slate-300 font-medium flex items-center gap-1.5">
            <Heading className="w-3.5 h-3.5 text-blue-400" />
            Üst Başlık (İsteğe bağlı)
          </label>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">Başlık Punto:</span>
            <input
              type="number"
              min="18"
              max="50"
              value={slide.titleFontSize || 32}
              onChange={(e) => onChange({ titleFontSize: parseInt(e.target.value) || 32 })}
              className="w-12 h-6 px-1.5 text-xs text-center bg-slate-900 border border-slate-700 rounded text-slate-200"
            />
          </div>
        </div>
        <input
          type="text"
          value={slide.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Başlık girin (örn: 'Operasyonun Detayları:')..."
          className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-slate-100 placeholder:text-slate-500 font-medium"
        />
      </div>

      {/* Tipografi ve Hizalama Araç Çubuğu */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
        {/* Metin Formatlama Araçları */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Kalın (Bold - Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('italic')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="İtalik (Italic - Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('underline')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Altı Çizili"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-slate-800 mx-1" />

          {/* Hizalama */}
          <button
            type="button"
            onClick={() => onChange({ textAlign: 'left' })}
            className={`p-1.5 rounded-lg transition-colors ${
              slide.textAlign === 'left' ? 'bg-red-600/30 text-red-300' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Sola Hizala"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ textAlign: 'center' })}
            className={`p-1.5 rounded-lg transition-colors ${
              slide.textAlign === 'center' ? 'bg-red-600/30 text-red-300' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Ortala"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ textAlign: 'right' })}
            className={`p-1.5 rounded-lg transition-colors ${
              slide.textAlign === 'right' ? 'bg-red-600/30 text-red-300' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Sağa Hizala"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Renk Seçiciler (font.txt Kategori Renkleri + Klasik Renkler) */}
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-slate-400 mr-0.5" />

          {/* Kategoriye Özel font.txt Renkleri */}
          {currentCategory.fontInfo.colors.map((c) => (
            <button
              key={c.color}
              type="button"
              onClick={() => applyColor(c.color)}
              className="w-5 h-5 rounded-full border-2 border-slate-700 hover:scale-110 transition-transform shadow-sm relative group"
              style={{ backgroundColor: c.color }}
              title={`Kategori Rengi: ${c.name} (${c.color})`}
            />
          ))}

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* Klasik Renk Seçenekleri */}
          {CLASSIC_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.color}
              type="button"
              onClick={() => applyColor(preset.color)}
              className={`w-4.5 h-4.5 rounded-full ${preset.bg} border border-slate-700 hover:scale-110 transition-transform shadow-sm`}
              title={preset.name}
            />
          ))}

          {/* Özel Renk Seçici */}
          <input
            type="color"
            onChange={(e) => applyColor(e.target.value)}
            className="w-5 h-5 rounded-full bg-transparent border-0 cursor-pointer p-0"
            title="Özel Renk Seç"
          />

          <div className="w-[1px] h-5 bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => applyFormat('removeFormat')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 text-xs"
            title="Biçimlendirmeyi Temizle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Punto ve Font Seçenekleri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-medium">Kategori Yazı Tipi (font.txt)</label>
          <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-semibold flex items-center justify-between">
            <span>{currentCategory.fontInfo.boldFont}</span>
            <span className="text-[10px] text-emerald-400 font-normal">Aktif</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Gövde Metin Boyutu</span>
            <span className="font-mono text-slate-300">{slide.fontSize} pt</span>
          </div>
          <input
            type="range"
            min="18"
            max="44"
            step="1"
            value={slide.fontSize || 29}
            onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
            className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg mt-2"
          />
        </div>
      </div>

      {/* Zengin Metin Düzenleme Alanı */}
      <div className="space-y-1">
        <label className="text-xs text-slate-400 font-medium flex items-center justify-between">
          <span>Gönderi Metni (Metni seçip üstteki butonlarla renklendirin)</span>
        </label>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          data-placeholder="Gönderi metnini buraya yazın..."
          className="rich-editor-area w-full p-4 rounded-xl glass-input text-sm text-slate-100 font-medium focus:ring-1 focus:ring-red-500 focus:border-red-500/50 shadow-inner"
        />
      </div>
    </div>
  );
};
