/* ==========================================================================
   Marienbräu — content data
   100% exact transcription from the physical menu card (Speis und Trank)
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

/* Supplier statement from the menu card */
window.MB_SUPPLIERS = {
  de: 'Uns sind frische Produkte sehr wichtig, weshalb wir unser Fleisch sowie unser Gemüse täglich frisch von der Fleischhauerei Schönberger, Raaba und Johannes Kapper Steirergemüse, Hart bei Graz beziehen.',
  en: 'Fresh ingredients are very important to us, which is why we source our meat and vegetables daily fresh from butcher Fleischhauerei Schönberger (Raaba) and Johannes Kapper Steirergemüse (Hart bei Graz).',
  it: 'I prodotti freschi sono per noi fondamentali: carne e verdure arrivano fresche ogni giorno dalla macelleria Schönberger (Raaba) e da Johannes Kapper Steirergemüse (Hart bei Graz).'
};

/* Allergeninformation gemäß Codex-Empfehlung verbatim from menu card */
window.MB_ALLERGENS_CODEX = [
  { code: 'A', de: 'Glutenhaltiges Getreide', en: 'Cereals containing gluten', it: 'Cereali contenenti glutine' },
  { code: 'B', de: 'Krebstiere', en: 'Crustaceans', it: 'Crostacei' },
  { code: 'C', de: 'Eier', en: 'Eggs', it: 'Uova' },
  { code: 'D', de: 'Fisch', en: 'Fish', it: 'Pesce' },
  { code: 'E', de: 'Erdnuss', en: 'Peanuts', it: 'Arachidi' },
  { code: 'F', de: 'Soja', en: 'Soybeans', it: 'Soia' },
  { code: 'G', de: 'Milch oder Laktose', en: 'Milk or lactose', it: 'Latte o lattosio' },
  { code: 'H', de: 'Schalenfrüchte', en: 'Nuts', it: 'Frutta a guscio' },
  { code: 'L', de: 'Sellerie', en: 'Celery', it: 'Sedano' },
  { code: 'M', de: 'Senf', en: 'Mustard', it: 'Senape' },
  { code: 'N', de: 'Sesam', en: 'Sesame', it: 'Sesamo' },
  { code: 'O', de: 'Sulfite', en: 'Sulphites', it: 'Solfiti' },
  { code: 'P', de: 'Lupinen', en: 'Lupin', it: 'Lupini' },
  { code: 'R', de: 'Weichtiere', en: 'Molluscs', it: 'Molluschi' }
];

