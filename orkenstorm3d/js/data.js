// Gegevens van eenheden, gebouwen en levels. Overgenomen uit de 2D-versie (orkenstorm.html).
// Afstanden en snelheden zijn in "pixels" van 32 per tegel, net als in 2D; tijden in beeldjes (60 per seconde).

export const UNIT = {
  werker: { n: 'Werker', hp: 30, dmg: 3, rng: 22, cd: 60, spd: 1.1, sight: 4, side: 'h', cost: [50, 0], time: 300, from: ['kasteel'] },
  soldaat: { n: 'Soldaat', hp: 60, dmg: 8, rng: 22, cd: 50, spd: 1, sight: 4, side: 'h', cost: [60, 10], time: 420, from: ['kazerne'] },
  boog: { n: 'Boogschutter', hp: 40, dmg: 6, rng: 130, cd: 70, spd: 1, sight: 5, side: 'h', cost: [50, 25], time: 420, from: ['kazerne'] },
  ork: { n: 'Ork', hp: 55, dmg: 8, rng: 22, cd: 55, spd: 0.9, sight: 4, side: 'o' },
  speerork: { n: 'Speerwerper', hp: 35, dmg: 6, rng: 110, cd: 75, spd: 0.9, sight: 5, side: 'o' },
};

export const BLD = {
  kasteel: { n: 'Kasteel', w: 3, h: 3, hp: 400, food: 4, side: 'h' },
  boerderij: { n: 'Boerderij', w: 2, h: 2, hp: 120, food: 4, cost: [50, 30], time: 600, side: 'h' },
  kazerne: { n: 'Kazerne', w: 3, h: 3, hp: 250, cost: [100, 60], time: 900, side: 'h' },
  toren: { n: 'Toren', w: 2, h: 2, hp: 150, cost: [80, 50], time: 700, side: 'h', dmg: 7, rng: 160, cd: 70 },
  orkhut: { n: 'Orkenhut', w: 2, h: 2, hp: 250, side: 'o' },
};

export const DIFF = [
  { n: 'Makkelijk', hp: 0.7, dmg: 0.7, wave: 1.35, extra: -1, res: 1.5 },
  { n: 'Normaal', hp: 1, dmg: 1, wave: 1, extra: 0, res: 1 },
  { n: 'Moeilijk', hp: 1.35, dmg: 1.3, wave: 0.8, extra: 1, res: 0.8 },
];

export const LEVELS = [
  {
    naam: 'Het nieuwe dorp',
    brief: [
      'De koning geeft je een stukje land aan de rand van het bos.',
      'Bouw er een dorp met 4 boerderijen en een kazerne.',
      'Klik op een werker en daarna op een boom om hout te hakken,',
      'of op de goudmijn om goud te halen.',
      'Er zwerven orks rond onder de wolken. Ze laten je met rust',
      'zolang je niet te dichtbij komt.',
    ],
    doel: 'Bouw 4 boerderijen en een kazerne',
    goud: 150, hout: 80, bouw: ['boerderij', 'kazerne'],
    map: [
      'TTTTTTTT......TTTTTTTTTT',
      'TTTTTT..........TTTTTTTT',
      'TTTT..............TTTTTT',
      'TT.......MM........TTTTT',
      'T........MM.........TTTT',
      'T....................TTT',
      'TT...................TTT',
      'TTT.....WWWW..........TT',
      'TTT....WWWWWW.........TT',
      'TT.....WWWWWW..........T',
      'T.......WWWW...........T',
      'T......................T',
      '......................TT',
      'TT....................TT',
      'TTT..................TTT',
      'TTTT...........TT....TTT',
      'TTT...........TTTT....TT',
      'TT............TTTT.....T',
      'T..............TT......T',
      'T......................T',
      'TT.....................T',
      'TTT.......MM...........T',
      'TTT.......MM..........TT',
      'TT...................TTT',
      'T...................TTTT',
      'T..................TTTTT',
      'T.................TTTTTT',
      'TT.......TTT.....TTTTTTT',
      'TTTT.....TTTT.TTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    b: [['kasteel', 3, 24]],
    u: [['werker', 7, 25], ['werker', 7, 26], ['soldaat', 6, 23]],
    o: [['ork', 11, 5], ['ork', 7, 5], ['ork', 19, 11], ['ork', 3, 12], ['ork', 14, 2]],
    huts: [],
    win: (s) => s.count('boerderij') >= 4 && s.count('kazerne') >= 1,
  },
];

// Waar de mannetjes vandaan komen: wat ze vasthouden en wat werkers extra kunnen
export const LAND = {
  nl: { n: 'Nederlander', ding: 'een kaasje', effect: 'Zuinig: brengt 2 goud extra mee uit de mijn' },
  en: { n: 'Engelsman', ding: 'een kopje thee', effect: 'Hakt sneller hout, maar houdt af en toe theepauze' },
  de: { n: 'Duitser', ding: 'een pul', effect: 'Grondig: bouwt sneller' },
  it: { n: 'Italiaan', ding: 'een pizza', effect: 'Deelt pizza uit: geneest gewonde mannetjes vlakbij' },
  fr: { n: 'Fransman', ding: 'een stokbrood', effect: 'Snel: is maar kort in de goudmijn' },
};

// Levels uit de 2D-versie die nog naar 3D moeten
export const BINNENKORT = ['De orks komen eraan', 'De gevangen werkers', 'De Donkere Mijnen', 'Het Woud van Elwynn', 'De belegerde abdij'];
