/**
 * Konvertiert Hex-Farbe zu RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Entferne # falls vorhanden
  hex = hex.replace(/^#/, '');

  // Parse 3-digit hex (#RGB)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // Parse 6-digit hex (#RRGGBB)
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b };
    }
  }

  return null;
}

/**
 * Konvertiert sRGB zu linearem RGB
 */
function sRGBToLinear(value: number): number {
  const normalized = value / 255;

  if (normalized <= 0.03928) {
    return normalized / 12.92;
  }

  return Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Berechnet relative Luminanz nach WCAG 2.0
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const rLinear = sRGBToLinear(r);
  const gLinear = sRGBToLinear(g);
  const bLinear = sRGBToLinear(b);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Gibt optimale Textfarbe (schwarz oder weiß) basierend auf Hintergrundfarbe zurück
 *
 * @param hex Hintergrundfarbe im Hex-Format (z.B. "#3B82F6" oder "3B82F6")
 * @returns '#000000' für helle Hintergründe, '#FFFFFF' für dunkle Hintergründe
 *
 * @example
 * getContrastColor('#FFFFFF') // => '#000000'
 * getContrastColor('#000000') // => '#FFFFFF'
 * getContrastColor('#3B82F6') // => '#FFFFFF' (blue)
 * getContrastColor('#FBBF24') // => '#000000' (yellow)
 */
export function getContrastColor(hex: string): '#000000' | '#FFFFFF' {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    // Fallback für ungültige Hex-Werte
    console.warn(`Invalid hex color: ${hex}, using white as fallback`);
    return '#FFFFFF';
  }

  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);

  // Threshold 0.5: Bei Luminanz > 0.5 ist die Farbe hell, nutze schwarzen Text
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
