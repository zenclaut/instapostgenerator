export type AspectRatioType = '4:5' | '1:1';

export interface CategoryColor {
  name: string;
  color: string;
}

export interface CategoryFontInfo {
  boldFont: string;
  mediumFont: string;
  colors: CategoryColor[];
}

export interface TemplateLayer {
  id: string;              // e.g. 'gradient-bold', 'gradient-low', 'corner', 'logo', 'name'
  name: string;            // e.g. 'Koyu Gradyan (gradient-bold.PNG)'
  filename: string;        // 'gradient-bold.PNG'
  imageUrl: string;        // '/categories/haberler/gradient-bold.PNG'
  enabled: boolean;        // Tik (Aktif / Deaktif)
  offsetX: number;         // X konumu (px)
  offsetY: number;         // Y konumu (px)
  scale: number;           // Boyut / Ölçek (0.5 - 2.5)
  opacity: number;         // Saydamlık (0 - 100%)
  zIndex: number;          // Katman sırası (küçük olan altta kalır)
  isCustom?: boolean;      // Kullanıcının sonradan yüklediği görsel mi
}

export interface CategoryDefinition {
  id: string;              // 'haberler' | 'oyun' | custom
  name: string;            // 'Haberler' | 'Oyun'
  folderPath: string;      // '/categories/haberler'
  fontInfo: CategoryFontInfo;
  defaultLayers: TemplateLayer[];
}

export interface CustomTemplate {
  id: string;
  name: string;
  categoryId: string;
  layers: TemplateLayer[];
  createdAt: number;
  updatedAt: number;
  isPreset?: boolean;
}

export interface SlideData {
  id: string;
  categoryId: string;         // 'haberler' | 'oyun' vb.
  templateId: string;         // Seçili şablon ID'si
  layers: TemplateLayer[];    // Bu slayta özel katman ayarları (tikler, konumlar, boyutlar)
  
  // Metin & İçerik
  title: string;
  contentHtml: string;
  
  // Arka Plan Fotoğrafı & Kadrajlama
  imageUrl: string | null;
  imageScale: number;
  imageOffsetX: number;
  imageOffsetY: number;
  imageBrightness: number;
  imageContrast: number;
  
  // Yana Kaydır Rozeti (Fotoğraf bazında seçim)
  showSwipeIndicator: boolean;
  swipeText: string;
  swipeTextColor: string;
  
  // Sayfa Gösterge Noktaları
  showPaginationDots: boolean;
  
  // Tipografi & Hizalama
  fontSize: number;
  titleFontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  textColor: string;
  highlightColor: string;     // Kategoriye özel vurgu rengi (#FF5145, #F6049D vb.)
}

export interface ProjectData {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  aspectRatio: AspectRatioType;
  slides: SlideData[];
  thumbnailUrl?: string;
}
