/**
 * Liste aller teilnehmenden Schulen für das Rosen-Bestellsystem
 * Diese Namen müssen EXAKT mit organization.name in der Datenbank übereinstimmen
 */

export const SCHOOLS = [
  'Demo Schule SMV',
  'Gymnasium München',
  'Realschule München',
  'Hauptschule München',
  'Berufsschule München',
] as const;

/**
 * TypeScript Type für Schulnamen
 */
export type SchoolName = (typeof SCHOOLS)[number];

/**
 * Type Guard: Überprüft ob ein String ein gültiger Schulname ist
 */
export function isValidSchool(school: string): school is SchoolName {
  return SCHOOLS.includes(school as SchoolName);
}
