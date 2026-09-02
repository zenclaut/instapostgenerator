import type { ProjectData } from '../types/postTypes';
import { PRESET_CATEGORIES } from './categoryLoader';

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
        highlightColor: '#FF5145',
        autoFontSize: true
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
        highlightColor: '#FF5145',
        autoFontSize: true
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
        highlightColor: '#F6049D',
        autoFontSize: true
      }
    ]
  }
];
