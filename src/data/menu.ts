import type { Dish } from '../types';

/** Built-in copy of the menu card; public/assets/data/menu.json replaces it at runtime when it loads. */

/* Warme Speisen */
const classics: Dish[] = [
  {
    cat: 'classics',
    price: 13.5,
    tags: ['regional', 'house'],
    star: true,
    allergens: 'A, C, G',
    googleReview: {
      author: 'Christina M.',
      rating: 5,
      de: 'Das beste Backhendl weit und breit! Außen richtig knusprig, innen saftig — und der Erdäpfelsalat mit Kernöl ist ein Traum.',
      en: 'The best Backhendl far and wide! Properly crispy outside, juicy inside — and the potato salad with pumpkin seed oil is a dream.',
    },
    copy: {
      de: {
        name: 'Halbes Backhendl',
        desc: 'Knusprig herausgebackenes halbes Backhendl nach traditioneller Art.',
      },
      en: {
        name: 'Half Backhendl',
        desc: 'Crispy golden fried half chicken made according to traditional Styrian tavern custom.',
      },
      it: {
        name: 'Mezzo Backhendl',
        desc: 'Mezzo pollo fritto croccante e dorato secondo l’autentica usanza stiriana.',
      },
    },
  },
  {
    cat: 'classics',
    price: 24.9,
    tags: ['regional', 'house'],
    star: true,
    allergens: 'A, C, G',
    googleReview: {
      author: 'Christina M.',
      rating: 5,
      de: 'Perfekt herausgebackenes Backhendl — wunderbar zum Teilen mit der ganzen Familie.',
      en: 'Perfect crispy fried chicken — wonderful for sharing with the whole family.',
    },
    copy: {
      de: {
        name: 'Ganzes Backhendl',
        desc: 'Frisch herausgebackenes ganzes Backhendl — ideal zum Teilen.',
      },
      en: {
        name: 'Whole Backhendl',
        desc: 'Crispy golden fried whole chicken — ideal for sharing at the table.',
      },
      it: {
        name: 'Backhendl intero',
        desc: 'Pollo intero fritto croccante e dorato — ideale da condividere al tavolo.',
      },
    },
  },
  {
    cat: 'classics',
    price: 14.9,
    tags: ['regional', 'house'],
    star: true,
    allergens: 'A, C, G',
    copy: {
      de: { name: 'Wienerschnitzel vom Schwein', desc: 'Mit gerösteten Erdäpfeln.' },
      en: {
        name: 'Pork Wiener Schnitzel',
        desc: 'Crispy golden pork schnitzel, served with roasted potatoes.',
      },
      it: {
        name: 'Wiener Schnitzel di maiale',
        desc: 'Cotoletta di maiale dorata e croccante, servita con patate arrosto.',
      },
    },
  },
  {
    cat: 'classics',
    price: 16.9,
    tags: ['regional', 'house'],
    allergens: 'A, C, G, L',
    copy: {
      de: { name: 'Cordon Bleu vom Schwein', desc: 'Mit gerösteten Erdäpfeln.' },
      en: {
        name: 'Pork Cordon Bleu',
        desc: 'Stuffed with ham and cheese, served with roasted potatoes.',
      },
      it: {
        name: 'Cordon Bleu di maiale',
        desc: 'Farcito con prosciutto e formaggio, servito con patate arrosto.',
      },
    },
  },
  {
    cat: 'classics',
    price: 15.9,
    tags: ['regional', 'house'],
    star: true,
    allergens: 'A, C, G, F, O',
    copy: {
      de: { name: 'Schweinsbraten', desc: 'Mit Bierkraut und Knödel.' },
      en: {
        name: 'Roast Pork (Schweinsbraten)',
        desc: 'Tender roast pork served with beer sauerkraut and dumplings.',
      },
      it: {
        name: 'Arrosto di maiale (Schweinsbraten)',
        desc: 'Tenero arrosto di maiale servito con crauti alla birra e canederli.',
      },
    },
  },
  {
    cat: 'classics',
    price: 16.5,
    tags: ['regional'],
    allergens: 'G, M',
    copy: {
      de: { name: 'Schweinsripperl', desc: 'Mit Senf, Kren und Brot.' },
      en: {
        name: 'Pork Ribs (Schweinsripperl)',
        desc: 'Savory pork ribs served with mustard, freshly grated horseradish and bread.',
      },
      it: {
        name: 'Costine di maiale (Schweinsripperl)',
        desc: 'Succose costine di maiale servite con senape, cren fresco e pane.',
      },
    },
  },
  {
    cat: 'classics',
    price: 14.9,
    tags: ['veg', 'house'],
    allergens: '',
    copy: {
      de: { name: '2 Stk. Gebackene Kaspressknödel', desc: 'Vegetarisch.' },
      en: {
        name: '2 pcs. Fried Cheese Dumplings (Kaspressknödel)',
        desc: 'Vegetarian specialty — 2 pan-fried Styrian cheese dumplings.',
      },
      it: {
        name: '2 Canederli al formaggio dorati (Kaspressknödel)',
        desc: 'Specialità vegetariana — 2 canederli al formaggio dorati in padella.',
      },
    },
  },
];

