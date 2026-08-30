import Dexie, { type Table } from 'dexie';
import type { ProjectData, SlideData, CustomTemplate, CategoryDefinition } from '../types/postTypes';
import { PRESET_CATEGORIES, DEFAULT_CUSTOM_TEMPLATES } from '../engine/categoryLoader';

export class PostGeneratorDB extends Dexie {
  projects!: Table<ProjectData, string>;
  customTemplates!: Table<CustomTemplate, string>;
  categories!: Table<CategoryDefinition, string>;

  constructor() {
    super('BgyPostGeneratorDB_v2');
    this.version(1).stores({
      projects: 'id, title, updatedAt, createdAt',
      customTemplates: 'id, categoryId, name, updatedAt',
      categories: 'id, name'
    });
  }
}

export const db = new PostGeneratorDB();

export const createNewSlide = (categoryId: string = 'haberler', index: number = 0): SlideData => {
  const category = PRESET_CATEGORIES.find((c) => c.id === categoryId) || PRESET_CATEGORIES[0];
  const primaryHighlight = category.fontInfo.colors.find((c) => c.color !== '#FFFFFF')?.color || '#FF5145';

  return {
    id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    categoryId: category.id,
    templateId: `tmpl-${category.id}-tam`,
    layers: JSON.parse(JSON.stringify(category.defaultLayers)),
    title: '',
    contentHtml: category.id === 'oyun' 
      ? '<span style="color: #F6049D; font-weight: bold;">GTA 6</span> için beklenen yeni tanıtım fragmanı yayınlandı. Oyun dünyasında <b>büyük yankı</b> uyandırdı.'
      : '<span style="color: #FF5145; font-weight: bold;">Somali</span> açıklarında <b>korsanlarca</b> kaçırılan Türk sahipli <b>MV LATUF</b> adlı <b>kargo gemisi</b>, ortak operasyonla <b>kurtarıldı</b>.',
    imageUrl: null,
    imageScale: 1.0,
    imageOffsetX: 0,
    imageOffsetY: 0,
    imageBrightness: 100,
    imageContrast: 100,
    showSwipeIndicator: index === 0, // İlk slaytta varsayılan açık
    swipeText: 'YANA KAYDIR ➔',
    swipeTextColor: '#FFFFFF',
    showPaginationDots: true,
    fontSize: 29,
    titleFontSize: 32,
    fontFamily: 'Montserrat',
    textAlign: 'center',
    textColor: '#FFFFFF',
    highlightColor: primaryHighlight
  };
};

export const createNewProject = (title: string = 'Yeni BGY Gönderisi', categoryId: string = 'haberler'): ProjectData => {
  return {
    id: `proj-${Date.now()}`,
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    aspectRatio: '4:5',
    slides: [createNewSlide(categoryId, 0)]
  };
};

// Demo Projeleri
export const SAMPLE_PROJECTS: ProjectData[] = [
  {
    id: 'sample-haberler',
    title: 'Haberler: Somali Kargo Gemisi Kurtarma Operasyonu',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
    aspectRatio: '4:5',
    slides: [
      {
        id: 'slide-h-1',
        categoryId: 'haberler',
        templateId: 'tmpl-haberler-tam',
        layers: JSON.parse(JSON.stringify(PRESET_CATEGORIES[0].defaultLayers)),
        title: '',
        contentHtml: '<span style="color: #FF5145; font-weight: bold;">Somali</span> açıklarında <b>korsanlarca</b> kaçırılan Türk sahipli <b>MV LATUF</b> adlı <b>kargo gemisi</b>, <b>Türk ve Somali</b> güçlerinin ortak operasyonuyla <b>kurtarıldı</b>.',
        imageUrl: null,
        imageScale: 1.0,
        imageOffsetX: 0,
        imageOffsetY: 0,
        imageBrightness: 100,
        imageContrast: 100,
        showSwipeIndicator: true,
        swipeText: 'YANA KAYDIR ➔',
        swipeTextColor: '#FFFFFF',
        showPaginationDots: true,
        fontSize: 30,
        titleFontSize: 32,
        fontFamily: 'Montserrat',
        textAlign: 'center',
        textColor: '#FFFFFF',
        highlightColor: '#FF5145'
      },
      {
        id: 'slide-h-2',
        categoryId: 'haberler',
        templateId: 'tmpl-haberler-tam',
        layers: JSON.parse(JSON.stringify(PRESET_CATEGORIES[0].defaultLayers)),
        title: 'Operasyonun Detayları:',
        contentHtml: 'Milli Savunma Bakanlığı, personelin sağlık durumunun iyi olduğunu ve geminin <b>güvenli limana</b> yanaştırıldığını duyurdu.',
        imageUrl: null,
        imageScale: 1.0,
        imageOffsetX: 0,
        imageOffsetY: 0,
        imageBrightness: 100,
        imageContrast: 100,
        showSwipeIndicator: false,
        swipeText: 'YANA KAYDIR ➔',
        swipeTextColor: '#FFFFFF',
        showPaginationDots: true,
        fontSize: 28,
        titleFontSize: 30,
        fontFamily: 'Montserrat',
        textAlign: 'center',
        textColor: '#FFFFFF',
        highlightColor: '#FF5145'
      }
    ]
  },
  {
    id: 'sample-oyun',
    title: 'Oyun: Yeni Çıkacak Büyük Yapımlar',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 3600000,
    aspectRatio: '4:5',
    slides: [
      {
        id: 'slide-o-1',
        categoryId: 'oyun',
        templateId: 'tmpl-oyun-tam',
        layers: JSON.parse(JSON.stringify(PRESET_CATEGORIES[1].defaultLayers)),
        title: '',
        contentHtml: '<span style="color: #F6049D; font-weight: bold;">GTA 6</span> ve yeni nesil <b>açık dünya oyunları</b> için beklenen çıkış tarihleri ve sistem gereksinimleri netleşmeye başladı.',
        imageUrl: null,
        imageScale: 1.0,
        imageOffsetX: 0,
        imageOffsetY: 0,
        imageBrightness: 100,
        imageContrast: 100,
        showSwipeIndicator: true,
        swipeText: 'YANA KAYDIR ➔',
        swipeTextColor: '#FFFFFF',
        showPaginationDots: true,
        fontSize: 30,
        titleFontSize: 32,
        fontFamily: 'Montserrat',
        textAlign: 'center',
        textColor: '#FFFFFF',
        highlightColor: '#F6049D'
      }
    ]
  }
];

export async function initializeDatabase() {
  const catCount = await db.categories.count();
  if (catCount === 0) {
    await db.categories.bulkAdd(PRESET_CATEGORIES);
  }

  const tmplCount = await db.customTemplates.count();
  if (tmplCount === 0) {
    await db.customTemplates.bulkAdd(DEFAULT_CUSTOM_TEMPLATES);
  }

  const projCount = await db.projects.count();
  if (projCount === 0) {
    await db.projects.bulkAdd(SAMPLE_PROJECTS);
  }
}
