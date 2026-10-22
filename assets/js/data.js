/* ==========================================================================
   Marienbräu — content data
   Edit dishes, prices, reviews and opening hours here; app.js renders them.
   ========================================================================== */

/* Opening hours by JS weekday (0 = Sunday … 6 = Saturday), minutes since
   midnight. 24:00 is stored as 1440. `null` = Ruhetag. */
window.MB_HOURS = {
  0: { open: 11 * 60 + 30, close: 20 * 60 },
  1: null,
  2: { open: 15 * 60, close: 24 * 60 },
  3: { open: 15 * 60, close: 24 * 60 },
  4: { open: 15 * 60, close: 24 * 60 },
  5: { open: 15 * 60, close: 24 * 60 },
  6: { open: 11 * 60 + 30, close: 24 * 60 }
};

/* Tags: veg | regional | house | beer | season.  `star` marks a house favourite. */
window.MB_MENU = [
  /* --- Steirische Klassiker --- */
  {
    cat: 'classics', price: 17.9, tags: ['regional', 'house'], star: true,
    de: { name: 'Original Steirisches Backhendl', desc: 'Knusprig goldbraun herausgebacken, dazu Erdäpfel-Vogerlsalat mit echtem steirischem Kürbiskernöl g.g.A. und Preiselbeeren.' },
    en: { name: 'Original Styrian Backhendl', desc: 'Crispy golden fried chicken with potato & lamb’s lettuce salad, genuine Styrian pumpkin seed oil (PGI) and lingonberries.' }
  },
  {
    cat: 'classics', price: 15.9, tags: ['regional'],
    de: { name: 'Steirischer Backhendlsalat', desc: 'Bunte Blattsalate, Erdäpfel, Kernöl-Dressing, geröstete Kürbiskerne und warme Backhendlstreifen.' },
    en: { name: 'Styrian Fried Chicken Salad', desc: 'Mixed leaf salad, potatoes, pumpkin seed oil dressing, toasted pumpkin seeds and warm crispy chicken strips.' }
  },
  {
    cat: 'classics', price: 16.5, tags: ['regional', 'house'],
    de: { name: 'Knuspriger Schweinsbraten', desc: 'Vom steirischen Landschwein mit krachender Schwarte, Serviettenknödel, warmem Speckkrautsalat und Bratensaft.' },
    en: { name: 'Crispy Roast Pork', desc: 'Styrian pork with crackling, bread dumpling, warm bacon cabbage salad and roast gravy.' }
  },
  {
    cat: 'classics', price: 19.9, tags: ['regional'],
    de: { name: 'Wiener Schnitzel vom Kalb', desc: 'In Butterschmalz goldgelb gebacken, mit Petersilerdäpfeln und Preiselbeeren.' },
    en: { name: 'Veal Wiener Schnitzel', desc: 'Fried golden in clarified butter, with parsley potatoes and lingonberries.' }
  },
  {
    cat: 'classics', price: 13.9, tags: ['veg', 'house'],
    de: { name: 'Steirische Käsespätzle', desc: 'Hausgemachte Spätzle mit würzigem Bergkäse und Röstzwiebeln, dazu ein kleiner grüner Salat.' },
    en: { name: 'Styrian Cheese Spätzle', desc: 'Homemade spätzle with tangy mountain cheese and crispy onions, served with a small green salad.' }
  },

  /* --- Aus dem Braukessel --- */
  {
    cat: 'brew', price: 4.9, tags: ['beer', 'house'], star: true, size: '0,5 l',
    de: { name: 'Marienbräu Zwickl', desc: 'Naturtrüb und unfiltriert, frisch vom Fass. Hefig, süffig, mit feiner Brotnote. (0,3 l € 3,90)' },
    en: { name: 'Marienbräu Zwickl', desc: 'Naturally cloudy and unfiltered, fresh from the barrel. Yeasty and easy-drinking. (0.3 l € 3.90)' }
  },
  {
    cat: 'brew', price: 4.7, tags: ['beer', 'house'], size: '0,5 l',
    de: { name: 'Marienbräu Märzen', desc: 'Bernsteinfarben und vollmundig, mit feiner Karamellnote. Das klassische Wirtshausbier. (0,3 l € 3,70)' },
    en: { name: 'Marienbräu Märzen', desc: 'Amber and full-bodied with a hint of caramel. The classic tavern beer. (0.3 l € 3.70)' }
  },
  {
    cat: 'brew', price: 5.4, tags: ['beer', 'season'], size: '0,5 l',
    de: { name: 'Saisonales Bockbier', desc: 'Kräftig und dunkel mit Röstmalz und Trockenfrüchten — nur solange der Sud reicht.' },
    en: { name: 'Seasonal Bock Beer', desc: 'Strong and dark with roasted malt and dried fruit — only while the batch lasts.' }
  },
  {
    cat: 'brew', price: 8.9, tags: ['beer'], size: '3 × 0,2 l',
    de: { name: 'Brauhaus-Verkostung', desc: 'Alle drei Hausbiere im Probierbrettl — ideal zum Kennenlernen unserer Braukunst.' },
    en: { name: 'Brewhouse Tasting Flight', desc: 'All three house beers on a tasting board — the perfect introduction to our brewing.' }
  },
  {
    cat: 'brew', price: 15.9, tags: ['regional', 'house'],
    de: { name: 'Märzen-Biergulasch', desc: 'Zart geschmortes Rindsgulasch mit unserem Märzen, dazu Semmelknödel.' },
    en: { name: 'Märzen Beer Goulash', desc: 'Tender beef goulash braised in our Märzen, served with a bread dumpling.' }
  },

  /* --- Jausn & Snacks --- */
  {
    cat: 'jause', price: 15.9, tags: ['regional', 'house'], star: true,
    de: { name: 'Steirische Brettljause', desc: 'Hausgemachtes Verhackert, Geselchtes, Speck, Bergkäse, frischer Kren, Pfefferoni und Bauernbrot.' },
    en: { name: 'Styrian Brettljause', desc: 'Platter with homemade Verhackert spread, smoked pork, bacon, mountain cheese, fresh horseradish and farmhouse bread.' }
  },
  {
    cat: 'jause', price: 6.9, tags: ['regional', 'house'],
    de: { name: 'Verhackertbrot', desc: 'Kerniges Bauernbrot mit steirischem Verhackert, Zwiebeln und frisch geriebenem Kren.' },
    en: { name: 'Verhackert on Bread', desc: 'Hearty farmhouse bread with Styrian Verhackert, onions and freshly grated horseradish.' }
  },
  {
    cat: 'jause', price: 12.9, tags: ['veg', 'regional'],
    de: { name: 'Käsebrettl vom Almbauern', desc: 'Auswahl regionaler Käsesorten mit Weintrauben, Nüssen und Kürbiskernbrot.' },
    en: { name: 'Alpine Cheese Board', desc: 'A selection of regional cheeses with grapes, nuts and pumpkin seed bread.' }
  },
  {
    cat: 'jause', price: 6.5, tags: ['veg', 'house'],
    de: { name: 'Liptauerbrot', desc: 'Hausgemachter Liptauer mit Paprika und Kümmel auf Bauernbrot, mit Radieschen.' },
    en: { name: 'Liptauer on Bread', desc: 'Homemade paprika & caraway cheese spread on farmhouse bread, with radishes.' }
  },
  {
    cat: 'jause', price: 9.9, tags: ['regional'],
    de: { name: 'Käferbohnensalat', desc: 'Steirische Käferbohnen mit roten Zwiebeln und reichlich Kernöl — ein steirisches Original.' },
    en: { name: 'Scarlet Runner Bean Salad', desc: 'Styrian runner beans with red onions and plenty of pumpkin seed oil — a Styrian original.' }
  },

  /* --- Desserts --- */
  {
    cat: 'dessert', price: 6.5, tags: ['veg', 'house'], star: true,
    de: { name: 'Warmer Apfelstrudel', desc: 'Hausgemacht mit steirischen Äpfeln, Rosinen und Zimt — mit Schlagobers oder Vanilleeis.' },
    en: { name: 'Warm Apple Strudel', desc: 'Homemade with Styrian apples, raisins and cinnamon — with whipped cream or vanilla ice cream.' }
  },
  {
    cat: 'dessert', price: 10.9, tags: ['veg', 'house'],
    de: { name: 'Kaiserschmarrn', desc: 'Flaumig in der Pfanne zerrissen, karamellisiert und mit hausgemachtem Zwetschkenröster.' },
    en: { name: 'Kaiserschmarrn', desc: 'Fluffy shredded pancake, caramelised and served with homemade plum compote.' }
  },
  {
    cat: 'dessert', price: 7.2, tags: ['veg', 'regional'],
    de: { name: 'Kürbiskernparfait', desc: 'Cremiges Parfait mit Kernöl-Karamell und gerösteten steirischen Kürbiskernen.' },
    en: { name: 'Pumpkin Seed Parfait', desc: 'Creamy parfait with pumpkin seed oil caramel and toasted Styrian pumpkin seeds.' }
  }
];