/* Für den kleinen Hunger */
const jause: Dish[] = [
  {
    cat: 'jause',
    price: 14.9,
    tags: ['regional', 'house'],
    star: true,
    allergens: 'A, F, G',
    copy: {
      de: {
        name: 'Marienjause für 1 Person',
        desc: 'Mit Schinken, Schweinskaree, Käse, Brüstl, Aufstriche, Kren und Ei, fein garniert, 2 Stück Schwarzbrot.',
      },
      en: {
        name: 'Marienjause Platter (1 Person)',
        desc: 'Cold platter with ham, pork loin, cheese, pork belly, spreads, horseradish, egg, garnished, with 2 slices of rye bread.',
      },
      it: {
        name: 'Marienjause per 1 persona',
        desc: 'Tagliere con prosciutto, lombo di maiale, formaggio, pancetta, salse, cren e uovo, con 2 fette di pane nero.',
      },
    },
  },
  {
    cat: 'jause',
    price: 12.9,
    tags: ['veg', 'regional'],
    allergens: 'A, C, G',
    copy: {
      de: {
        name: 'Käseplatte (vegetarisch)',
        desc: 'Verschiedene Käsesorten, hausgemachte Aufstriche, Kürbis, Paprika, Tomate, Gurke, Ei.',
      },
      en: {
        name: 'Cheese Platter (Vegetarian)',
        desc: 'Selection of regional cheeses, homemade spreads, pumpkin, bell pepper, tomato, cucumber, egg.',
      },
      it: {
        name: 'Piatto di formaggi (Vegetariano)',
        desc: 'Selezione di formaggi regionali, salse fatte in casa, zucca, peperone, pomodoro, cetriolo, uovo.',
      },
    },
  },
  {
    cat: 'jause',
    price: 10.9,
    tags: ['regional', 'house'],
    allergens: 'A, L, M',
    copy: {
      de: { name: 'Warmes Brüstlbrot', desc: 'Mit Senf, Kren und Pfefferoni.' },
      en: {
        name: 'Warm Pork Belly Bread (Brüstlbrot)',
        desc: 'Warm savory pork belly on farmhouse bread with mustard, horseradish and pickled chili.',
      },
      it: {
        name: 'Pane caldo con pancetta (Brüstlbrot)',
        desc: 'Pancetta di maiale calda su pane con senape, cren e peperoncino.',
      },
    },
  },
  {
    cat: 'jause',
    price: 10.9,
    tags: ['regional', 'house'],
    allergens: 'A, M',
    copy: {
      de: { name: 'Warmes Schweinsbratenbrot', desc: 'Mit Senf, Kren und Pfefferoni.' },
      en: {
        name: 'Warm Roast Pork Bread',
        desc: 'Warm roast pork slices on farmhouse bread with mustard, horseradish and pickled chili.',
      },
      it: {
        name: 'Pane caldo con arrosto di maiale',
        desc: 'Fette di arrosto di maiale caldo su pane con senape, cren e peperoncino.',
      },
    },
  },
  {
    cat: 'jause',
    price: 8.9,
    tags: ['veg'],
    allergens: '',
    copy: {
      de: { name: 'Käsebrot (vegetarisch)', desc: 'Mit Aufstrich, Käse, Gurke, Tomate und Ei.' },
      en: {
        name: 'Cheese Bread (Vegetarian)',
        desc: 'Farmhouse bread with spread, cheese, cucumber, tomato and egg.',
      },
      it: {
        name: 'Pane al formaggio (Vegetariano)',
        desc: 'Pane casereccio con salsa, formaggio, cetriolo, pomodoro e uovo.',
      },
    },
  },
  {
    cat: 'jause',
    price: 8.5,
    tags: ['regional'],
    allergens: '',
    copy: {
      de: {
        name: 'Belegtes Brot',
        desc: 'Mit Leberaufstrich, Schinken, Käse, Tomate, Gurke und Ei.',
      },
      en: {
        name: 'Loaded Cold Cut Bread',
        desc: 'Rustic farmhouse bread with liver spread, ham, cheese, tomato, cucumber and egg.',
      },
      it: {
        name: 'Pane rustico farcito',
        desc: 'Pane rustico con paté di fegato, prosciutto, formaggio, pomodoro, cetriolo e uovo.',
      },
    },
  },
];

