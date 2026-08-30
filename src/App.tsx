import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Download, 
  Flame
} from 'lucide-react';
import type { ProjectData, SlideData, AspectRatioType, CustomTemplate, CategoryDefinition } from './types/postTypes';
import { createNewProject, createNewSlide, initializeDatabase, SAMPLE_PROJECTS } from './db/postDatabase';
import { PRESET_CATEGORIES, DEFAULT_CUSTOM_TEMPLATES } from './engine/categoryLoader';
import { db } from './db/postDatabase';
import { SlideTabs } from './components/editor/SlideTabs';
import { ImageUploader } from './components/editor/ImageUploader';
import { LayerTemplateManager } from './components/editor/LayerTemplateManager';
import { RichTextEditor } from './components/editor/RichTextEditor';
import { SlideSettings } from './components/editor/SlideSettings';
import { CanvasPreview } from './components/preview/CanvasPreview';
import { ExportModal } from './components/export/ExportModal';

export function App() {
  // Aktif Proje State (Oturum boyunca RAM'de tutulur, geçmişe kaydedilmez)
  const [project, setProject] = useState<ProjectData>(() => SAMPLE_PROJECTS[0]);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Kategori ve Şablon State (IndexedDB'de tutulur)
  const [categories, setCategories] = useState<CategoryDefinition[]>(PRESET_CATEGORIES);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(DEFAULT_CUSTOM_TEMPLATES);

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

  // En-Boy Oranı Değiştirme
  const handleChangeAspectRatio = (aspectRatio: AspectRatioType) => {
    setProject((prev) => ({ ...prev, aspectRatio }));
  };

  // Yeni Boş Proje Başlat
  const handleCreateNewProject = () => {
    if (confirm('Yeni bir proje başlatmak istiyor musunuz?')) {
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
                <span>BGY POST GENERATOR</span>
                <span className="text-[10px] uppercase font-bold bg-red-600/30 border border-red-500/40 text-red-300 px-2 py-0.5 rounded-full">
                  Studio
                </span>
              </h1>
            </div>
          </div>

          {/* Hızlı İşlem Butonları */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Yeni Proje */}
            <button
              onClick={handleCreateNewProject}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors"
              title="Yeni Proje Başlat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Proje</span>
            </button>

            {/* Dışa Aktar & İndir (Ana Buton) */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-950/60 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Dışa Aktar & İndir</span>
            </button>
          </div>
        </div>
      </header>


      {/* Ana Çalışma Alanı (İki Kolonlu Stüdyo Arayüzü) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SOL KOLON: Editör ve Katman Paneli (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Carousel Sayfa Sekmeleri ("Sayfa Ekle", Sıralama, Çoğaltma) */}
          <SlideTabs
            slides={project.slides}
            activeSlideIndex={activeSlideIndex}
            onSelectSlide={setActiveSlideIndex}
            onAddSlide={handleAddSlide}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onMoveSlide={handleMoveSlide}
          />

          {/* 2. Görsel Yükleme & Kadrajlama (Carousel Sayfalarının hemen altında!) */}
          <ImageUploader
            slide={currentSlide}
            onChange={updateCurrentSlide}
          />

          {/* 3. Kategori Seçimi ve Katlanır Kartlar (Şablonlar & Görsel Katmanları) */}
          <LayerTemplateManager
            slide={currentSlide}
            categories={categories}
            customTemplates={customTemplates}
            onChange={updateCurrentSlide}
            onRefreshCategoriesAndTemplates={refreshCategoriesAndTemplates}
          />

          {/* 4. font.txt Entegre Zengin Metin Düzenleyici */}
          <RichTextEditor
            slide={currentSlide}
            categories={categories}
            onChange={updateCurrentSlide}
          />

          {/* 5. Sayfa Gösterge Noktaları */}
          <SlideSettings
            slide={currentSlide}
            onChange={updateCurrentSlide}
          />
        </div>

        {/* SAĞ KOLON: Canlı Canvas Önizleme Paneli (lg:col-span-5) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 h-fit space-y-4">
          <CanvasPreview
            slide={currentSlide}
            slideIndex={activeSlideIndex}
            totalSlides={project.slides.length}
            aspectRatio={project.aspectRatio}
            onPrevSlide={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
            onNextSlide={() => setActiveSlideIndex((prev) => Math.min(project.slides.length - 1, prev + 1))}
            onChangeAspectRatio={handleChangeAspectRatio}
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
