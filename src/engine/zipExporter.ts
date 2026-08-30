import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';
import type { ProjectData, SlideData, AspectRatioType } from '../types/postTypes';
import { renderSlideToCanvas } from './canvasRenderer';

export interface ExportProgress {
  current: number;
  total: number;
}

/**
 * Tek bir slaytı Canvas üzerinden Blob/DataURL olarak üretir.
 */
export async function renderSlideToBlob(
  slide: SlideData,
  slideIndex: number,
  totalSlides: number,
  aspectRatio: AspectRatioType,
  scaleFactor: number = 1
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await renderSlideToCanvas(canvas, {
    slide,
    slideIndex,
    totalSlides,
    aspectRatio,
    scaleFactor
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas Blob dönüştürülemedi'));
    }, 'image/png');
  });
}

/**
 * Tek bir slaytı Canvas üzerinden DataURL (base64) olarak üretir (Önizleme/Thumbnail için)
 */
export async function renderSlideToDataUrl(
  slide: SlideData,
  slideIndex: number,
  totalSlides: number,
  aspectRatio: AspectRatioType,
  scaleFactor: number = 0.5
): Promise<string> {
  const canvas = document.createElement('canvas');
  await renderSlideToCanvas(canvas, {
    slide,
    slideIndex,
    totalSlides,
    aspectRatio,
    scaleFactor
  });
  return canvas.toDataURL('image/jpeg', 0.85);
}

export const generateSlideDataUrl = renderSlideToDataUrl;

/**
 * Tüm proje slaytlarını ZIP olarak paketleyip indirir.
 */
export async function exportProjectAsZip(
  project: ProjectData,
  scaleFactor: number = 1,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  const zip = new JSZip();
  const total = project.slides.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) onProgress({ current: i + 1, total });
    const slide = project.slides[i];
    const blob = await renderSlideToBlob(slide, i, total, project.aspectRatio, scaleFactor);
    const fileName = `${String(i + 1).padStart(2, '0')}_bgy_post.png`;
    zip.file(fileName, blob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const safeTitle = project.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  saveAs(content, `${safeTitle || 'bgy_post'}_carousel.zip`);

  // Kutlama Konfetisi
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  });
}

/**
 * Tek bir slaytı PNG olarak doğrudan indirir.
 */
export async function downloadSingleSlide(
  slide: SlideData,
  index: number,
  totalSlides: number,
  aspectRatio: AspectRatioType,
  scaleFactor: number = 1,
  title: string = 'bgy_post'
): Promise<void> {
  const blob = await renderSlideToBlob(slide, index, totalSlides, aspectRatio, scaleFactor);
  const fileName = `${title}_sayfa_${index + 1}.png`;
  saveAs(blob, fileName);
}

/**
 * Slaytı panoya kopyalar (Doğrudan Instagram Web veya Photoshop'a yapıştırmak için)
 */
export async function copySlideToClipboard(
  slide: SlideData,
  index: number,
  totalSlides: number,
  aspectRatio: AspectRatioType
): Promise<boolean> {
  try {
    const blob = await renderSlideToBlob(slide, index, totalSlides, aspectRatio, 1);
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    return true;
  } catch (err) {
    console.error('Panoya kopyalama başarısız:', err);
    return false;
  }
}