/* Suppen */
const soups: Dish[] = [
  {
    cat: 'soups',
    price: 5.9,
    tags: ['house', 'regional'],
    allergens: 'A, C, G, L',
    copy: {
      de: {
        name: 'Kaspressknödelsuppe',
        desc: 'Hausgemachter Kaspressknödel in kräftiger, klarer Suppe mit Schnittlauch.',
      },
      en: {
        name: 'Cheese Dumpling Soup (Kaspressknödel)',
        desc: 'Homemade pan-fried cheese dumpling in steaming clear broth with chives.',
      },
      it: {
        name: 'Brodo con canederlo al formaggio',
        desc: 'Canederlo al formaggio dorato fatto in casa servito in brodo caldo con erba cipollina.',
      },
    },
  },
  {
    cat: 'soups',
    price: 5.2,
    tags: ['house', 'regional'],
    allergens: 'A, C, G, L, M',
    copy: {
      de: {
        name: 'Fritattensuppe',
        desc: 'Klassische österreichische Suppe mit feinen Fritattenstreifen.',
      },
      en: {
        name: 'Fritatten Soup (Pancake Strips)',
        desc: 'Traditional Austrian clear broth with thin sliced pancake strips and chives.',
      },
      it: {
        name: 'Brodo con crespelle (Fritatten)',
        desc: 'Brodo chiaro tradizionale austriaco con striscioline di crespelle ed erba cipollina.',
      },
    },
  },
];

/* Marienbräu Salate */
const salads: Dish[] = [
  {
    cat: 'salads',
    price: 13.9,
    tags: ['regional', 'house'],
    star: true,
    allergens: 'A, C, G, M',
    copy: {
      de: {
        name: 'Backhendl Salat',
        desc: 'Knusprig gebackene Hendlstreifen auf knackigen Salaten mit steirischem Kürbiskernöl.',
      },
      en: {
        name: 'Backhendl Chicken Salad',
        desc: 'Crispy fried chicken strips on fresh salad greens with authentic Styrian pumpkin seed oil.',
      },
      it: {
        name: 'Insalata con Backhendl',
        desc: 'Striscioline di pollo croccante su insalata fresca con vero olio di semi di zucca stiriano.',
      },
    },
  },
  {
    cat: 'salads',
    price: 9.9,
    tags: ['regional', 'house'],
    allergens: 'A, C, G',
    copy: {
      de: {
        name: 'Bauern Salat + Brot',
        desc: 'Grüner Salat, Käferbohnen, Kartoffeln, Speck und Ei.',
      },
      en: {
        name: 'Farmer Salad + Bread',
        desc: 'Green salad with Styrian scarlet runner beans (Käferbohnen), potatoes, bacon and egg, served with bread.',
      },
      it: {
        name: 'Insalata contadina + pane',
        desc: 'Insalata verde con fagioli Käferbohnen, patate, speck croccante e uovo, servita con pane.',
      },
    },
  },
  {
    cat: 'salads',
    price: 6.2,
    tags: ['regional'],
    allergens: '',
    copy: {
      de: { name: 'Gemischter Salat', desc: 'Bunte Auswahl an frischen, knackigen Salaten.' },
      en: {
        name: 'Mixed Seasonal Salad',
        desc: 'Colorful selection of crisp, freshly prepared seasonal side salads.',
      },
      it: {
        name: 'Insalata mista di stagione',
        desc: 'Colorata selezione di insalate fresche e croccanti di stagione.',
      },
    },
  },
  {
    cat: 'salads',
    price: 4.9,
    tags: ['veg'],
    allergens: 'M',
    copy: {
      de: { name: 'Grüner Salat (vegetarisch)', desc: 'Frischer, knackiger Blattsalat.' },
      en: {
        name: 'Green Salad (Vegetarian)',
        desc: 'Fresh crisp garden leaf salad with house vinaigrette.',
      },
      it: {
        name: 'Insalata verde (Vegetariana)',
        desc: 'Fresche foglie d’insalata mista con delicata vinaigrette della casa.',
      },
    },
  },
];