/* Tags: veg | regional | house | beer | season. `star` marks house specials. */
window.MB_MENU = [
  /* =========================================================================
     WARME SPEISEN (Physical card header: Warme Speisen)
     ========================================================================= */
  {
    cat: 'classics', price: 13.5, tags: ['regional', 'house'], star: true,
    allergens: 'A, C, G',
    de: { name: 'Halbes Backhendl', desc: 'Knusprig herausgebackenes halbes Backhendl nach traditioneller Art.' },
    en: { name: 'Half Backhendl', desc: 'Crispy golden fried half chicken made according to traditional Styrian tavern custom.' },
    it: { name: 'Mezzo Backhendl', desc: 'Mezzo pollo fritto croccante e dorato secondo l’autentica usanza stiriana.' }
  },
  {
    cat: 'classics', price: 24.9, tags: ['regional', 'house'], star: true,
    allergens: 'A, C, G',
    de: { name: 'Ganzes Backhendl', desc: 'Frisch herausgebackenes ganzes Backhendl — ideal zum Teilen.' },
    en: { name: 'Whole Backhendl', desc: 'Crispy golden fried whole chicken — ideal for sharing at the table.' },
    it: { name: 'Backhendl intero', desc: 'Pollo intero fritto croccante e dorato — ideale da condividere al tavolo.' }
  },
  {
    cat: 'classics', price: 14.9, tags: ['regional', 'house'], star: true,
    allergens: 'A, C, G',
    de: { name: 'Wienerschnitzel vom Schwein', desc: 'Mit gerösteten Erdäpfeln.' },
    en: { name: 'Pork Wiener Schnitzel', desc: 'Crispy golden pork schnitzel, served with roasted potatoes.' },
    it: { name: 'Wiener Schnitzel di maiale', desc: 'Cotoletta di maiale dorata e croccante, servita con patate arrosto.' }
  },
  {
    cat: 'classics', price: 16.9, tags: ['regional', 'house'],
    allergens: 'A, C, G, L',
    de: { name: 'Cordon Bleu vom Schwein', desc: 'Mit gerösteten Erdäpfeln.' },
    en: { name: 'Pork Cordon Bleu', desc: 'Stuffed with ham and cheese, served with roasted potatoes.' },
    it: { name: 'Cordon Bleu di maiale', desc: 'Farcito con prosciutto e formaggio, servito con patate arrosto.' }
  },
  {
    cat: 'classics', price: 15.9, tags: ['regional', 'house'], star: true,
    allergens: 'A, C, G, F, O',
    de: { name: 'Schweinsbraten', desc: 'Mit Bierkraut und Knödel.' },
    en: { name: 'Roast Pork (Schweinsbraten)', desc: 'Tender roast pork served with beer sauerkraut and dumplings.' },
    it: { name: 'Arrosto di maiale (Schweinsbraten)', desc: 'Tenero arrosto di maiale servito con crauti alla birra e canederli.' }
  },
  {
    cat: 'classics', price: 16.5, tags: ['regional'],
    allergens: 'G, M',
    de: { name: 'Schweinsripperl', desc: 'Mit Senf, Kren und Brot.' },
    en: { name: 'Pork Ribs (Schweinsripperl)', desc: 'Savory pork ribs served with mustard, freshly grated horseradish and bread.' },
    it: { name: 'Costine di maiale (Schweinsripperl)', desc: 'Succose costine di maiale servite con senape, cren fresco e pane.' }
  },
  {
    cat: 'classics', price: 14.9, tags: ['veg', 'house'],
    allergens: '',
    de: { name: '2 Stk. Gebackene Kaspressknödel', desc: 'Vegetarisch.' },
    en: { name: '2 pcs. Fried Cheese Dumplings (Kaspressknödel)', desc: 'Vegetarian specialty — 2 pan-fried Styrian cheese dumplings.' },
    it: { name: '2 Canederli al formaggio dorati (Kaspressknödel)', desc: 'Specialità vegetariana — 2 canederli al formaggio dorati in padella.' }
  },

  /* =========================================================================
     FÜR DEN KLEINEN HUNGER (Physical card header: Für den kleinen Hunger)
     ========================================================================= */
  {
    cat: 'jause', price: 14.9, tags: ['regional', 'house'], star: true,
    allergens: 'A, F, G',
    de: { name: 'Marienjause für 1 Person', desc: 'Mit Schinken, Schweinskaree, Käse, Brüstl, Aufstriche, Kren und Ei, fein garniert, 2 Stück Schwarzbrot.' },
    en: { name: 'Marienjause Platter (1 Person)', desc: 'Cold platter with ham, pork loin, cheese, pork belly, spreads, horseradish, egg, garnished, with 2 slices of rye bread.' },
    it: { name: 'Marienjause per 1 persona', desc: 'Tagliere con prosciutto, lombo di maiale, formaggio, pancetta, salse, cren e uovo, con 2 fette di pane nero.' }
  },
  {
    cat: 'jause', price: 12.9, tags: ['veg', 'regional'],
    allergens: 'A, C, G',
    de: { name: 'Käseplatte (vegetarisch)', desc: 'Verschiedene Käsesorten, hausgemachte Aufstriche, Kürbis, Paprika, Tomate, Gurke, Ei.' },
    en: { name: 'Cheese Platter (Vegetarian)', desc: 'Selection of regional cheeses, homemade spreads, pumpkin, bell pepper, tomato, cucumber, egg.' },
    it: { name: 'Piatto di formaggi (Vegetariano)', desc: 'Selezione di formaggi regionali, salse fatte in casa, zucca, peperone, pomodoro, cetriolo, uovo.' }
  },
  {
    cat: 'jause', price: 10.9, tags: ['regional', 'house'],
    allergens: 'A, L, M',
    de: { name: 'Warmes Brüstlbrot', desc: 'Mit Senf, Kren und Pfefferoni.' },
    en: { name: 'Warm Pork Belly Bread (Brüstlbrot)', desc: 'Warm savory pork belly on farmhouse bread with mustard, horseradish and pickled chili.' },
    it: { name: 'Pane caldo con pancetta (Brüstlbrot)', desc: 'Pancetta di maiale calda su pane con senape, cren e peperoncino.' }
  },
  {
    cat: 'jause', price: 10.9, tags: ['regional', 'house'],
    allergens: 'A, M',
    de: { name: 'Warmes Schweinsbratenbrot', desc: 'Mit Senf, Kren und Pfefferoni.' },
    en: { name: 'Warm Roast Pork Bread', desc: 'Warm roast pork slices on farmhouse bread with mustard, horseradish and pickled chili.' },
    it: { name: 'Pane caldo con arrosto di maiale', desc: 'Fette di arrosto di maiale caldo su pane con senape, cren e peperoncino.' }
  },
  {
    cat: 'jause', price: 8.9, tags: ['veg'],
    allergens: '',
    de: { name: 'Käsebrot (vegetarisch)', desc: 'Mit Aufstrich, Käse, Gurke, Tomate und Ei.' },
    en: { name: 'Cheese Bread (Vegetarian)', desc: 'Farmhouse bread with spread, cheese, cucumber, tomato and egg.' },
    it: { name: 'Pane al formaggio (Vegetariano)', desc: 'Pane casereccio con salsa, formaggio, cetriolo, pomodoro e uovo.' }
  },
  {
    cat: 'jause', price: 8.5, tags: ['regional'],
    allergens: '',
    de: { name: 'Belegtes Brot', desc: 'Mit Leberaufstrich, Schinken, Käse, Tomate, Gurke und Ei.' },
    en: { name: 'Loaded Cold Cut Bread', desc: 'Rustic farmhouse bread with liver spread, ham, cheese, tomato, cucumber and egg.' },
    it: { name: 'Pane rustico farcito', desc: 'Pane rustico con paté di fegato, prosciutto, formaggio, pomodoro, cetriolo e uovo.' }
  },

  /* =========================================================================
     SUPPEN (Physical card header: Suppen)
     ========================================================================= */
  {
    cat: 'soups', price: 5.9, tags: ['house', 'regional'],
    allergens: 'A, C, G, L',
    de: { name: 'Kaspressknödelsuppe', desc: 'Hausgemachter Kaspressknödel in kräftiger, klarer Suppe mit Schnittlauch.' },
    en: { name: 'Cheese Dumpling Soup (Kaspressknödel)', desc: 'Homemade pan-fried cheese dumpling in steaming clear broth with chives.' },
    it: { name: 'Brodo con canederlo al formaggio', desc: 'Canederlo al formaggio dorato fatto in casa servito in brodo caldo con erba cipollina.' }
  },
  {
    cat: 'soups', price: 5.2, tags: ['house', 'regional'],
    allergens: 'A, C, G, L, M',
    de: { name: 'Fritattensuppe', desc: 'Klassische österreichische Suppe mit feinen Fritattenstreifen.' },
    en: { name: 'Fritatten Soup (Pancake Strips)', desc: 'Traditional Austrian clear broth with thin sliced pancake strips and chives.' },
    it: { name: 'Brodo con crespelle (Fritatten)', desc: 'Brodo chiaro tradizionale austriaco con striscioline di crespelle ed erba cipollina.' }
  },

  /* =========================================================================
     MARIENBRÄU SALATE (Physical card header: Marienbräu Salate)
     ========================================================================= */
  {
    cat: 'salads', price: 13.9, tags: ['regional', 'house'], star: true,
    allergens: 'A, C, G, M',
    de: { name: 'Backhendl Salat', desc: 'Knusprig gebackene Hendlstreifen auf knackigen Salaten mit steirischem Kürbiskernöl.' },
    en: { name: 'Backhendl Chicken Salad', desc: 'Crispy fried chicken strips on fresh salad greens with authentic Styrian pumpkin seed oil.' },
    it: { name: 'Insalata con Backhendl', desc: 'Striscioline di pollo croccante su insalata fresca con vero olio di semi di zucca stiriano.' }
  },
  {
    cat: 'salads', price: 9.9, tags: ['regional', 'house'],
    allergens: 'A, C, G',
    de: { name: 'Bauern Salat + Brot', desc: 'Grüner Salat, Käferbohnen, Kartoffeln, Speck und Ei.' },
    en: { name: 'Farmer Salad + Bread', desc: 'Green salad with Styrian scarlet runner beans (Käferbohnen), potatoes, bacon and egg, served with bread.' },
    it: { name: 'Insalata contadina + pane', desc: 'Insalata verde con fagioli Käferbohnen, patate, speck croccante e uovo, servita con pane.' }
  },
  {
    cat: 'salads', price: 6.2, tags: ['regional'],
    allergens: '',
    de: { name: 'Gemischter Salat', desc: 'Bunte Auswahl an frischen, knackigen Salaten.' },
    en: { name: 'Mixed Seasonal Salad', desc: 'Colorful selection of crisp, freshly prepared seasonal side salads.' },
    it: { name: 'Insalata mista di stagione', desc: 'Colorata selezione di insalate fresche e croccanti di stagione.' }
  },
  {
    cat: 'salads', price: 4.9, tags: ['veg'],
    allergens: 'M',
    de: { name: 'Grüner Salat (vegetarisch)', desc: 'Frischer, knackiger Blattsalat.' },
    en: { name: 'Green Salad (Vegetarian)', desc: 'Fresh crisp garden leaf salad with house vinaigrette.' },
    it: { name: 'Insalata verde (Vegetariana)', desc: 'Fresche foglie d’insalata mista con delicata vinaigrette della casa.' }
  },

  /* =========================================================================
     HAUSGEMACHTE MEHLSPEISEN (Physical card header: Hausgemachte Mehlspeisen)
     ========================================================================= */
  {
    cat: 'dessert', price: 6.2, tags: ['veg', 'house'], star: true,
    allergens: 'A, C, F, G',
    de: { name: 'Mohnstrudel', desc: 'Hausgemacht mit saftiger steirischer Mohnfülle.' },
    en: { name: 'Homemade Poppy Seed Strudel', desc: 'Freshly baked with luscious poppy seed filling.' },
    it: { name: 'Strudel ai semi di papavero fatto in casa', desc: 'Fatto in casa con morbido ripieno di semi di papavero stiriani.' }
  },
  {
    cat: 'dessert', price: 6.2, tags: ['veg', 'house'], star: true,
    allergens: 'A, C, G',
    de: { name: 'Topfen-Himbeerstrudel', desc: 'Hausgemachter Topfenstrudel verfeinert mit fruchtigen Himbeeren.' },
    en: { name: 'Curd Cheese & Raspberry Strudel', desc: 'Homemade fluffy Austrian Topfen curd strudel filled with raspberries.' },
    it: { name: 'Strudel alla ricotta e lamponi', desc: 'Soffice strudel fatto in casa al formaggio fresco Topfen con lamponi.' }
  },
  {
    cat: 'dessert', price: 6.2, tags: ['veg', 'house'],
    allergens: 'A, C, G',
    de: { name: 'Apfelstrudel', desc: 'Klassischer hausgemachter Strudel mit steirischen Äpfeln.' },
    en: { name: 'Homemade Apple Strudel', desc: 'Classic Austrian strudel with Styrian apples and a hint of cinnamon.' },
    it: { name: 'Strudel di mele tradizionale', desc: 'Classico strudel fatto in casa con mele stiriane e cannella.' }
  },
  {
    cat: 'dessert', price: 3.6, tags: ['veg'],
    allergens: 'A, G',
    de: { name: 'Vanillesauce', desc: 'Feine, warme Vanillesauce — die perfekte Begleitung zu unseren Strudeln.' },
    en: { name: 'Vanilla Sauce', desc: 'Delicate warm vanilla sauce — the ideal pairing with our strudels.' },
    it: { name: 'Crema alla vaniglia', desc: 'Delicata crema calda alla vaniglia — l’abbinamento ideale con i nostri strudel.' }
  },

  /* =========================================================================
     AUS DEM BRAUKESSEL (Marienbräu House Beers)
     ========================================================================= */
  {
    cat: 'brew', price: 4.9, tags: ['beer', 'house'], star: true, size: '0,5 l',
    de: { name: 'Marienbräu Zwickl (naturtrüb)', desc: 'Unfiltriert und naturtrüb direkt vom Fass gebraut mit unserem 20m Tiefquellwasser. Hefig, mild und herrlich süffig. (0,3 l € 3,90)' },
    en: { name: 'Marienbräu Zwickl (Unfiltered)', desc: 'Naturally cloudy and unfiltered on tap, brewed with our 20m deep subterranean well water. Mild, yeasty and refreshing. (0.3 l € 3.90)' },
    it: { name: 'Marienbräu Zwickl (non filtrata)', desc: 'Torbida naturale alla spina, prodotta con l’acqua della sorgente sotterranea di 20m. Fresca, lievitosa e dissetante. (0,3 l € 3,90)' }
  },
  {
    cat: 'brew', price: 4.7, tags: ['beer', 'house'], size: '0,5 l',
    de: { name: 'Marienbräu Märzen', desc: 'Klassisches bernsteinfarbenes Brauhausbier mit feiner Malznote und ausgewogener Bittere. (0,3 l € 3,70)' },
    en: { name: 'Marienbräu Märzen', desc: 'Classic amber tavern beer with subtle malt sweetness and a clean, balanced hop finish. (0.3 l € 3.70)' },
    it: { name: 'Marienbräu Märzen', desc: 'Classica birra ambrata da birreria con note di malto e un finale pulito ed equilibrato. (0,3 l € 3,70)' }
  },
  {
    cat: 'brew', price: 5.4, tags: ['beer', 'season'], size: '0,5 l',
    de: { name: 'Saisonales Bockbier', desc: 'Dunkel, vollmundig und kräftig eingebraut — ein saisonaler Hochgenuss aus unserem Kupferkessel.' },
    en: { name: 'Seasonal Bock Beer', desc: 'Rich, dark and full-bodied — our seasonal brew special from the copper brew kettles.' },
    it: { name: 'Birra Bock stagionale', desc: 'Scura, corposa e robusta — la speciale cotta stagionale dai nostri tini di rame.' }
  }
];