/* SAMPLE REVIEWS — illustrative copy written for this template, themed on what
   guests praise most (Backhendl, quick friendly service, cosy Stube, beer
   garden). Replace them with verbatim quotes from the Google Business profile
   (with the reviewer's consent / per Google's terms) before going live. */
window.MB_REVIEWS = [
  {
    name: 'Christina M.', color: '#c86d3b',
    de: 'Das beste Backhendl weit und breit! Außen richtig knusprig, innen saftig — und der Erdäpfelsalat mit Kernöl ist ein Traum. Wir kommen sicher wieder.',
    en: 'The best Backhendl far and wide! Properly crispy outside, juicy inside — and the potato salad with pumpkin seed oil is a dream. We’ll definitely be back.'
  },
  {
    name: 'Markus H.', color: '#1b3322',
    de: 'Super schnelles und herzliches Service, obwohl die Hütte voll war. Man fühlt sich vom ersten Moment an willkommen.',
    en: 'Really quick and warm-hearted service even though the place was packed. You feel welcome from the very first moment.'
  },
  {
    name: 'Sabine K.', color: '#9c4f26',
    de: 'Urgemütliche Gaststube mit den Kupferkesseln — so stellt man sich ein echtes steirisches Wirtshaus vor. Das Zwickl ist hervorragend!',
    en: 'A wonderfully cosy Stube with the copper kettles — exactly what you picture a real Styrian inn to be. The Zwickl is outstanding!'
  },
  {
    name: 'Thomas W.', color: '#e5a93b',
    de: 'Im Sommer gibt es nichts Schöneres als den Gastgarten unter den alten Bäumen. Schattig, ruhig und das Bier eiskalt.',
    en: 'In summer there’s nothing nicer than the beer garden under the old trees. Shady, peaceful and the beer ice-cold.'
  },
  {
    name: 'Elisabeth P.', color: '#2f5a3c',
    de: 'Schweinsbraten mit krachender Schwarte und flaumigen Serviettenknödeln — wie bei der Oma. Preis-Leistung top.',
    en: 'Roast pork with crunchy crackling and fluffy bread dumplings — just like grandma’s. Excellent value for money.'
  },
  {
    name: 'Andreas G.', color: '#7a3d12',
    de: 'Wir haben eine Geburtstagsfeier gemacht: alles perfekt organisiert, Brettljause und Kaiserschmarrn waren ein Gedicht.',
    en: 'We held a birthday party here: everything perfectly organised, and the Brettljause and Kaiserschmarrn were a delight.'
  },
  {
    name: 'Julia R.', color: '#c86d3b',
    de: 'Freundliche Wirtsleute, ehrliche Küche und selbstgebrautes Bier. Ein echter Geheimtipp am Stadtrand von Graz!',
    en: 'Friendly hosts, honest cooking and home-brewed beer. A real hidden gem on the edge of Graz!'
  }
];
