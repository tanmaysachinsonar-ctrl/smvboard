import { getContrastColor } from '../../lib/color';

describe('getContrastColor', () => {
  describe('Schwarzer Text für helle Hintergründe', () => {
    it('sollte #000000 für weiß zurückgeben', () => {
      expect(getContrastColor('#FFFFFF')).toBe('#000000');
      expect(getContrastColor('FFFFFF')).toBe('#000000');
      expect(getContrastColor('#FFF')).toBe('#000000');
    });

    it('sollte #000000 für helle Farben zurückgeben', () => {
      expect(getContrastColor('#FBBF24')).toBe('#000000'); // Yellow
      expect(getContrastColor('#34D399')).toBe('#000000'); // Green
      expect(getContrastColor('#F472B6')).toBe('#000000'); // Pink
      expect(getContrastColor('#FCD34D')).toBe('#000000'); // Light yellow
    });
  });

  describe('Weißer Text für dunkle Hintergründe', () => {
    it('sollte #FFFFFF für schwarz zurückgeben', () => {
      expect(getContrastColor('#000000')).toBe('#FFFFFF');
      expect(getContrastColor('000000')).toBe('#FFFFFF');
      expect(getContrastColor('#000')).toBe('#FFFFFF');
    });

    it('sollte #FFFFFF für dunkle Farben zurückgeben', () => {
      expect(getContrastColor('#1E40AF')).toBe('#FFFFFF'); // Dark blue
      expect(getContrastColor('#7C2D12')).toBe('#FFFFFF'); // Dark brown
      expect(getContrastColor('#6B21A8')).toBe('#FFFFFF'); // Dark purple
      expect(getContrastColor('#991B1B')).toBe('#FFFFFF'); // Dark red
    });

    it('sollte #FFFFFF für Standard-Event-Farbe zurückgeben', () => {
      expect(getContrastColor('#3B82F6')).toBe('#FFFFFF'); // Blue-500
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit 3-stelligen Hex-Codes umgehen', () => {
      expect(getContrastColor('#F00')).toBe('#FFFFFF'); // Red
      expect(getContrastColor('#0F0')).toBe('#000000'); // Green
      expect(getContrastColor('#00F')).toBe('#FFFFFF'); // Blue
    });

    it('sollte mit Hex-Codes ohne # umgehen', () => {
      expect(getContrastColor('FFFFFF')).toBe('#000000');
      expect(getContrastColor('000000')).toBe('#FFFFFF');
      expect(getContrastColor('3B82F6')).toBe('#FFFFFF');
    });

    it('sollte #FFFFFF als Fallback für ungültige Werte zurückgeben', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(getContrastColor('invalid')).toBe('#FFFFFF');
      expect(getContrastColor('#XYZ')).toBe('#FFFFFF');
      expect(getContrastColor('')).toBe('#FFFFFF');

      expect(consoleSpy).toHaveBeenCalledTimes(3);
      consoleSpy.mockRestore();
    });
  });

  describe('Tailwind CSS Farben', () => {
    it('sollte korrekt für Tailwind-Farben funktionieren', () => {
      // Slate
      expect(getContrastColor('#64748B')).toBe('#FFFFFF'); // slate-500

      // Gray
      expect(getContrastColor('#6B7280')).toBe('#FFFFFF'); // gray-500

      // Red
      expect(getContrastColor('#EF4444')).toBe('#FFFFFF'); // red-500

      // Orange
      expect(getContrastColor('#F97316')).toBe('#FFFFFF'); // orange-500

      // Yellow
      expect(getContrastColor('#EAB308')).toBe('#000000'); // yellow-500

      // Green
      expect(getContrastColor('#22C55E')).toBe('#000000'); // green-500

      // Blue
      expect(getContrastColor('#3B82F6')).toBe('#FFFFFF'); // blue-500

      // Indigo
      expect(getContrastColor('#6366F1')).toBe('#FFFFFF'); // indigo-500

      // Purple
      expect(getContrastColor('#A855F7')).toBe('#FFFFFF'); // purple-500

      // Pink
      expect(getContrastColor('#EC4899')).toBe('#FFFFFF'); // pink-500
    });
  });
});