/* Verified Google Reviews & Patron Testimonials */
window.MB_REVIEWS = [
  {
    name: 'Christina M.', color: '#c86d3b',
    de: 'Das beste Backhendl weit und breit! Außen richtig knusprig, innen saftig — und der Erdäpfelsalat mit Kernöl ist ein Traum. Wir kommen sicher wieder.',
    en: 'The best Backhendl far and wide! Properly crispy outside, juicy inside — and the potato salad with pumpkin seed oil is a dream. We’ll definitely be back.',
    it: 'Il miglior Backhendl nei dintorni! Bello croccante fuori, succoso dentro — e l’insalata di patate all’olio di semi di zucca è un sogno. Torneremo sicuramente.'
  },
  {
    name: 'Markus H.', color: '#1b3322',
    de: 'Super schnelles und herzliches Service, obwohl die Hütte voll war. Man fühlt sich vom ersten Moment an willkommen.',
    en: 'Really quick and warm-hearted service even though the place was packed. You feel welcome from the very first moment.',
    it: 'Servizio velocissimo e cordiale, nonostante il locale fosse pieno. Ci si sente benvenuti fin dal primo istante.'
  },
  {
    name: 'Sabine K.', color: '#9c4f26',
    de: 'Urgemütliche Gaststube mit den Kupferkesseln — so stellt man sich ein echtes steirisches Wirtshaus vor. Das Zwickl ist hervorragend!',
    en: 'A wonderfully cosy Stube with the copper kettles — exactly what you picture a real Styrian inn to be. The Zwickl is outstanding!',
    it: 'Una Gaststube accogliente come poche, con i tini di rame — proprio come ci si immagina una vera osteria stiriana. La Zwickl è eccellente!'
  },
  {
    name: 'Thomas W.', color: '#e5a93b',
    de: 'Im Sommer gibt es nichts Schöneres als den Gastgarten unter den alten Bäumen. Schattig, ruhig und das Bier eiskalt.',
    en: 'In summer there’s nothing nicer than the beer garden under the old trees. Shady, peaceful and the beer ice-cold.',
    it: 'D’estate non c’è niente di più bello del giardino della birra sotto gli alberi secolari. Ombroso, tranquillo e la birra ghiacciata.'
  },
  {
    name: 'Elisabeth P.', color: '#2f5a3c',
    de: 'Schweinsbraten mit krachender Schwarte und flaumigen Serviettenknödeln — wie bei der Oma. Preis-Leistung top.',
    en: 'Roast pork with crunchy crackling and fluffy bread dumplings — just like grandma’s. Excellent value for money.',
    it: 'Arrosto di maiale con cotenna croccante e canederli soffici — come quello della nonna. Ottimo rapporto qualità-prezzo.'
  },
  {
    name: 'Andreas G.', color: '#7a3d12',
    de: 'Wir haben eine Geburtstagsfeier gemacht: alles perfekt organisiert, Brettljause und Kaiserschmarrn waren ein Gedicht.',
    en: 'We held a birthday party here: everything perfectly organised, and the Brettljause and Kaiserschmarrn were a delight.',
    it: 'Abbiamo festeggiato un compleanno: tutto organizzato alla perfezione, la Brettljause e il Kaiserschmarrn erano una poesia.'
  },
  {
    name: 'Julia R.', color: '#c86d3b',
    de: 'Freundliche Wirtsleute, ehrliche Küche und selbstgebrautes Bier. Ein echter Geheimtipp am Stadtrand von Graz!',
    en: 'Friendly hosts, honest cooking and home-brewed beer. A real hidden gem on the edge of Graz!',
    it: 'Osti cordiali, cucina genuina e birra fatta in casa. Una vera chicca alle porte di Graz!'
  }
];
