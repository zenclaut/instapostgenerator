import React, { useState } from 'react';
import { 
  Layers, 
  CheckSquare, 
  Square, 
  Sliders, 
  Save, 
  RotateCcw, 
  Upload, 
  Sparkles, 
  BookmarkPlus,
  Trash2
} from 'lucide-react';
import type { SlideData, TemplateLayer, CustomTemplate, CategoryDefinition } from '../../types/postTypes';
import { PRESET_CATEGORIES } from '../../engine/categoryLoader';
import { db } from '../../db/postDatabase';

interface LayerTemplateManagerProps {
  slide: SlideData;
  categories: CategoryDefinition[];
  customTemplates: CustomTemplate[];
  onChange: (updates: Partial<SlideData>) => void;
  onRefreshTemplates: () => void;
}

export const LayerTemplateManager: React.FC<LayerTemplateManagerProps> = ({
  slide,
  categories,
  customTemplates,
  onChange,
  onRefreshTemplates
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isCreatingNewTemplate, setIsCreatingNewTemplate] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const currentCategory = categories.find((c) => c.id === slide.categoryId) || categories[0] || PRESET_CATEGORIES[0];
  const categoryTemplates = customTemplates.filter((t) => t.categoryId === slide.categoryId);

  // Kategori Değiştirme
  const handleCategoryChange = (newCatId: string) => {
    const cat = categories.find((c) => c.id === newCatId) || PRESET_CATEGORIES[0];
    const defaultTmpl = customTemplates.find((t) => t.categoryId === newCatId) || {
      id: `tmpl-${cat.id}-tam`,
      layers: cat.defaultLayers
    };

    const primaryColor = cat.fontInfo.colors.find((c) => c.color !== '#FFFFFF')?.color || '#FF5145';

    onChange({
      categoryId: cat.id,
      templateId: defaultTmpl.id,
      layers: JSON.parse(JSON.stringify(defaultTmpl.layers)),
      highlightColor: primaryColor
    });
  };

  // Şablon Seçme
  const handleSelectTemplate = (templateId: string) => {
    const tmpl = customTemplates.find((t) => t.id === templateId);
    if (!tmpl) return;

    onChange({
      templateId: tmpl.id,
      layers: JSON.parse(JSON.stringify(tmpl.layers))
    });
  };

  // Katman Açma / Kapatma (Tik)
  const handleToggleLayer = (layerId: string) => {
    const newLayers = slide.layers.map((l) => {
      if (l.id === layerId) {
        return { ...l, enabled: !l.enabled };
      }
      return l;
    });
    onChange({ layers: newLayers });
  };

  // Katman Değer Güncelleme (Offset, Scale, Opacity)
  const handleUpdateLayer = (layerId: string, updates: Partial<TemplateLayer>) => {
    const newLayers = slide.layers.map((l) => {
      if (l.id === layerId) {
        return { ...l, ...updates };
      }
      return l;
    });
    onChange({ layers: newLayers });
  };

  // Katman Ayarlarını Sıfırlama
  const handleResetLayer = (layerId: string) => {
    const defaultLayer = currentCategory.defaultLayers.find((l) => l.id === layerId);
    if (!defaultLayer) return;

    handleUpdateLayer(layerId, {
      offsetX: defaultLayer.offsetX,
      offsetY: defaultLayer.offsetY,
      scale: defaultLayer.scale,
      opacity: defaultLayer.opacity,
      enabled: defaultLayer.enabled
    });
  };

  // Mevcut Şablonu Kaydet
  const handleSaveCurrentTemplate = async () => {
    const currentTmpl = customTemplates.find((t) => t.id === slide.templateId);
    if (!currentTmpl) return;

    const updated: CustomTemplate = {
      ...currentTmpl,
      layers: JSON.parse(JSON.stringify(slide.layers)),
      updatedAt: Date.now()
    };

    await db.customTemplates.put(updated);
    onRefreshTemplates();
    showFeedback('Şablon ayarları başarıyla kaydedildi!');
  };

  // Yeni Şablon Yarat & Kaydet
  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;

    const newTmpl: CustomTemplate = {
      id: `tmpl-${slide.categoryId}-${Date.now()}`,
      name: newTemplateName.trim(),
      categoryId: slide.categoryId,
      layers: JSON.parse(JSON.stringify(slide.layers)),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPreset: false
    };

    await db.customTemplates.put(newTmpl);
    onRefreshTemplates();
    onChange({ templateId: newTmpl.id });
    setIsCreatingNewTemplate(false);
    setNewTemplateName('');
    showFeedback(`"${newTmpl.name}" şablonu başarıyla oluşturuldu!`);
  };

  // Şablon Sil
  const handleDeleteTemplate = async (tmplId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
      await db.customTemplates.delete(tmplId);
      onRefreshTemplates();
    }
  };

  // Kullanıcı Özel Görsel Katmanı Yükleme
  const handleUploadCustomLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const newLayer: TemplateLayer = {
          id: `custom-layer-${Date.now()}`,
          name: `Özel Görsel (${file.name})`,
          filename: file.name,
          imageUrl: event.target.result,
          enabled: true,
          offsetX: 0,
          offsetY: 0,
          scale: 1.0,
          opacity: 100,
          zIndex: (slide.layers.length + 1) * 10,
          isCustom: true
        };

        onChange({
          layers: [...slide.layers, newLayer]
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const showFeedback = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl space-y-4">
      {/* 1. KATEGORİ SEÇİMİ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Kategori & Sabit Görsel Katmanları</h3>
              <p className="text-xs text-slate-400">Görselleri tiklerle açıp kapatın, konumlarını ayarlayın ve şablonu kaydedin</p>
            </div>
          </div>
        </div>

        {/* Kategori Butonları */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {categories.map((cat) => {
            const isSelected = cat.id === slide.categoryId;
            const primaryColor = cat.fontInfo.colors.find((c) => c.color !== '#FFFFFF')?.color || '#FF5145';

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-950/70 to-slate-900 border-red-500 shadow-lg shadow-red-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    {cat.name}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                    title={`Kategori Rengi: ${primaryColor}`}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Font: {cat.fontInfo.boldFont} • Renk: {primaryColor}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ŞABLON SEÇİMİ VE ŞABLON KAYDETME */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Aktif Şablon:
          </label>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSaveCurrentTemplate}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all"
              title="Mevcut katman ayarlarını bu şablona kaydeder"
            >
              <Save className="w-3 h-3" />
              <span>Şablonu Kaydet</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreatingNewTemplate(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
              title="Bu ayarlarla yeni bir şablon oluştur"
            >
              <BookmarkPlus className="w-3 h-3 text-red-400" />
              <span>Yeni Şablon Yarat</span>
            </button>
          </div>
        </div>

        {/* Şablon Seçici Dropdown & Sil Butonu */}
        <div className="flex items-center gap-2">
          <select
            value={slide.templateId}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs text-slate-200 font-semibold cursor-pointer"
          >
            {categoryTemplates.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                {t.name} {t.isPreset ? '(Hazır)' : '(Özel)'}
              </option>
            ))}
          </select>

          {categoryTemplates.find((t) => t.id === slide.templateId && !t.isPreset) && (
            <button
              type="button"
              onClick={(e) => handleDeleteTemplate(slide.templateId, e)}
              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-400 text-xs"
              title="Bu özel şablonu sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>


        {/* Yeni Şablon Yaratma Alanı */}
        {isCreatingNewTemplate && (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-red-500/50 space-y-2 animate-fadeIn">
            <label className="text-[11px] font-semibold text-slate-200">Yeni Şablon Adı:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Örn: Haberler - Sade Koyu..."
                className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs text-slate-100"
                autoFocus
              />
              <button
                type="button"
                onClick={handleCreateTemplate}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingNewTemplate(false)}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Kayıt Başarı Bildirimi */}
        {saveSuccessMsg && (
          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium text-center animate-fadeIn">
            {saveSuccessMsg}
          </div>
        )}
      </div>

      {/* 3. KATMANLAR LİSTESİ (TİKLER & KONUMLANDIRMA) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            Kategori Görsel Katmanları ({slide.layers.length})
          </span>
          <label className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium cursor-pointer transition-colors">
            <Upload className="w-3 h-3 text-red-400" />
            <span>Özel Görsel Ekle</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadCustomLayer}
            />
          </label>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {slide.layers.map((layer) => {
            const isSelected = selectedLayerId === layer.id;

            return (
              <div
                key={layer.id}
                className={`p-3 rounded-xl border transition-all ${
                  layer.enabled
                    ? 'bg-slate-900/70 border-slate-800'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                {/* Katman Başlığı & Tikleme */}
                <div className="flex items-center justify-between gap-3">
                  <div
                    onClick={() => handleToggleLayer(layer.id)}
                    className="flex items-center gap-2.5 cursor-pointer select-none flex-1"
                  >
                    <div className="text-red-400">
                      {layer.enabled ? (
                        <CheckSquare className="w-4 h-4 text-red-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <div className="w-8 h-8 rounded bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={layer.imageUrl}
                        alt={layer.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div>
                      <span className={`text-xs font-semibold ${layer.enabled ? 'text-slate-100' : 'text-slate-500 line-through'}`}>
                        {layer.name}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {layer.filename} • {layer.zIndex ? `Z-Index: ${layer.zIndex}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Konum / Ayar Butonu */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedLayerId(isSelected ? null : layer.id)}
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                        isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                      title="Katman Konum ve Boyut Ayarları"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Kapat' : 'Ayarla'}</span>
                    </button>
                  </div>
                </div>

                {/* Katman Konumlandırma & Ölçekleme Paneli */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Saydamlık (Opacity) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Saydamlık (Opaklık)</span>
                          <span className="font-mono">{layer.opacity ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={layer.opacity ?? 100}
                          onChange={(e) => handleUpdateLayer(layer.id, { opacity: parseInt(e.target.value) })}
                          className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                      </div>

                      {/* Boyut / Ölçek (Scale) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Boyut / Ölçek</span>
                          <span className="font-mono">{Math.round((layer.scale || 1) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.05"
                          value={layer.scale || 1.0}
                          onChange={(e) => handleUpdateLayer(layer.id, { scale: parseFloat(e.target.value) })}
                          className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                      </div>

                      {/* X Konumu (Sağ / Sol) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Yatay Konum (X Offset)</span>
                          <span className="font-mono">{layer.offsetX || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-300"
                          max="300"
                          step="5"
                          value={layer.offsetX || 0}
                          onChange={(e) => handleUpdateLayer(layer.id, { offsetX: parseInt(e.target.value) })}
                          className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                      </div>

                      {/* Y Konumu (Yukarı / Aşağı) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Dikey Konum (Y Offset)</span>
                          <span className="font-mono">{layer.offsetY || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-300"
                          max="300"
                          step="5"
                          value={layer.offsetY || 0}
                          onChange={(e) => handleUpdateLayer(layer.id, { offsetY: parseInt(e.target.value) })}
                          className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleResetLayer(layer.id)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Varsayılan Konuma Sıfırla</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
