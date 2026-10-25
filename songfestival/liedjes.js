// De songfestival-liedjes voor de kaartjes. id = nummer op het kaartje (staat in de QR-code), spotify = track-id.
// Nieuw liedje = regel erbij met een nieuw (hoger) nummer; nummers nooit hergebruiken, anders klopt een geprint kaartje niet meer.
const LIEDJES = [
  { id: 1, jaar: 1975, land: 'Nederland', vlag: '🇳🇱', artiest: 'Teach-In', titel: 'Ding-a-dong', spotify: '3ML1JVicjXbdsyYrPdfr5E', won: true },
  { id: 2, jaar: 2012, land: 'Zweden', vlag: '🇸🇪', artiest: 'Loreen', titel: 'Euphoria', spotify: '1xN7BpTAWnZkuSLOtRP6Qc', won: true },
  { id: 3, jaar: 2021, land: 'Italië', vlag: '🇮🇹', artiest: 'Måneskin', titel: 'Zitti e buoni', spotify: '776AftMmFFAWUIEAb3lHhw', won: true },
  { id: 4, jaar: 2024, land: 'Nederland', vlag: '🇳🇱', artiest: 'Joost', titel: 'Europapa', spotify: '0uHrMbMv3c78398pIANDqR', won: false },
];
