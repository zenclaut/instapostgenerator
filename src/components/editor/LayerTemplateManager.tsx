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
  Trash2,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Plus,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import type { SlideData, TemplateLayer, CustomTemplate, CategoryDefinition } from '../../types/postTypes';
import { PRESET_CATEGORIES } from '../../engine/categoryLoader';
import { db } from '../../db/postDatabase';
import { useLanguage } from '../../i18n/LanguageContext';

interface LayerTemplateManagerProps {
  slide: SlideData;
  categories: CategoryDefinition[];
  customTemplates: CustomTemplate[];
  onChange: (updates: Partial<SlideData>) => void;
  onRefreshCategoriesAndTemplates: () => void;
}

export const LayerTemplateManager: React.FC<LayerTemplateManagerProps> = ({
  slide,
  categories,
  customTemplates,
  onChange,
  onRefreshCategoriesAndTemplates
}) => {
  const { t } = useLanguage();
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  // Katlanır Kart Durumları (Accordion States)
  const [isTemplateSectionOpen, setIsTemplateSectionOpen] = useState<boolean>(true);
  const [isLayersSectionOpen, setIsLayersSectionOpen] = useState<boolean>(true);

  // Şablon Oluşturma Modalı / Durumu
  const [isCreatingNewTemplate, setIsCreatingNewTemplate] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>('');

  // Yeni Kategori Oluşturma Modalı / Durumu
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatFont, setNewCatFont] = useState<string>('Metropolis Bold');
  const [newCatColor, setNewCatColor] = useState<string>('#3B82F6');
  const [newCatLayers, setNewCatLayers] = useState<TemplateLayer[]>([]);

  // Özel Katman Ekleme Modalı
  const [isAddingLayerModalOpen, setIsAddingLayerModalOpen] = useState<boolean>(false);
  const [newLayerName, setNewLayerName] = useState<string>('');
  const [newLayerImage, setNewLayerImage] = useState<string | null>(null);
  const [newLayerFilename, setNewLayerFilename] = useState<string>('');
  const [newLayerZIndex, setNewLayerZIndex] = useState<number>(60);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const currentCategory = categories.find((c) => c.id === slide.categoryId) || categories[0] || PRESET_CATEGORIES[0];
  const categoryTemplates = customTemplates.filter((t) => t.categoryId === slide.categoryId);
  const currentTemplate = customTemplates.find((t) => t.id === slide.templateId);

  // Kategori Değiştirme
  const handleCategoryChange = (newCatId: string) => {
    const cat = categories.find((c) => c.id === newCatId) || PRESET_CATEGORIES[0];
    const defaultTmpl = customTemplates.find((t) => t.categoryId === newCatId) || {
      id: `tmpl-${cat.id}-standart`,
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

  // Yeni Kategori Yarat
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;

    const catId = `cat-${Date.now()}`;
    const baseLayers = newCatLayers.length > 0 
      ? newCatLayers 
      : JSON.parse(JSON.stringify(PRESET_CATEGORIES[0].defaultLayers));

    const newCategory: CategoryDefinition = {
      id: catId,
      name: newCatName.trim(),
      fontInfo: {
        boldFont: newCatFont,
        mediumFont: newCatFont.replace('Bold', 'Medium'),
        colors: [
          { name: 'Beyaz', color: '#FFFFFF' },
          { name: newCatName.trim(), color: newCatColor }
        ]
      },
      defaultLayers: baseLayers,
      isCustom: true
    };

    const defaultTmpl: CustomTemplate = {
      id: `tmpl-${catId}-standart`,
      name: `${newCategory.name} - Standart`,
      categoryId: catId,
      layers: JSON.parse(JSON.stringify(baseLayers)),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPreset: false
    };

    await db.categories.put(newCategory);
    await db.customTemplates.put(defaultTmpl);
    onRefreshCategoriesAndTemplates();

    handleCategoryChange(catId);
    setIsCreatingCategory(false);
    setNewCatName('');
    setNewCatLayers([]);
    showFeedback(t('categoryCreatedFeedback', { name: newCategory.name }));
  };

  // Kategoriye Görsel Katmanı Yükleme (Modal Açılışında)
  const handleCatLayerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const layer: TemplateLayer = {
          id: `layer-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          filename: file.name,
          imageUrl: event.target.result,
          enabled: true,
          offsetX: 0,
          offsetY: 0,
          scale: 1.0,
          opacity: 100,
          zIndex: (newCatLayers.length + 1) * 10,
          isCustom: true
        };
        setNewCatLayers((prev) => [...prev, layer]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Özel Kategori Sil
  const handleDeleteCategory = async (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('deleteCategoryConfirm'))) {
      await db.categories.delete(catId);
      const tmpls = await db.customTemplates.where('categoryId').equals(catId).toArray();
      for (const t of tmpls) {
        await db.customTemplates.delete(t.id);
      }
      onRefreshCategoriesAndTemplates();
      handleCategoryChange('haberler');
    }
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

  // Katman Değer Güncelleme (Offset, Scale, Opacity, ZIndex)
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

  // Katmanı Sil
  const handleDeleteLayer = (layerId: string) => {
    if (slide.layers.length <= 1) return;
    const newLayers = slide.layers.filter((l) => l.id !== layerId);
    onChange({ layers: newLayers });
    if (selectedLayerId === layerId) setSelectedLayerId(null);
  };

  // Katman Görselini Değiştir
  const handleReplaceLayerImage = (layerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        handleUpdateLayer(layerId, {
          imageUrl: event.target.result,
          filename: file.name
        });
        showFeedback(t('layerImageUpdatedFeedback', { name: file.name }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Katmanı Z-Index Olarak Yukarı / Aşağı Taşı
  const handleShiftZIndex = (layerId: string, direction: 'up' | 'down') => {
    const layer = slide.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const delta = direction === 'up' ? 5 : -5;
    const newZ = Math.max(1, (layer.zIndex || 10) + delta);
    handleUpdateLayer(layerId, { zIndex: newZ });
  };

  // Mevcut Şablonu Kaydet (Veritabanına)
  const handleSaveCurrentTemplate = async () => {
    const currentTmpl = customTemplates.find((t) => t.id === slide.templateId);
    if (!currentTmpl) return;

    const updated: CustomTemplate = {
      ...currentTmpl,
      layers: JSON.parse(JSON.stringify(slide.layers)),
      updatedAt: Date.now()
    };

    await db.customTemplates.put(updated);
    onRefreshCategoriesAndTemplates();
    showFeedback(t('templateSavedFeedback'));
  };

  // Yeni Şablon Yarat & Kaydet (Veritabanına)
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
    onRefreshCategoriesAndTemplates();
    onChange({ templateId: newTmpl.id });
    setIsCreatingNewTemplate(false);
    setNewTemplateName('');
    showFeedback(t('newTemplateCreatedFeedback', { name: newTmpl.name }));
  };

  // Bu Katmanları Kategori Varsayılanı Yap
  const handleSaveAsCategoryDefaults = async () => {
    const cat = categories.find((c) => c.id === slide.categoryId);
    if (!cat) return;

    const updatedCat: CategoryDefinition = {
      ...cat,
      defaultLayers: JSON.parse(JSON.stringify(slide.layers))
    };

    await db.categories.put(updatedCat);
    onRefreshCategoriesAndTemplates();
    showFeedback(t('categoryDefaultSavedFeedback', { name: cat.name }));
  };

  // Şablon Sil
  const handleDeleteTemplate = async (tmplId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('deleteTemplateConfirm'))) {
      await db.customTemplates.delete(tmplId);
      onRefreshCategoriesAndTemplates();
    }
  };

  // Yeni Görsel Katmanı Yükleme ve Ekleme
  const handleFileSelectForNewLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setNewLayerImage(event.target.result);
        setNewLayerFilename(file.name);
        if (!newLayerName) {
          setNewLayerName(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmAddNewLayer = () => {
    if (!newLayerImage) return;

    const newLayer: TemplateLayer = {
      id: `custom-layer-${Date.now()}`,
      name: newLayerName.trim() || newLayerFilename,
      filename: newLayerFilename,
      imageUrl: newLayerImage,
      enabled: true,
      offsetX: 0,
      offsetY: 0,
      scale: 1.0,
      opacity: 100,
      zIndex: newLayerZIndex,
      isCustom: true
    };

    onChange({
      layers: [...slide.layers, newLayer]
    });

    setIsAddingLayerModalOpen(false);
    setNewLayerImage(null);
    setNewLayerFilename('');
    setNewLayerName('');
    showFeedback(t('layerAddedFeedback', { name: newLayer.name }));
  };

  const showFeedback = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const activeLayersCount = slide.layers.filter((l) => l.enabled).length;

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl space-y-4">
      {/* 1. KATEGORİ SEÇİMİ (ÜSTTE SABİT VE AÇIK) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{t('categorySelection')}</h3>
              <p className="text-xs text-slate-400">{t('categorySelectionSub')}</p>
            </div>
          </div>

          {/* Yeni Kategori Ekle Butonu */}
          <button
            type="button"
            onClick={() => setIsCreatingCategory(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600/30 to-red-700/30 hover:from-red-600/50 hover:to-red-700/50 border border-red-500/40 text-red-300 text-xs font-semibold shadow-sm transition-all"
            title={t('createCategory')}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>{t('createCategory')}</span>
          </button>
        </div>

        {/* Yeni Kategori Oluşturma Modalı / Paneli */}
        {isCreatingCategory && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-red-500/50 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-red-400" />
                {t('newCategoryTitle')}
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                {t('close')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-medium">{t('categoryName')}</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={t('categoryNamePlaceholder')}
                  className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-slate-100"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium">{t('font')}</label>
                <select
                  value={newCatFont}
                  onChange={(e) => setNewCatFont(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-slate-100"
                >
                  <option value="Metropolis Bold">Metropolis Bold</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Inter">Inter</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Bebas Neue">Bebas Neue</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium">{t('highlightColor')}</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-slate-300">{newCatColor}</span>
                </div>
              </div>
            </div>

            {/* Kategori İçin Görsel Katmanı Yükleme */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {t('optionalImages', { count: newCatLayers.length })}
              </span>
              <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer">
                <Upload className="w-3 h-3 text-red-400" />
                <span>{t('addLayerImage')}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCatLayerUpload}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleCreateCategory}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                {t('saveCategory')}
              </button>
            </div>
          </div>
        )}

        {/* Kategori Butonları Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {categories.map((cat) => {
            const isSelected = cat.id === slide.categoryId;
            const primaryColor = cat.fontInfo.colors.find((c) => c.color !== '#FFFFFF')?.color || '#FF5145';

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-950/70 to-slate-900 border-red-500 shadow-lg shadow-red-950/50 ring-1 ring-red-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wide truncate">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                      title={`Color: ${primaryColor}`}
                    />
                    {cat.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCategory(cat.id, e)}
                        className="p-0.5 hover:text-red-400 text-slate-500 transition-colors"
                        title={t('deleteCategoryConfirm')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {t('fontLabel', { font: cat.fontInfo.boldFont })}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. KATLANIR KART: ŞABLON SEÇİMİ VE VERİTABANI KAYDI */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden transition-all shadow-md">
        <button
          type="button"
          onClick={() => setIsTemplateSectionOpen(!isTemplateSectionOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">{t('templateSectionTitle')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium truncate max-w-[160px]">
              {currentTemplate?.name || 'Template'}
            </span>
          </div>
          <div className="text-slate-400">
            {isTemplateSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isTemplateSectionOpen && (
          <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300">
                {t('savedTemplates')}
              </label>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveCurrentTemplate}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all"
                  title={t('saveTemplate')}
                >
                  <Save className="w-3 h-3" />
                  <span>{t('saveTemplate')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreatingNewTemplate(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                  title={t('createNewTemplate')}
                >
                  <BookmarkPlus className="w-3 h-3 text-red-400" />
                  <span>{t('createNewTemplate')}</span>
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
                {categoryTemplates.map((tItem) => (
                  <option key={tItem.id} value={tItem.id} className="bg-slate-900 text-slate-200">
                    {tItem.name} {tItem.isPreset ? t('presetTag') : t('customTag')}
                  </option>
                ))}
              </select>

              {categoryTemplates.find((tItem) => tItem.id === slide.templateId && !tItem.isPreset) && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteTemplate(slide.templateId, e)}
                  className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-400 text-xs"
                  title="Delete Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Yeni Şablon Yaratma Alanı */}
            {isCreatingNewTemplate && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-red-500/50 space-y-2 animate-fadeIn">
                <label className="text-[11px] font-semibold text-slate-200">{t('newTemplateNameLabel')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder={t('newTemplatePlaceholder')}
                    className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs text-slate-100"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateTemplate}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                  >
                    {t('save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewTemplate(false)}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Kategori Varsayılanı Yap Butonu */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {t('makeCategoryDefault')}
              </span>
              <button
                type="button"
                onClick={handleSaveAsCategoryDefaults}
                className="text-[11px] font-semibold text-red-400 hover:text-red-300 underline"
              >
                {t('saveAsCategoryDefaultBtn')}
              </button>
            </div>

            {/* Kayıt Başarı Bildirimi */}
            {saveSuccessMsg && (
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium text-center animate-fadeIn">
                {saveSuccessMsg}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. KATLANIR KART: GÖRSEL KATMANLARI & TİKLER */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden transition-all shadow-md">
        <button
          type="button"
          onClick={() => setIsLayersSectionOpen(!isLayersSectionOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200">{t('layersSectionTitle')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-medium">
              {t('activeCount', { active: activeLayersCount, total: slide.layers.length })}
            </span>
          </div>
          <div className="text-slate-400">
            {isLayersSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isLayersSectionOpen && (
          <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {t('layersHint')}
              </span>
              <button
                type="button"
                onClick={() => setIsAddingLayerModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold transition-colors shadow-sm"
              >
                <Upload className="w-3 h-3" />
                <span>{t('uploadLayerBtn')}</span>
              </button>
            </div>

            {/* Yeni Katman Yükleme Modalı / Paneli */}
            {isAddingLayerModalOpen && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-red-500/50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-red-400" />
                    {t('uploadLayerModalTitle')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingLayerModalOpen(false);
                      setNewLayerImage(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    {t('close')}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">{t('layerName')}</label>
                    <input
                      type="text"
                      value={newLayerName}
                      onChange={(e) => setNewLayerName(e.target.value)}
                      placeholder={t('layerNamePlaceholder')}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-slate-100 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">{t('selectImageFile')}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelectForNewLayer}
                      className="w-full text-xs text-slate-400 mt-1 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-red-400 hover:file:bg-slate-700"
                    />
                  </div>
                </div>

                {newLayerImage && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <img
                      src={newLayerImage}
                      alt="Preview"
                      className="w-10 h-10 object-contain rounded bg-black/40 border border-slate-700"
                    />
                    <div className="text-xs text-slate-300">
                      <p className="font-semibold">{newLayerFilename}</p>
                      <p className="text-[10px] text-slate-500">{t('readyToEmbed')}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-slate-400">{t('zIndexOrder')}</label>
                    <input
                      type="number"
                      value={newLayerZIndex}
                      onChange={(e) => setNewLayerZIndex(parseInt(e.target.value) || 10)}
                      className="w-16 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs text-center font-mono text-slate-200"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmAddNewLayer}
                    disabled={!newLayerImage}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                  >
                    {t('addLayerConfirm')}
                  </button>
                </div>
              </div>
            )}

            {/* Katman Listesi */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {slide.layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;

                return (
                  <div
                    key={layer.id}
                    className={`p-3 rounded-xl border transition-all ${
                      layer.enabled
                        ? 'bg-slate-900/80 border-slate-800'
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
                            {layer.filename} • Z-Index: {layer.zIndex} {layer.isCustom ? `• ${t('customTag')}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Katman Eylem Butonları */}
                      <div className="flex items-center gap-1">
                        {/* Z-Index Taşıma */}
                        <button
                          type="button"
                          onClick={() => handleShiftZIndex(layer.id, 'up')}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                          title={t('moveLayerUp')}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShiftZIndex(layer.id, 'down')}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                          title={t('moveLayerDown')}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>

                        {/* Konum / Ayar Butonu */}
                        <button
                          type="button"
                          onClick={() => setSelectedLayerId(isSelected ? null : layer.id)}
                          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                            isSelected
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                          title={t('adjust')}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>{isSelected ? t('close') : t('adjust')}</span>
                        </button>

                        {/* Özel Katman Sil */}
                        {layer.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLayer(layer.id)}
                            className="p-1.5 hover:bg-red-950/60 rounded text-slate-500 hover:text-red-400 transition-colors"
                            title={t('deleteLayer')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Katman Konumlandırma, Ölçekleme & Görsel Değiştirme Paneli */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Saydamlık (Opacity) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>{t('opacity')}</span>
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
                              <span>{t('scaleSize')}</span>
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
                              <span>{t('offsetX')}</span>
                              <span className="font-mono">{layer.offsetX || 0}px</span>
                            </div>
                            <input
                              type="range"
                              min="-400"
                              max="400"
                              step="5"
                              value={layer.offsetX || 0}
                              onChange={(e) => handleUpdateLayer(layer.id, { offsetX: parseInt(e.target.value) })}
                              className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                            />
                          </div>

                          {/* Y Konumu (Yukarı / Aşağı) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>{t('offsetY')}</span>
                              <span className="font-mono">{layer.offsetY || 0}px</span>
                            </div>
                            <input
                              type="range"
                              min="-400"
                              max="400"
                              step="5"
                              value={layer.offsetY || 0}
                              onChange={(e) => handleUpdateLayer(layer.id, { offsetY: parseInt(e.target.value) })}
                              className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Alt Butonlar: Görseli Değiştir & Sıfırla */}
                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 cursor-pointer font-medium">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{t('changeLayerImage')}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleReplaceLayerImage(layer.id, e)}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleResetLayer(layer.id)}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{t('resetPosition')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
