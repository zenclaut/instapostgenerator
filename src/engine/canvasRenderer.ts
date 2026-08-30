import type { SlideData, AspectRatioType } from '../types/postTypes';


export interface RenderCanvasOptions {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  aspectRatio: AspectRatioType;
  scaleFactor?: number; // 1 for 1080p, 2 for 2160p Ultra HD
}

export interface TextSpan {
  text: string;
  bold: boolean;
  italic: boolean;
  color: string;
  underline: boolean;
  isBreak?: boolean;
}

export interface LineSpan {
  spans: TextSpan[];
  totalWidth: number;
}

/**
 * HTML içeriğini Canvas üzerinde çizilebilecek stilize kelime parçacıklarına dönüştürür.
 */
export function parseHtmlToSpans(html: string, defaultColor: string = '#FFFFFF'): TextSpan[] {
  if (typeof window === 'undefined') return [{ text: html, bold: false, italic: false, color: defaultColor, underline: false }];
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild || doc.body;

  const result: TextSpan[] = [];

  function traverse(node: Node, state: { bold: boolean; italic: boolean; color: string; underline: boolean }) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.length > 0) {
        result.push({
          text,
          bold: state.bold,
          italic: state.italic,
          color: state.color,
          underline: state.underline
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === 'br') {
        result.push({ text: '\n', bold: false, italic: false, color: defaultColor, underline: false, isBreak: true });
        return;
      }

      let nextState = { ...state };

      if (tag === 'b' || tag === 'strong') {
        nextState.bold = true;
      }
      if (tag === 'i' || tag === 'em') {
        nextState.italic = true;
      }
      if (tag === 'u') {
        nextState.underline = true;
      }

      if (el.style.color) {
        nextState.color = el.style.color;
      } else if (el.getAttribute('color')) {
        nextState.color = el.getAttribute('color')!;
      }

      for (let i = 0; i < el.childNodes.length; i++) {
        traverse(el.childNodes[i], nextState);
      }

      if (tag === 'p' || tag === 'div') {
        result.push({ text: '\n', bold: false, italic: false, color: defaultColor, underline: false, isBreak: true });
      }
    }
  }

  traverse(root, { bold: false, italic: false, color: defaultColor, underline: false });
  return result;
}

