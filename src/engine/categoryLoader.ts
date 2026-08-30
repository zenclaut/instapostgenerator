import type { CategoryDefinition, CustomTemplate } from '../types/postTypes';

/**
 * Önceden tanımlı kategoriler (categories/ dizinindeki tüm dosyalarla senkronize)
 */
export const PRESET_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'haberler',
    name: 'Haberler',
    folderPath: '/categories/haberler',
    fontInfo: {
      boldFont: 'Metropolis Bold',
      mediumFont: 'Metropolis Medium',
      colors: [
        { name: 'Beyaz', color: '#FFFFFF' },
        { name: 'Kırmızı', color: '#FF5145' }
      ]
    },
    defaultLayers: [
      {
        id: 'gradient-bold',
        name: 'Koyu Alt Gradyan (gradient-bold.PNG)',
        filename: 'gradient-bold.PNG',
        imageUrl: '/categories/haberler/gradient-bold.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 10 // Bold olan, low olanın altında kalacak
      },
      {
        id: 'gradient-low',
        name: 'Hafif Alt Gradyan (gradient-low.PNG)',
        filename: 'gradient-low.PNG',
        imageUrl: '/categories/haberler/gradient-low.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 20 // Low olan, bold olanın üstünde
      },
      {
        id: 'gradient-full',
        name: 'Tam Boy Gradyan (gradient-full.PNG)',
        filename: 'gradient-full.PNG',
        imageUrl: '/categories/haberler/gradient-full.PNG',
        enabled: false,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 25
      },
      {
        id: 'corner',
        name: 'Köşe / Çerçeve (corner.PNG)',
        filename: 'corner.PNG',
        imageUrl: '/categories/haberler/corner.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 30
      },
      {
        id: 'name',
        name: 'Kategori Başlık Rozeti (name.PNG)',
        filename: 'name.PNG',
        imageUrl: '/categories/haberler/name.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 40
      },
      {
        id: 'logo',
        name: 'Logo / Filigran Kırmızı (logo.PNG)',
        filename: 'logo.PNG',
        imageUrl: '/categories/haberler/logo.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 50
      },
      {
        id: 'logo-white',
        name: 'Logo / Filigran Beyaz (logo-white.PNG)',
        filename: 'logo-white.PNG',
        imageUrl: '/categories/haberler/logo-white.PNG',
        enabled: false,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 52
      },
      {
        id: 'swipe',
        name: 'Yana Kaydır Rozeti (swipe.PNG)',
        filename: 'swipe.PNG',
        imageUrl: '/categories/haberler/swipe.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 60
      }
    ]
  },
  {
    id: 'oyun',
    name: 'Oyun',
    folderPath: '/categories/oyun',
    fontInfo: {
      boldFont: 'Metropolis Bold',
      mediumFont: 'Metropolis Medium',
      colors: [
        { name: 'Beyaz', color: '#FFFFFF' },
        { name: 'Pembe', color: '#F6049D' }
      ]
    },
    defaultLayers: [
      {
        id: 'gradient-bold',
        name: 'Koyu Alt Gradyan (gradient-bold.PNG)',
        filename: 'gradient-bold.PNG',
        imageUrl: '/categories/oyun/gradient-bold.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 10 // Bold olan altta
      },
      {
        id: 'gradient-low',
        name: 'Hafif Alt Gradyan (gradient-low.PNG)',
        filename: 'gradient-low.PNG',
        imageUrl: '/categories/oyun/gradient-low.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 20 // Low olan üstte
      },
      {
        id: 'gradient-full',
        name: 'Tam Boy Gradyan (gradient-full.PNG)',
        filename: 'gradient-full.PNG',
        imageUrl: '/categories/oyun/gradient-full.PNG',
        enabled: false,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 25
      },
      {
        id: 'corner',
        name: 'Köşe / Çerçeve (corner.PNG)',
        filename: 'corner.PNG',
        imageUrl: '/categories/oyun/corner.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 30
      },
      {
        id: 'name',
        name: 'Kategori Başlık Rozeti (name.PNG)',
        filename: 'name.PNG',
        imageUrl: '/categories/oyun/name.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 40
      },
      {
        id: 'logo',
        name: 'Logo / Filigran Renkli (logo.PNG)',
        filename: 'logo.PNG',
        imageUrl: '/categories/oyun/logo.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 50
      },
      {
        id: 'logo-white',
        name: 'Logo / Filigran Beyaz (logo-white.PNG)',
        filename: 'logo-white.PNG',
        imageUrl: '/categories/oyun/logo-white.PNG',
        enabled: false,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 52
      },
      {
        id: 'swipe',
        name: 'Yana Kaydır Rozeti (swipe.PNG)',
        filename: 'swipe.PNG',
        imageUrl: '/categories/oyun/swipe.PNG',
        enabled: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0,
        opacity: 100,
        zIndex: 60
      }
    ]
  }
];

/**
 * Varsayılan Hazır Şablonlar
 */
export const DEFAULT_CUSTOM_TEMPLATES: CustomTemplate[] = [
  {
    id: 'tmpl-haberler-tam',
    name: 'Haberler - Standart (Tüm Katmanlar & Yana Kaydır)',
    categoryId: 'haberler',
    layers: JSON.parse(JSON.stringify(PRESET_CATEGORIES[0].defaultLayers)),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPreset: true
  },
  {
    id: 'tmpl-haberler-sade',
    name: 'Haberler - Sade (Sadece Gradyan & Logo)',
    categoryId: 'haberler',
    layers: PRESET_CATEGORIES[0].defaultLayers.map((l) => ({
      ...l,
      enabled: l.id === 'gradient-bold' || l.id === 'logo'
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPreset: true
  },
  {
    id: 'tmpl-oyun-tam',
    name: 'Oyun - Standart (Tüm Katmanlar & Yana Kaydır)',
    categoryId: 'oyun',
    layers: JSON.parse(JSON.stringify(PRESET_CATEGORIES[1].defaultLayers)),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPreset: true
  },
  {
    id: 'tmpl-oyun-manset',
    name: 'Oyun - Manşet (Çerçeve, Gradyan & İsim)',
    categoryId: 'oyun',
    layers: PRESET_CATEGORIES[1].defaultLayers.map((l) => ({
      ...l,
      enabled: l.id !== 'logo' && l.id !== 'logo-white'
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPreset: true
  }
];