/* Hausgemachte Mehlspeisen */
const dessert: Dish[] = [
  {
    cat: 'dessert',
    price: 6.2,
    tags: ['veg', 'house'],
    star: true,
    allergens: 'A, C, F, G',
    copy: {
      de: { name: 'Mohnstrudel', desc: 'Hausgemacht mit saftiger steirischer Mohnfülle.' },
      en: {
        name: 'Homemade Poppy Seed Strudel',
        desc: 'Freshly baked with luscious poppy seed filling.',
      },
      it: {
        name: 'Strudel ai semi di papavero fatto in casa',
        desc: 'Fatto in casa con morbido ripieno di semi di papavero stiriani.',
      },
    },
  },
  {
    cat: 'dessert',
    price: 6.2,
    tags: ['veg', 'house'],
    star: true,
    allergens: 'A, C, G',
    copy: {
      de: {
        name: 'Topfen-Himbeerstrudel',
        desc: 'Hausgemachter Topfenstrudel verfeinert mit fruchtigen Himbeeren.',
      },
      en: {
        name: 'Curd Cheese & Raspberry Strudel',
        desc: 'Homemade fluffy Austrian Topfen curd strudel filled with raspberries.',
      },
      it: {
        name: 'Strudel alla ricotta e lamponi',
        desc: 'Soffice strudel fatto in casa al formaggio fresco Topfen con lamponi.',
      },
    },
  },
  {
    cat: 'dessert',
    price: 6.2,
    tags: ['veg', 'house'],
    allergens: 'A, C, G',
    copy: {
      de: {
        name: 'Apfelstrudel',
        desc: 'Klassischer hausgemachter Strudel mit steirischen Äpfeln.',
      },
      en: {
        name: 'Homemade Apple Strudel',
        desc: 'Classic Austrian strudel with Styrian apples and a hint of cinnamon.',
      },
      it: {
        name: 'Strudel di mele tradizionale',
        desc: 'Classico strudel fatto in casa con mele stiriane e cannella.',
      },
    },
  },
  {
    cat: 'dessert',
    price: 3.6,
    tags: ['veg'],
    allergens: 'A, G',
    copy: {
      de: {
        name: 'Vanillesauce',
        desc: 'Feine, warme Vanillesauce — die perfekte Begleitung zu unseren Strudeln.',
      },
      en: {
        name: 'Vanilla Sauce',
        desc: 'Delicate warm vanilla sauce — the ideal pairing with our strudels.',
      },
      it: {
        name: 'Crema alla vaniglia',
        desc: 'Delicata crema calda alla vaniglia — l’abbinamento ideale con i nostri strudel.',
      },
    },
  },
];

/* Aus dem Braukessel (Marienbräu house beers) */
const brew: Dish[] = [
  {
    cat: 'brew',
    price: 4.9,
    tags: ['beer', 'house'],
    star: true,
    size: '0,5 l',
    googleReview: {
      author: 'Sabine K.',
      rating: 5,
      de: 'Urgemütliche Gaststube mit den Kupferkesseln — so stellt man sich ein echtes steirisches Wirtshaus vor. Das Zwickl ist hervorragend!',
      en: 'A wonderfully cosy Stube with the copper kettles — exactly what you picture a real Styrian inn to be. The Zwickl is outstanding!',
    },
    copy: {
      de: {
        name: 'Marienbräu Zwickl (naturtrüb)',
        desc: 'Unfiltriert und naturtrüb direkt vom Fass gebraut mit unserem 20m Tiefquellwasser. Hefig, mild und herrlich süffig. (0,3 l € 3,90)',
      },
      en: {
        name: 'Marienbräu Zwickl (Unfiltered)',
        desc: 'Naturally cloudy and unfiltered on tap, brewed with our 20m deep subterranean well water. Mild, yeasty and refreshing. (0.3 l € 3.90)',
      },
      it: {
        name: 'Marienbräu Zwickl (non filtrata)',
        desc: 'Torbida naturale alla spina, prodotta con l’acqua della sorgente sotterranea di 20m. Fresca, lievitosa e dissetante. (0,3 l € 3,90)',
      },
    },
  },
  {
    cat: 'brew',
    price: 4.7,
    tags: ['beer', 'house'],
    size: '0,5 l',
    copy: {
      de: {
        name: 'Marienbräu Märzen',
        desc: 'Klassisches bernsteinfarbenes Brauhausbier mit feiner Malznote und ausgewogener Bittere. (0,3 l € 3,70)',
      },
      en: {
        name: 'Marienbräu Märzen',
        desc: 'Classic amber tavern beer with subtle malt sweetness and a clean, balanced hop finish. (0.3 l € 3.70)',
      },
      it: {
        name: 'Marienbräu Märzen',
        desc: 'Classica birra ambrata da birreria con note di malto e un finale pulito ed equilibrato. (0,3 l € 3,70)',
      },
    },
  },
  {
    cat: 'brew',
    price: 5.4,
    tags: ['beer', 'season'],
    size: '0,5 l',
    copy: {
      de: {
        name: 'Saisonales Bockbier',
        desc: 'Dunkel, vollmundig und kräftig eingebraut — ein saisonaler Hochgenuss aus unserem Kupferkessel.',
      },
      en: {
        name: 'Seasonal Bock Beer',
        desc: 'Rich, dark and full-bodied — our seasonal brew special from the copper brew kettles.',
      },
      it: {
        name: 'Birra Bock stagionale',
        desc: 'Scura, corposa e robusta — la speciale cotta stagionale dai nostri tini di rame.',
      },
    },
  },
];

export const BUILT_IN_MENU: readonly Dish[] = [
  ...classics,
  ...jause,
  ...soups,
  ...salads,
  ...dessert,
  ...brew,
];
