import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Download, 
  Flame,
  Smartphone,
  Image as ImageIcon,
  Layers as LayersIcon,
  Sliders
} from 'lucide-react';

import type { ProjectData, SlideData, CustomTemplate, CategoryDefinition } from './types/postTypes';
import { createNewProject, createNewSlide, initializeDatabase, SAMPLE_PROJECTS } from './db/postDatabase';
import { PRESET_CATEGORIES, DEFAULT_CUSTOM_TEMPLATES } from './engine/categoryLoader';
import { db } from './db/postDatabase';
import { useLanguage } from './i18n/LanguageContext';
import { SlideTabs } from './components/editor/SlideTabs';
import { ImageUploader } from './components/editor/ImageUploader';
import { LayerTemplateManager } from './components/editor/LayerTemplateManager';
import { RichTextEditor } from './components/editor/RichTextEditor';
import { SlideSettings } from './components/editor/SlideSettings';
import { CanvasPreview } from './components/preview/CanvasPreview';
import { ExportModal } from './components/export/ExportModal';

export function App() {
  const { language, setLanguage, t } = useLanguage();

  // Aktif Proje State (Oturum boyunca RAM'de tutulur, geçmişe kaydedilmez)
  const [project, setProject] = useState<ProjectData>(() => SAMPLE_PROJECTS[0]);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Kategori ve Şablon State (IndexedDB'de tutulur)
  const [categories, setCategories] = useState<CategoryDefinition[]>(PRESET_CATEGORIES);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(DEFAULT_CUSTOM_TEMPLATES);

  // Mobil Sekme State ('preview' | 'image' | 'layers' | 'settings')
  const [mobileTab, setMobileTab] = useState<'preview' | 'image' | 'layers' | 'settings'>('preview');

  // Dışa Aktarma Modalı
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Veritabanını Başlat ve Kategori/Şablonları Yükle
  const refreshCategoriesAndTemplates = useCallback(async () => {
    try {
      await initializeDatabase();
      const allCats = await db.categories.toArray();
      if (allCats.length > 0) setCategories(allCats);
      const allTmpls = await db.customTemplates.toArray();
      if (allTmpls.length > 0) setCustomTemplates(allTmpls);
    } catch (err) {
      console.warn('Veritabanı başlatma hatası:', err);
    }
  }, []);

  useEffect(() => {
    refreshCategoriesAndTemplates();
  }, [refreshCategoriesAndTemplates]);

  // Aktif Slide
  const currentSlide: SlideData = project.slides[activeSlideIndex] || project.slides[0];

  // Slide Güncelleme
  const updateCurrentSlide = useCallback((updates: Partial<SlideData>) => {
    setProject((prev) => {
      const newSlides = [...prev.slides];
      newSlides[activeSlideIndex] = {
        ...newSlides[activeSlideIndex],
        ...updates
      };
      return {
        ...prev,
        slides: newSlides
      };
    });
  }, [activeSlideIndex]);

  // Yeni Sayfa Ekleme
  const handleAddSlide = (categoryId: string = 'haberler') => {
    const newSlide = createNewSlide(categoryId, project.slides.length);
    setProject((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    setActiveSlideIndex(project.slides.length);
  };

  // Sayfa Çoğaltma
  const handleDuplicateSlide = (index: number) => {
    const target = project.slides[index];
    const clonedSlide: SlideData = {
      ...JSON.parse(JSON.stringify(target)),
      id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      showSwipeIndicator: false
    };
    const newSlides = [...project.slides];
    newSlides.splice(index + 1, 0, clonedSlide);
    setProject((prev) => ({ ...prev, slides: newSlides }));
    setActiveSlideIndex(index + 1);
  };

  // Sayfa Silme
  const handleDeleteSlide = (index: number) => {
    if (project.slides.length <= 1) return;
    const newSlides = project.slides.filter((_, i) => i !== index);
    setProject((prev) => ({ ...prev, slides: newSlides }));
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  // Sayfa Sıralama
  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= project.slides.length) return;
    const newSlides = [...project.slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);
    setProject((prev) => ({ ...prev, slides: newSlides }));
    setActiveSlideIndex(toIndex);
  };

  // Yeni Boş Proje Başlat
  const handleCreateNewProject = () => {
    if (confirm(t('confirmNewProject'))) {
      const newProj = createNewProject('Yeni BGY Gönderisi', currentSlide.categoryId);
      setProject(newProj);
      setActiveSlideIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-red-500/30 selection:text-red-200">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/90 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Başlık */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-red-800 flex items-center justify-center text-white font-black shadow-lg shadow-red-950/80 border border-red-500/40">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>{t('appTitle')}</span>
                <span className="text-[10px] uppercase font-bold bg-red-600/30 border border-red-500/40 text-red-300 px-2 py-0.5 rounded-full">
                  {t('studioBadge')}
                </span>
              </h1>
            </div>
          </div>

          {/* Hızlı İşlem Butonları & Dil Seçici */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Dil Seçici (TR / EN) */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setLanguage('tr')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  language === 'tr'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Türkçe"
              >
                <span>TR</span>
                <span className="text-xs">🇹🇷</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  language === 'en'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="English"
              >
                <span>EN</span>
                <span className="text-xs">🇬🇧</span>
              </button>
            </div>

            {/* Yeni Proje */}
            <button
              onClick={handleCreateNewProject}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors"
              title={t('newProject')}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('newProject')}</span>
            </button>

            {/* Dışa Aktar & İndir (Ana Buton) */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-950/60 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{t('exportDownload')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobil Sekme Barı (lg:hidden) */}
      <div className="lg:hidden max-w-7xl w-full mx-auto px-4 pt-3">
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs shadow-lg">
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold transition-all text-[10px] ${
              mobileTab === 'preview'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate">{t('mobileTabPreviewText')}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setMobileTab('image')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold transition-all text-[10px] ${
              mobileTab === 'image'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="truncate">{t('mobileTabImage')}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('layers')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold transition-all text-[10px] ${
              mobileTab === 'layers'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayersIcon className="w-3.5 h-3.5" />
            <span className="truncate">{t('mobileTabLayers')}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('settings')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold transition-all text-[10px] ${
              mobileTab === 'settings'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="truncate">{t('mobileTabSettings')}</span>
          </button>
        </div>
      </div>

      {/* Carousel Sayfa Sekmeleri (Her zaman üstte erişilebilir) */}
      <div className="max-w-7xl w-full mx-auto px-4 lg:px-6 pt-3">
        <SlideTabs
          slides={project.slides}
          activeSlideIndex={activeSlideIndex}
          onSelectSlide={setActiveSlideIndex}
          onAddSlide={handleAddSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onMoveSlide={handleMoveSlide}
        />
      </div>

      {/* Ana Çalışma Alanı (İki Kolonlu Stüdyo Arayüzü) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SOL KOLON: Editör ve Katman Paneli (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Görsel Yükleme & Kadrajlama */}
          <div className={`${mobileTab === 'image' ? 'block' : 'hidden'} lg:block`}>
            <ImageUploader
              slide={currentSlide}
              onChange={updateCurrentSlide}
            />
          </div>

          {/* 2. Kategori Seçimi ve Katlanır Kartlar (Şablonlar & Görsel Katmanları) */}
          <div className={`${mobileTab === 'layers' ? 'block' : 'hidden'} lg:block`}>
            <LayerTemplateManager
              slide={currentSlide}
              categories={categories}
              customTemplates={customTemplates}
              onChange={updateCurrentSlide}
              onRefreshCategoriesAndTemplates={refreshCategoriesAndTemplates}
            />
          </div>

          {/* 3. font.txt Entegre Zengin Metin Düzenleyici */}
          <div className={`${mobileTab === 'settings' ? 'block' : 'hidden'} lg:block`}>
            <RichTextEditor
              slide={currentSlide}
              categories={categories}
              onChange={updateCurrentSlide}
            />
          </div>

          {/* 4. Sayfa Gösterge Noktaları */}
          <div className={`${mobileTab === 'settings' ? 'block' : 'hidden'} lg:block`}>
            <SlideSettings
              slide={currentSlide}
              onChange={updateCurrentSlide}
            />
          </div>

          {/* Mobilde 'preview' seçiliyken CanvasPreview'ın burada görünmesi */}
          <div className={`lg:hidden ${mobileTab === 'preview' ? 'block' : 'hidden'}`}>
            <CanvasPreview
              slide={currentSlide}
              slideIndex={activeSlideIndex}
              totalSlides={project.slides.length}
              aspectRatio={project.aspectRatio}
              categories={categories}
              onPrevSlide={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              onNextSlide={() => setActiveSlideIndex((prev) => Math.min(project.slides.length - 1, prev + 1))}
              onChangeSlide={updateCurrentSlide}
              projectTitle={project.title}
            />
          </div>
        </div>

        {/* SAĞ KOLON: Canlı Canvas Önizleme Paneli (Masaüstü için lg:col-span-5) */}
        <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-20 h-fit space-y-4">
          <CanvasPreview
            slide={currentSlide}
            slideIndex={activeSlideIndex}
            totalSlides={project.slides.length}
            aspectRatio={project.aspectRatio}
            categories={categories}
            onPrevSlide={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
            onNextSlide={() => setActiveSlideIndex((prev) => Math.min(project.slides.length - 1, prev + 1))}
            onChangeSlide={updateCurrentSlide}
            projectTitle={project.title}
          />
        </div>
      </main>

      {/* Dışa Aktarma & ZIP İndirme Modalı */}
      <ExportModal
        project={project}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

export default App;

