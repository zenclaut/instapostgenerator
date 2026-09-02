export type AspectRatioType = '4:5';

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
  folderPath?: string;     // '/categories/haberler'
  fontInfo: CategoryFontInfo;
  defaultLayers: TemplateLayer[];
  isCustom?: boolean;      // Kullanıcının kendi yarattığı kategori mi
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

export interface ImageOverlay {
  id: string;
  name?: string;
  imageUrl: string;
  x: number;               // Canvas coordinates (0..1080)
  y: number;               // Canvas coordinates (0..1440)
  width: number;           // Width in canvas pixels
  height: number;          // Height in canvas pixels
  rotation?: number;       // Rotation in degrees (-180..180, default 0)
  borderRadius?: number;   // Border radius in px (0 to max for circle)
  opacity?: number;        // Opacity (0..100%, default 100)
  zIndex?: number;         // Stack order
  borderWidth?: number;    // Border width in px
  borderColor?: string;    // Border color
  shadow?: boolean;        // Drop shadow toggle
  aspectRatioLocked?: boolean;
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

  // Fotoğraf Üstü Ek Fotoğraflar / Çıkartmalar
  overlays?: ImageOverlay[];
  
  // Yana Kaydır Rozeti (Fotoğraf bazında seçim)
  showSwipeIndicator: boolean;
  swipeText: string;
  swipeTextColor: string;
  
  // Sayfa Gösterge Noktaları
  showPaginationDots: boolean;
  
  // Tipografi, Hizalama & Konumlandırma
  fontSize: number;
  titleFontSize: number;
  titleColor?: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  textColor: string;
  highlightColor: string;     // Kategoriye özel vurgu rengi (#FF5145, #F6049D vb.)
  textOffsetX?: number;       // Metin yatay konumu (px)
  textOffsetY?: number;       // Metin dikey konumu (px)
  autoFontSize?: boolean;     // Metin uzunluğuna göre puntoyu otomatik ayarlama
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
