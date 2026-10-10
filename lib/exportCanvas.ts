import { Gender, Item, Slot } from './types';
import { getItem, getScene } from './data';
import { getFitEntry, FitEntry } from './fit';
import { generateShareUrl, generateQrDataUrl } from './qr';

export interface ComposeOutfitOptions {
  gender: Gender;
  itemIds: string[];
  sceneId: string;
  summaryText?: string;
  title?: string;
  fitData?: unknown;
  imageLoader?: (src: string) => Promise<HTMLImageElement | null>;
  strict?: boolean;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

// Ordered slots from bottom to top
const LAYER_ORDER: Slot[] = ['shoes', 'bottom', 'top', 'neck', 'head'];

/**
 * Loads an HTML Image with a robust 4000ms timeout for cold-cache and mobile networks.
 * Attempts asynchronous decode() when available.
 */
export function defaultLoadImage(src: string, timeoutMs = 4000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, timeoutMs);

    const onDone = (res: HTMLImageElement | null) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(res);
      }
    };

    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode()
          .then(() => onDone(img))
          .catch(() => onDone(img)); // fallback to loaded img even if decode promise rejects
      } else {
        onDone(img);
      }
    };
    img.onerror = () => onDone(null);
    img.src = src;
  });
}

/**
 * Draws an image with object-cover aspect fill behavior, matching CSS object-cover.
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dWidth: number,
  dHeight: number
) {
  const imgW = img.naturalWidth || img.width || dWidth;
  const imgH = img.naturalHeight || img.height || dHeight;
  const imgRatio = imgW / imgH;
  const targetRatio = dWidth / dHeight;

  let sx = 0;
  let sy = 0;
  let sWidth = imgW;
  let sHeight = imgH;

  if (imgRatio > targetRatio) {
    // Source is wider than destination: crop sides
    sWidth = imgH * targetRatio;
    sx = (imgW - sWidth) / 2;
  } else {
    // Source is taller than destination: crop top/bottom
    sHeight = imgW / targetRatio;
    sy = (imgH - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}

export async function composeOutfitCanvas(
  options: ComposeOutfitOptions
): Promise<HTMLCanvasElement | null> {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const {
    gender,
    itemIds,
    sceneId,
    summaryText,
    title = 'VIỆT PHỤC REMIX',
    fitData,
    imageLoader = defaultLoadImage,
    strict = false,
  } = options;

  // 1. Resolve equipped items by slot and prepare all image URLs
  const equippedBySlot: Partial<Record<Slot, Item>> = {};
  for (const id of itemIds) {
    const item = getItem(id);
    if (item && item.gender === gender) {
      equippedBySlot[item.slot] = item;
    }
  }

  const sceneSrc = `/assets/scenes/${sceneId}.jpg`;
  const baseSrc = `/assets/${gender}/${gender}_base.png`;

  const garmentSources: { slot: Slot; src: string; item: Item }[] = [];
  for (const slot of LAYER_ORDER) {
    const item = equippedBySlot[slot];
    if (!item) continue;

    let itemSrc = `/assets/${gender}/${item.image_file}`;
    if (item.id === "F_B_TOP_ao_giao_linh") {
      const bottom = equippedBySlot["bottom"];
      if (bottom?.kind === "vay_dai" || bottom?.id === "F_B_BOTTOM_vay_dai") {
        itemSrc = `/assets/female/F_B_TOP_ao_giao_linh_in_skirt.png`;
      } else {
        itemSrc = `/assets/female/F_B_TOP_ao_giao_linh.png`;
      }
    }
    garmentSources.push({ slot, src: itemSrc, item });
  }

  // QR Code URL (synced with actual outfit configuration)
  const qrShareUrl = generateShareUrl({ gender, itemIds, sceneId });
  const qrDataUrl = await generateQrDataUrl(qrShareUrl, { size: 160 });

  // 2. Preload ALL images in parallel (drastically faster than serial awaits)
  const [sceneImg, baseImg, qrImg, ...garmentImgs] = await Promise.all([
    imageLoader(sceneSrc),
    imageLoader(baseSrc),
    imageLoader(qrDataUrl),
    ...garmentSources.map((g) => imageLoader(g.src)),
  ]);

  // Strict check: In browser environment, fail if essential layers are missing
  if (strict && typeof window !== 'undefined') {
    if (!baseImg) {
      console.error(`composeOutfitCanvas: Missing base character image: ${baseSrc}`);
      return null;
    }
    for (let i = 0; i < garmentSources.length; i++) {
      if (!garmentImgs[i]) {
        console.error(`composeOutfitCanvas: Missing equipped garment: ${garmentSources[i].src}`);
        return null;
      }
    }
  }

  // 3. Draw Background Scene (full-bleed object-cover)
  ctx.fillStyle = '#FAF7F0';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (sceneImg) {
    drawImageCover(ctx, sceneImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // 4. Character Composite (Audit S08 Fix: Exact 9:16 aspect ratio preservation)
  // Character height in postcard: 1200px.
  // 9:16 aspect ratio: width = 1200 * (9 / 16) = 675px.
  // Centered horizontally, anchored to bottom.
  const charH = 1200;
  const charW = Math.round(charH * (9 / 16)); // exactly 675px
  const charX = Math.round((CANVAS_WIDTH - charW) / 2);
  const charY = CANVAS_HEIGHT - charH;

  // Draw Base Character
  if (baseImg) {
    ctx.drawImage(baseImg, charX, charY, charW, charH);
  }

  // Draw Garment Layers with exact fit mapping (Audit S08)
  for (let i = 0; i < garmentSources.length; i++) {
    const { item } = garmentSources[i];
    const garmentImg = garmentImgs[i];
    if (!garmentImg) continue;

    const fit: FitEntry = getFitEntry(item.id, fitData);
    const scale = fit.scale ?? 1;
    // Map logical 1080x1920 coordinates into charW x charH canvas space
    const offsetX = (fit.x / 1080) * charW;
    const offsetY = (fit.y / 1920) * charH;

    ctx.save();
    ctx.translate(charX + offsetX, charY + offsetY);
    ctx.scale(scale, scale);
    ctx.drawImage(garmentImg, 0, 0, charW, charH);
    ctx.restore();
  }

  // 5. Cultural Information Card Overlay at the bottom
  const cardMargin = 40;
  const cardW = CANVAS_WIDTH - cardMargin * 2;
  const cardH = 220;
  const cardY = CANVAS_HEIGHT - cardH - cardMargin;

  ctx.save();
  ctx.fillStyle = 'rgba(250, 247, 240, 0.94)';
  ctx.strokeStyle = '#DED3C4';
  ctx.lineWidth = 3;

  // Draw rounded card
  ctx.beginPath();
  const radius = 24;
  ctx.roundRect(cardMargin, cardY, cardW, cardH, radius);
  ctx.fill();
  ctx.stroke();

  // Top decorative border accent in red lacquer
  ctx.strokeStyle = '#8A1A10';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cardMargin + 30, cardY + 2);
  ctx.lineTo(cardMargin + cardW - 30, cardY + 2);
  ctx.stroke();

  // Draw branding title
  ctx.fillStyle = '#8A1A10';
  ctx.font = 'bold 32px Georgia, serif';
  ctx.fillText(title, cardMargin + 32, cardY + 48);

  // Subtitle / Scene context
  const scene = getScene(sceneId);
  const sceneName = scene?.name_vi || 'Không gian cổ phong';
  ctx.fillStyle = '#1A3B5C';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`Bối cảnh: ${sceneName}`, cardMargin + 32, cardY + 84);

  // QR Code on right side of card
  const qrSize = 130;
  const qrX = cardMargin + cardW - qrSize - 32;
  const qrY = cardY + 24;

  if (qrImg) {
    ctx.save();
    // QR white pill background
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#DED3C4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 12);
    ctx.fill();
    ctx.stroke();

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // Label below QR code
    ctx.fillStyle = '#8A1A10';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Quét để phối đồ', qrX + qrSize / 2, qrY + qrSize + 22);
    ctx.restore();
  }

  // Summary text (left column, bounded before QR code)
  if (summaryText) {
    ctx.fillStyle = '#2B2621';
    ctx.font = '19px sans-serif';

    const maxTextWidth = cardW - qrSize - 96;
    const words = summaryText.split(' ');
    let line = '';
    let lineY = cardY + 122;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && line) {
        ctx.fillText(line, cardMargin + 32, lineY);
        line = word;
        lineY += 27;
        if (lineY > cardY + cardH - 20) break;
      } else {
        line = testLine;
      }
    }
    if (line && lineY <= cardY + cardH - 20) {
      ctx.fillText(line, cardMargin + 32, lineY);
    }
  }

  ctx.restore();

  return canvas;
}

export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string = `viet-phuc-remix-${Date.now()}.png`
): boolean {
  if (typeof document === 'undefined') return false;

  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch {
    return false;
  }
}

export async function exportOutfitImage(
  options: ComposeOutfitOptions,
  filename?: string
): Promise<boolean> {
  const canvas = await composeOutfitCanvas(options);
  if (!canvas) return false;
  return downloadCanvasAsPng(canvas, filename);
}

export async function getOutfitCardBlob(
  options: ComposeOutfitOptions
): Promise<Blob | null> {
  const canvas = await composeOutfitCanvas(options);
  if (!canvas) return null;
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}
