/**
 * BGY (Büyük Geyik Yurdu) Monogram & Logo Vector Engine
 * Özgün BGY Monogram ikonunu SVG veya Canvas 2D Path olarak çizer.
 */

// BGY Monogram SVG Path tanımı (ölçeklenebilir 100x100 viewBox)
export const BGY_MONOGRAM_SVG_RAW = `
<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="bgy-logo-svg">
  <!-- B Harfi -->
  <path d="M 28 35 L 28 85 M 28 35 C 42 35 48 42 48 50 C 48 58 40 60 28 60 M 28 60 C 44 60 52 64 52 74 C 52 85 40 85 28 85" 
        stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <!-- G Harfi & Orta Kıvrım -->
  <path d="M 72 45 C 66 36 55 35 46 42 C 34 51 34 70 45 78 C 55 86 68 82 72 74 L 72 62 L 56 62" 
        stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <!-- Y Harfi ve BGY Ok/Kuyruk Detayı -->
  <path d="M 74 38 L 86 54 L 98 38 M 86 54 L 86 78 C 86 92 68 96 60 92" 
        stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        
  <!-- İnce Ok / Kuyruk Ucu -->
  <path d="M 94 36 L 102 38 L 100 46" 
        stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="60" cy="104" r="3" fill="currentColor" />
</svg>
`;

/**
 * Canvas 2D Context üzerinde BGY Monogramını yüksek netlikte çizen yardımcı fonksiyon
 */
export function drawBgyLogoOnCanvas(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  color: string = '#ffffff'
) {
  ctx.save();
  ctx.translate(centerX, centerY);
  
  // Boyut oranı (100 bazlı)
  const scale = size / 100;
  ctx.scale(scale, scale);
  ctx.translate(-60, -60); // Merkezle

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. 'B' Segmenti
  ctx.beginPath();
  ctx.moveTo(28, 35);
  ctx.lineTo(28, 85);
  ctx.bezierCurveTo(42, 35, 48, 42, 48, 50);
  ctx.bezierCurveTo(48, 58, 40, 60, 28, 60);
  ctx.bezierCurveTo(44, 60, 52, 64, 52, 74);
  ctx.bezierCurveTo(52, 85, 40, 85, 28, 85);
  ctx.stroke();

  // 2. 'G' Segmenti
  ctx.beginPath();
  ctx.arc(58, 60, 24, 0.2 * Math.PI, 1.8 * Math.PI, false);
  ctx.moveTo(82, 60);
  ctx.lineTo(58, 60);
  ctx.stroke();

  // 3. 'Y' ve Kuyruk / Anten Süsü
  ctx.beginPath();
  ctx.moveTo(76, 38);
  ctx.lineTo(88, 52);
  ctx.lineTo(100, 38);
  ctx.moveTo(88, 52);
  ctx.lineTo(88, 76);
  ctx.bezierCurveTo(88, 92, 70, 96, 60, 90);
  ctx.stroke();

  // Ok ucu detayı
  ctx.beginPath();
  ctx.moveTo(94, 35);
  ctx.lineTo(102, 38);
  ctx.lineTo(99, 46);
  ctx.stroke();

  // Alt nokta detayı
  ctx.beginPath();
  ctx.arc(60, 102, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
