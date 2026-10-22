# Marienbräu — Speisekarte & Foto Update-Anleitung (Guide)

Dieses Dokument erklärt, wie die Speisekarte, Preise, Fotos und Google-Bewertungen einfach aktualisiert werden können — sowohl für den Wirt als auch für eine KI.

---

## 1. Zentrale Speisekarten-Datei: `assets/data/menu.json`

Alle Gerichte, Preise, Beschreibungen, Allergen-Codes und Bewertungen liegen übersichtlich und strukturiert in der Datei:
📁 **[`assets/data/menu.json`](file:///home/akatsuky/firstmate/projects/marienbraeu/assets/data/menu.json)**

### Aufbau eines Eintrags:
```json
{
  "id": "halbes-backhendl",
  "category": "classics",
  "price": 13.5,
  "portion": null,
  "allergens": "A, C, G",
  "tags": ["regional", "house"],
  "star": true,
  "photo": "assets/img/dishes/halbes-backhendl.jpg",
  "google_review": {
    "author": "Christina M.",
    "rating": 5,
    "de": "Das beste Backhendl weit und breit! Außen richtig knusprig, innen saftig...",
    "en": "The best Backhendl far and wide! Properly crispy outside, juicy inside..."
  },
  "name": {
    "de": "Halbes Backhendl",
    "en": "Half Backhendl",
    "it": "Mezzo Backhendl"
  },
  "description": {
    "de": "Knusprig herausgebackenes halbes Backhendl nach traditioneller Art.",
    "en": "Crispy golden fried half chicken made according to traditional Styrian tavern custom.",
    "it": "Mezzo pollo fritto croccante e dorato secondo l’autentica usanza stiriana."
  }
}
```

---

## 2. Preise anpassen (Dauert 10 Sekunden)

Um einen Preis zu ändern, einfach in `assets/data/menu.json` beim entsprechenden Gericht die Zahl anpassen:

```json
"price": 14.50
```

Sobald die Datei gespeichert wird, zeigt die Website sofort den neuen Preis (`€ 14,50`) formatiert an.

---

## 3. Eigene Fotos von Gerichten hinzufügen

Wirtsleute oder Gäste können mit dem Smartphone selbst Fotos von den Speisen machen und einbinden:

1. **Foto abspeichern:**
   Bild als JPG oder WebP im Ordner speichern:
   📁 `assets/img/dishes/` (z.B. `assets/img/dishes/schweinsbraten.jpg`)
2. **Im JSON eintragen:**
   Beim jeweiligen Gericht im Feld `"photo"` den Pfad eintragen:
   ```json
   "photo": "assets/img/dishes/schweinsbraten.jpg"
   ```
3. **Ergebnis:**
   Die Speisekarte blendet automatisch oberhalb des Gerichtsnamens ein elegantes, abgerundetes Bild mit dezentem Schwebe-Zoom ein. Wenn `"photo": null` ist, wird die Karte wie gewohnt rein typografisch und kompakt dargestellt.

---

## 4. Google-Bewertungen direkt mit Gerichten verknüpfen

Gerichte können direkt mit echten Kundenstimmen aus Google Reviews versehen werden.

1. **Bewertung eintragen:**
   ```json
   "google_review": {
     "author": "Elisabeth P.",
     "rating": 5,
     "de": "Schweinsbraten mit krachender Schwarte und flaumigen Serviettenknödeln — wie bei der Oma. Preis-Leistung top.",
     "en": "Roast pork with crunchy crackling and fluffy bread dumplings — just like grandma’s."
   }
   ```
2. **Ergebnis:**
   Auf der Speisekarte erscheint direkt unter dem Gericht ein goldener 5-Sterne-Chip:
   `★★★★★ GOOGLE REVIEW`
   *„Schweinsbraten mit krachender Schwarte...“ — Elisabeth P.*
   Ein Klick darauf führt den Gast direkt zum Marienbräu-Profil auf Google Maps!

---

## 5. Foto der gedruckten Original-Speisekarte aktualisieren

Wenn eine neue physische Speisekarte gedruckt wird:
1. Ein Foto der Karte mit dem Smartphone aufnehmen.
2. Die Datei als `assets/img/speisekarte-foto-web.jpg` abspeichern.
3. Der Button **„Originalkarte ansehen (Foto)“** öffnet sofort das neue Foto im Vollbild-Lightbox-Modal.