const imageCache = new Map<string, HTMLImageElement>();
export function preloadImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) {
    const cached = imageCache.get(url)!;
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = (err) => {
      console.warn(`Resim yüklenemedi: ${url}`, err);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Ana Canvas Render Motoru:
 * 1. Arka plan fotoğrafı (kadraj ve filtreler)
 * 2. categories/ altındaki gerçek PNG katmanları (corner, gradient-bold, gradient-low, logo, name)
 * 3. font.txt fontu ile zengin metin açıklaması
 * 4. Yana kaydır ve sayfa noktaları
 */
export async function renderSlideToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderCanvasOptions
): Promise<void> {
  const { slide, slideIndex, totalSlides, aspectRatio, scaleFactor = 1 } = options;

  const baseWidth = 1080;
  const baseHeight = aspectRatio === '4:5' ? 1350 : 1080;

  const width = baseWidth * scaleFactor;
  const height = baseHeight * scaleFactor;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.scale(scaleFactor, scaleFactor);

  // 1. Arka Plan Siyah Zemin
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // 2. Kullanıcının Arka Plan Fotoğrafı
  if (slide.imageUrl) {
    try {
      const img = await preloadImage(slide.imageUrl);

      ctx.save();
      let filterString = '';
      if (slide.imageBrightness !== 100) filterString += `brightness(${slide.imageBrightness}%) `;
      if (slide.imageContrast !== 100) filterString += `contrast(${slide.imageContrast}%) `;
      if (filterString) ctx.filter = filterString.trim();

      const imgRatio = img.width / img.height;
      const targetRatio = baseWidth / baseHeight;

      let drawWidth = baseWidth;
      let drawHeight = baseHeight;

      if (imgRatio > targetRatio) {
        drawHeight = baseHeight;
        drawWidth = baseHeight * imgRatio;
      } else {
        drawWidth = baseWidth;
        drawHeight = baseWidth / imgRatio;
      }

      drawWidth *= slide.imageScale;
      drawHeight *= slide.imageScale;

      const posX = (baseWidth - drawWidth) / 2 + slide.imageOffsetX;
      const posY = (baseHeight - drawHeight) / 2 + slide.imageOffsetY;

      ctx.drawImage(img, posX, posY, drawWidth, drawHeight);
      ctx.restore();
    } catch (e) {
      console.warn('Arka plan görseli çizilemedi:', e);
    }
  }

  // 3. categories/ Klasöründeki Gerçek Resim Katmanlarını Çiz (Z-Index Sırasına Göre)
  // Not: gradient-bold altta, gradient-low üstte kalacak şekilde sıralanır.
  const activeLayers = (slide.layers || [])
    .filter((l) => l.enabled)
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const layer of activeLayers) {
    try {
      const layerImg = await preloadImage(layer.imageUrl);
      ctx.save();

      // Opaklık (Saydamlık)
      const op = Math.max(0, Math.min(100, layer.opacity ?? 100)) / 100;
      ctx.globalAlpha = op;

      // Katman Boyutu ve Konumu
      const scale = layer.scale || 1.0;
      const offX = layer.offsetX || 0;
      const offY = layer.offsetY || 0;

      // Tam ekran kaplayan katmanlar (corner, gradient-bold, gradient-low) veya özel boyut
      const isFullScreenAsset = layer.filename.includes('gradient') || layer.filename.includes('corner');

      if (isFullScreenAsset) {
        const drawW = baseWidth * scale;
        const drawH = baseHeight * scale;
        const drawX = ((baseWidth - drawW) / 2) + offX;
        const drawY = ((baseHeight - drawH) / 2) + offY;
        ctx.drawImage(layerImg, drawX, drawY, drawW, drawH);
      } else {
        // Logo veya Name gibi yerel öğeler: Kendi boyutunda veya 1080p bazında ölçeklendir
        if (layerImg.width >= 800) {
          const drawW = baseWidth * scale;
          const drawH = baseHeight * scale;
          const drawX = ((baseWidth - drawW) / 2) + offX;
          const drawY = ((baseHeight - drawH) / 2) + offY;
          ctx.drawImage(layerImg, drawX, drawY, drawW, drawH);
        } else {
          const drawW = (layerImg.width * (baseWidth / 1080)) * scale;
          const drawH = (layerImg.height * (baseHeight / 1350)) * scale;
          const drawX = ((baseWidth - drawW) / 2) + offX;
          const drawY = (baseHeight - drawH - 60) + offY;
          ctx.drawImage(layerImg, drawX, drawY, drawW, drawH);
        }
      }


      ctx.restore();
    } catch (err) {
      console.warn(`Katman resmi yüklenemedi: ${layer.imageUrl}`, err);
    }
  }

  // 4. Metin Alanı ve Tipografi Yerleşimi
  const contentPaddingX = 80;
  const maxTextWidth = baseWidth - (contentPaddingX * 2);
  const bottomReservedArea = 140;
  const textBottomAnchor = baseHeight - bottomReservedArea;

  const fontFam = slide.fontFamily || 'Metropolis, Montserrat, sans-serif';
  const bodyFontSize = slide.fontSize || 29;
  const lineHeight = bodyFontSize * 1.42;
  const titleFontSize = slide.titleFontSize || 32;
  const titleLineHeight = titleFontSize * 1.35;

  let titleLines: string[] = [];
  if (slide.title && slide.title.trim().length > 0) {
    ctx.font = `800 ${titleFontSize}px ${fontFam}`;
    titleLines = wrapPlainString(ctx, slide.title, maxTextWidth);
  }

  const rawSpans = parseHtmlToSpans(slide.contentHtml, slide.textColor || '#FFFFFF');
  const wrappedLines = wrapRichSpans(ctx, rawSpans, maxTextWidth, bodyFontSize, fontFam);

  const totalTitleHeight = titleLines.length > 0 ? (titleLines.length * titleLineHeight) + 16 : 0;
  const totalBodyHeight = wrappedLines.length * lineHeight;
  const totalContentBlockHeight = totalTitleHeight + totalBodyHeight;

  let currentDrawY = textBottomAnchor - totalContentBlockHeight + 10;

  // Başlık Çizimi
  if (titleLines.length > 0) {
    ctx.save();
    ctx.font = `800 ${titleFontSize}px ${fontFam}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = slide.textAlign || 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;

    const startX = slide.textAlign === 'center' ? baseWidth / 2 : (slide.textAlign === 'right' ? baseWidth - contentPaddingX : contentPaddingX);

    for (const tLine of titleLines) {
      ctx.fillText(tLine, startX, currentDrawY + titleFontSize);
      currentDrawY += titleLineHeight;
    }
    currentDrawY += 16;
    ctx.restore();
  }

  // Gövde Metni Çizimi (Kelime bazlı Bold / Renk / İtalik)
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.95)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  for (const line of wrappedLines) {
    let lineStartX = contentPaddingX;
    if (slide.textAlign === 'center') {
      lineStartX = (baseWidth - line.totalWidth) / 2;
    } else if (slide.textAlign === 'right') {
      lineStartX = baseWidth - contentPaddingX - line.totalWidth;
    }

    let cursorX = lineStartX;
    const textBaselineY = currentDrawY + bodyFontSize;

    for (const span of line.spans) {
      let fontStyle = '';
      if (span.italic) fontStyle += 'italic ';
      fontStyle += span.bold ? '800 ' : '500 ';
      fontStyle += `${bodyFontSize}px ${fontFam}`;

      ctx.font = fontStyle;
      ctx.fillStyle = span.color || '#FFFFFF';
      ctx.textAlign = 'left';

      ctx.fillText(span.text, cursorX, textBaselineY);

      if (span.underline) {
        const textWidth = ctx.measureText(span.text).width;
        ctx.lineWidth = 2;
        ctx.strokeStyle = span.color || '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(cursorX, textBaselineY + 4);
        ctx.lineTo(cursorX + textWidth, textBaselineY + 4);
        ctx.stroke();
      }

      cursorX += ctx.measureText(span.text).width;
    }

    currentDrawY += lineHeight;
  }
  ctx.restore();

  // 5. Yana Kaydır ➔ Rozeti (Sağ Alt)
  if (slide.showSwipeIndicator) {
    ctx.save();
    ctx.font = `800 20px ${fontFam}`;
    ctx.fillStyle = slide.swipeTextColor || '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.letterSpacing = '1.5px';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 6;

    const swipeY = baseHeight - 65;
    const swipeX = baseWidth - 70;
    ctx.fillText(slide.swipeText || 'YANA KAYDIR ➔', swipeX, swipeY);
    ctx.restore();
  }

  // 6. Sayfa Gösterge Noktaları (Pagination Dots)
  if (slide.showPaginationDots && totalSlides > 1) {
    ctx.save();
    const dotRadius = 4;
    const dotSpacing = 16;
    const totalDotsWidth = (totalSlides - 1) * dotSpacing;
    const startDotX = (baseWidth - totalDotsWidth) / 2;
    const dotsY = baseHeight - 32;

    for (let i = 0; i < totalSlides; i++) {
      const dotX = startDotX + (i * dotSpacing);
      ctx.beginPath();
      ctx.arc(dotX, dotsY, dotRadius, 0, Math.PI * 2);

      if (i === slideIndex) {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(255,255,255,0.7)';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

function wrapPlainString(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function wrapRichSpans(
  ctx: CanvasRenderingContext2D,
  spans: TextSpan[],
  maxWidth: number,
  fontSize: number,
  fontFamily: string
): LineSpan[] {
  const lines: LineSpan[] = [];
  let currentSpans: TextSpan[] = [];
  let currentLineWidth = 0;

  function pushLine() {
    if (currentSpans.length > 0) {
      lines.push({
        spans: currentSpans,
        totalWidth: currentLineWidth
      });
      currentSpans = [];
      currentLineWidth = 0;
    }
  }

  for (const span of spans) {
    if (span.isBreak) {
      pushLine();
      continue;
    }

    const wordsWithSpaces = span.text.match(/(\s+|\S+)/g) || [span.text];

    for (const part of wordsWithSpaces) {
      let fontStyle = '';
      if (span.italic) fontStyle += 'italic ';
      fontStyle += span.bold ? '800 ' : '500 ';
      fontStyle += `${fontSize}px ${fontFamily}`;
      ctx.font = fontStyle;

      const partWidth = ctx.measureText(part).width;

      if (currentLineWidth + partWidth > maxWidth && currentSpans.length > 0 && part.trim() !== '') {
        pushLine();
      }

      currentSpans.push({
        ...span,
        text: part
      });
      currentLineWidth += partWidth;
    }
  }

  pushLine();
  return lines;
}
