// Tests du parser CSV pour la distribution multi-élèves.
import { parseCsvStudents, generateDistributionHtml } from '../distributeStudents';

describe('parseCsvStudents — détection auto des colonnes', () => {
  test('vide', () => {
    expect(parseCsvStudents('')).toEqual([]);
    expect(parseCsvStudents(null)).toEqual([]);
    expect(parseCsvStudents('   \n  \n')).toEqual([]);
  });

  test('1 colonne, sans header — noms complets', () => {
    const r = parseCsvStudents('Marie Dupont\nPaul Durand\nLéa Martin');
    expect(r).toEqual([
      { name: 'Marie Dupont', classe: '' },
      { name: 'Paul Durand', classe: '' },
      { name: 'Léa Martin', classe: '' }
    ]);
  });

  test('CSV avec header nom/prenom (virgule)', () => {
    const csv = 'nom,prenom,classe\nDupont,Marie,1ere A\nDurand,Paul,1ere B';
    const r = parseCsvStudents(csv);
    expect(r).toEqual([
      { name: 'Marie Dupont', classe: '1ere A' },
      { name: 'Paul Durand', classe: '1ere B' }
    ]);
  });

  test('CSV avec point-virgule + header français', () => {
    const csv = 'Nom;Prénom;Classe\nMartin;Léa;Terminale 2';
    const r = parseCsvStudents(csv);
    expect(r[0].name).toBe('Léa Martin');
    expect(r[0].classe).toBe('Terminale 2');
  });

  test('CSV avec tabulation', () => {
    const csv = 'nom\tprenom\nDupont\tMarie';
    const r = parseCsvStudents(csv);
    expect(r[0].name).toBe('Marie Dupont');
  });

  test('ignore BOM en début de fichier', () => {
    const r = parseCsvStudents('\uFEFFnom\nDupont');
    expect(r).toEqual([{ name: 'Dupont', classe: '' }]);
  });

  test('lignes vides ignorées', () => {
    const r = parseCsvStudents('Marie Dupont\n\n\nPaul Durand\n');
    expect(r.length).toBe(2);
  });

  test('guillemets autour des cellules', () => {
    const csv = 'nom,prenom\n"Dupont","Marie"';
    const r = parseCsvStudents(csv);
    expect(r[0].name).toBe('Marie Dupont');
  });
});

describe('generateDistributionHtml — structure minimale', () => {
  const grille = {
    id: 'g1', name: 'Test', totalPoints: 15,
    rows: ['B1', 'A2'], cols: ['Critère 1', 'Critère 2'],
    rowsPoints: [5, 3],
    cells: { '0_0': { text: 'Descripteur B1 C1' } }
  };

  test('contient les noms des élèves', () => {
    const students = [{ name: 'Marie Dupont' }, { name: 'Paul Durand' }];
    const html = generateDistributionHtml(grille, students);
    expect(html).toContain('Marie Dupont');
    expect(html).toContain('Paul Durand');
  });

  test('contient le titre de la grille et le totalPoints', () => {
    const html = generateDistributionHtml(grille, [{ name: 'Marie' }]);
    expect(html).toContain('Test');
    expect(html).toContain('15');
  });

  test('échappe les </script> dans les données', () => {
    const benign = generateDistributionHtml(grille, [{ name: 'Marie' }]);
    const benignCount = (benign.match(/<\/script>/g) || []).length;
    const malicious = { ...grille, name: 'Hack </script><script>alert(1)</script>' };
    const html = generateDistributionHtml(malicious, [{ name: 'Marie' }]);
    const scriptCloseCount = (html.match(/<\/script>/g) || []).length;
    // Le nom malicieux ne doit pas pouvoir injecter de </script> supplémentaire
    expect(scriptCloseCount).toBe(benignCount);
  });

  test('contient le calcul JS parsePoints', () => {
    const html = generateDistributionHtml(grille, [{ name: 'Marie' }]);
    expect(html).toContain('parsePoints');
    expect(html).toContain('Math.max');
  });

  test('inclut un bouton de téléchargement par élève', () => {
    const html = generateDistributionHtml(grille, [{ name: 'Marie' }, { name: 'Paul' }]);
    // La fonction downloadStudent est définie + appelée via onclick (paramétrée au runtime)
    expect(html).toContain('window.downloadStudent');
    expect(html).toContain('onclick="downloadStudent(');
  });
});
