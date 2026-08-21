// Tests unitaires des helpers de grille officielle BAC.
// On vérifie surtout parsePoints (extraction du max d'une plage) et
// computeAdaptiveMax (max théorique adaptatif basé sur les cellules remplies).
import { parsePoints, computeAdaptiveMax, convertirNote } from '../grillesOfficielles';

describe('parsePoints — extraction du MAX d\'une saisie', () => {
  test('valeur unique', () => {
    expect(parsePoints('5')).toBe(5);
    expect(parsePoints('10')).toBe(10);
    expect(parsePoints('0')).toBe(0);
  });

  test('décimales (virgule ou point)', () => {
    expect(parsePoints('4.5')).toBe(4.5);
    expect(parsePoints('4,5')).toBe(4.5);
  });

  test('plage "4-5" → 5 (régression : ne PAS interpréter -5 comme négatif)', () => {
    expect(parsePoints('4-5')).toBe(5);
    expect(parsePoints('4 - 5')).toBe(5);
    expect(parsePoints('10-20')).toBe(20);
  });

  test('séparateurs variés', () => {
    expect(parsePoints('4 ou 5')).toBe(5);
    expect(parsePoints('4/5')).toBe(5);
    expect(parsePoints('4 / 5')).toBe(5);
    expect(parsePoints('4;5')).toBe(5);
  });

  test('entrée vide ou nulle', () => {
    expect(parsePoints('')).toBeNull();
    expect(parsePoints(null)).toBeNull();
    expect(parsePoints(undefined)).toBeNull();
    expect(parsePoints('texte sans chiffre')).toBeNull();
  });
});

describe('computeAdaptiveMax — max théorique basé sur cellules remplies', () => {
  const rows = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'];

  test('aucune cellule remplie → 0', () => {
    expect(computeAdaptiveMax({}, rows, 3)).toBe(0);
  });

  test('1 cellule B2 col 0 avec 5 pts → max = 5', () => {
    const cells = { '2_0': { text: 'desc B2', points: '5' } };
    expect(computeAdaptiveMax(cells, rows, 3)).toBe(5);
  });

  test('3 colonnes remplies à 5, 10, 3 → max = 18', () => {
    const cells = {
      '2_0': { text: 'desc', points: '5' },
      '1_1': { text: 'desc', points: '10' },
      '4_2': { text: 'desc', points: '3' },
    };
    expect(computeAdaptiveMax(cells, rows, 3)).toBe(18);
  });

  test('plages "4-5" et "3-7" comptent comme max (5 + 7 = 12)', () => {
    const cells = {
      '2_0': { text: 'desc', points: '4-5' },
      '3_1': { text: 'desc', points: '3-7' },
    };
    expect(computeAdaptiveMax(cells, rows, 2)).toBe(12);
  });

  test('cellule sans texte est ignorée même si elle a des points', () => {
    const cells = {
      '2_0': { text: 'desc', points: '5' },
      '1_0': { text: '', points: '10' }, // ignorée
    };
    expect(computeAdaptiveMax(cells, rows, 1)).toBe(5);
  });
});

describe('convertirNote — conversion proportionnelle sur totalPoints', () => {
  test('score = total → 20/20', () => {
    const r = convertirNote('COMP', 13, 'Seconde', 'LVA', 13);
    expect(r.note).toBe(20);
    expect(r.proportional).toBe(true);
  });

  test('score = 50% du total → 10/20', () => {
    const r = convertirNote('COMP', 6.5, 'Seconde', 'LVA', 13);
    expect(r.note).toBe(10);
    expect(r.proportional).toBe(true);
  });

  test('score > total (bonus généreux) → note > 20', () => {
    const r = convertirNote('COMP', 18, 'Seconde', 'LVA', 15);
    expect(r.note).toBe(24);
    expect(r.proportional).toBe(true);
  });

  test('Seconde sans totalPoints utilise la table LVA Première', () => {
    const r = convertirNote('COMP', 14, 'Seconde', 'LVA');
    expect(r.note).toBe(10);
    expect(r.niveau).toBe('B1');
  });
});
