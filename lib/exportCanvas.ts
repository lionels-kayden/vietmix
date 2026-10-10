import { Gender, Item, Slot } from './types';
import { getItem, getScene } from './data';
import { getFitEntry, getFitLayerStyle, FitEntry } from './fit';
import { generateShareUrl, generateQrDataUrl } from './qr';

export interface ComposeOutfitOptions {
  gender: Gender;
  itemIds: string[];
  sceneId: string;
  summaryText?: string;
  title?: string;
  fitData?: unknown;
  imageLoader?: (src: string) => Promise<HTMLImageElement | null>;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

// Ordered slots
const LAYER_ORDER: Slot[] = ['shoes', 'bottom', 'top', 'neck', 'head'];

function defaultLoadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Safe fallback timeout for jsdom or network failure
    const timer = setTimeout(() => {
      resolve(null);
    }, 150);

    const onDone = (res: HTMLImageElement | null) => {
      clearTimeout(timer);
      resolve(res);
    };

    img.onload = () => onDone(img);
    img.onerror = () => onDone(null);
    img.src = src;
  });
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
  } = options;

  // 1. Draw Background Scene (full-bleed or top background)
  ctx.fillStyle = '#FAF7F0';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const sceneSrc = `/assets/scenes/${sceneId}.jpg`;
  const sceneImg = await imageLoader(sceneSrc);
  if (sceneImg) {
    // Draw scene covering full canvas
    ctx.drawImage(sceneImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // 2. Character composite at 85% scale centered at bottom
  // Character frame: 85% width = 918, 85% height = 1147, bottom-anchored
  const charW = Math.round(CANVAS_WIDTH * 0.85);
  const charH = Math.round(CANVAS_HEIGHT * 0.85);
  const charX = Math.round((CANVAS_WIDTH - charW) / 2);
  const charY = CANVAS_HEIGHT - charH;

  // Load and draw Base Character
  const baseSrc = `/assets/${gender}/${gender}_base.png`;
  const baseImg = await imageLoader(baseSrc);
  if (baseImg) {
    ctx.drawImage(baseImg, charX, charY, charW, charH);
  }

  // Resolve equipped items by slot
  const equippedBySlot: Partial<Record<Slot, Item>> = {};
  for (const id of itemIds) {
    const item = getItem(id);
    if (item && item.gender === gender) {
      equippedBySlot[item.slot] = item;
    }
  }

  // Draw garment layers in order: shoes, bottom, top, neck, head
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
    const garmentImg = await imageLoader(itemSrc);
    if (!garmentImg) continue;

    const fit: FitEntry = getFitEntry(item.id, fitData);
    const fitStyle = getFitLayerStyle(fit);

    // Apply fit offsets
    const scale = fit.scale ?? 1;
    const offsetX = (fit.x / 1080) * charW;
    const offsetY = (fit.y / 1920) * charH;

    ctx.save();
    ctx.translate(charX + offsetX, charY + offsetY);
    ctx.scale(scale, scale);
    ctx.drawImage(garmentImg, 0, 0, charW, charH);
    ctx.restore();
  }

  // 3. Cultural Information Card Overlay at the bottom
  const cardMargin = 40;
  const cardW = CANVAS_WIDTH - cardMargin * 2;
  const cardH = 220;
  const cardY = CANVAS_HEIGHT - cardH - cardMargin;

  // Draw semi-transparent paper backdrop with rounded corners
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
  const qrShareUrl = generateShareUrl({ gender, itemIds, sceneId });
  const qrDataUrl = await generateQrDataUrl(qrShareUrl, { size: 160 });
  const qrImg = await imageLoader(qrDataUrl);

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
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}
