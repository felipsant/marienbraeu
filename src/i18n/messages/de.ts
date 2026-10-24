import type { Messages } from './types';

/**
 * Static German copy lives in index.html itself (so the page reads without JavaScript)
 * and is read from the DOM on load. This table only holds the strings generated at runtime.
 */
export const de: Partial<Messages> = {
  'status.open': 'Jetzt geöffnet · bis {close} Uhr',
  'status.soon': 'Schließt bald · um {close} Uhr',
  'status.today': 'Geschlossen · öffnet heute um {open} Uhr',
  'status.tomorrow': 'Geschlossen · öffnet morgen um {open} Uhr',
  'status.later': 'Geschlossen · öffnet {day} um {open} Uhr',
  'headline.open': 'Kommen Sie vorbei — das Bier ist frisch gezapft!',
  'headline.soon': 'Noch auf ein letztes Seidl? Wir freuen uns!',
  'headline.closed': 'Wir freuen uns auf Ihren nächsten Besuch!',
  'hours.today': 'Heute',
  'today.closed': 'Ruhetag',
  'today.hours': '{open} – {close} Uhr',
  'day.holiday': 'Feiertage',
  'hours.holiday': 'Geöffnet',
  'hours.note':
    'Küche bis ca. eine Stunde vor Sperrstunde. An Feiertagen haben wir gerne für Sie geöffnet!',
  'res.guest1': '1 Person',
  'res.guestN': '{n} Personen',
  'res.guestMore': 'Mehr als 80 Personen (Großveranstaltung)',
  'res.group15': '13 – 25 Personen (Gruppe)',
  'res.group35': '25 – 50 Personen (Gruppe)',
  'res.group80': 'Bis zu 80 Personen (Großgruppe / Bus)',
  'res.timePick': 'Bitte zuerst Datum wählen',
  'res.timeChoose': 'Uhrzeit wählen',
  'err.past': 'Das Datum liegt in der Vergangenheit.',
  'err.monday': 'Montag ist Ruhetag — bitte wählen Sie einen anderen Tag.',
  'err.date': 'Bitte wählen Sie ein Datum.',
  'err.groupCall': 'Für Gruppen über 12 Personen rufen Sie uns bitte an: +43 664 2031953.',
  'toast.title': 'E-Mail-Programm geöffnet!',
  'toast.text':
    'Ihre Reservierungsanfrage an marienbraeu@gmx.at wurde vorbereitet. Bitte senden Sie die E-Mail ab, um die Reservierung abzuschließen.',
  'toast.detail': '{date} um {time} Uhr · {guests}',
  'toast.reopen': 'E-Mail nochmals öffnen / absenden',
  'res.submit': 'Per E-Mail reservieren',
  'res.legal':
    '✉️ Öffnet Ihr E-Mail-Programm mit allen Daten vorausgefüllt an marienbraeu@gmx.at — ohne Server oder API.',
  'menu.openPhotoModal': 'Originalkarte ansehen (Foto)',
  'menu.allergens': 'Allergene',
  'menuPhoto.eyebrow': 'Aus der Gaststube',
  'menuPhoto.title': 'Originale Speisekarte (Speis und Trank)',
  'menuPhoto.desc': 'Foto der gedruckten Speisekarte aus dem Marienbräu — 100% originalgetreu.',
  'menuPhoto.viewOriginal': 'Foto in voller 12MP-Auflösung öffnen',
  'menuPhoto.close': 'Schließen',
  'menu.recommend': 'Empfehlung',
  'menu.empty': 'In dieser Kategorie gibt es gerade nichts.',
  'tag.veg': 'vegetarisch',
  'tag.regional': 'regional',
  'tag.house': 'hausgemacht',
  'tag.beer': 'Hausbier',
  'tag.season': 'saisonal',
  'reviews.slide': 'Bewertung {i} von {n}',
  'reviews.source': 'Google-Rezension',
  'legal.impressum.title': 'Impressum',
  'legal.impressum.body':
    '<h3>Medieninhaber &amp; Betreiber</h3><p>Marienbräu<br>Rupertistraße 80<br>8075 Hart bei Graz, Österreich</p>' +
    '<p>Telefon: <a href="tel:+436642031953">+43 664 2031953</a><br>E-Mail: <a href="mailto:marienbraeu@gmx.at">marienbraeu@gmx.at</a></p>' +
    '<p>Quellcode &amp; Repository: <a href="https://github.com/felipsant/marienbraeu" target="_blank" rel="noopener">github.com/felipsant/marienbraeu</a></p>' +
    '<p>Webdesign &amp; Entwicklung: <a href="https://blog.santicartoons.ai/whoami/" target="_blank" rel="noopener">santicartoons</a></p>' +
    '<h3>Unternehmensangaben</h3><p>Rechtsform, Firmenbuchnummer, UID-Nummer, Gewerbebehörde und Mitgliedschaft bei der WKO Steiermark werden vom Betreiber ergänzt (§ 5 ECG, § 25 MedienG).</p>' +
    '<p><em>Hinweis: Diese Seite ist eine Vorlage. Bitte vor Veröffentlichung vollständige Angaben einsetzen.</em></p>',
  'legal.privacy.title': 'Datenschutz',
  'legal.privacy.body':
    '<h3>Ihre Daten bei uns</h3><p>Wir verarbeiten personenbezogene Daten ausschließlich auf Grundlage der DSGVO und des österreichischen DSG. Verantwortlich ist das Marienbräu, Rupertistraße 80, 8075 Hart bei Graz (marienbraeu@gmx.at). Daten aus dem Reservierungsformular (Name, E-Mail, Telefon, Wunschtermin) verwenden wir nur zur Bearbeitung Ihrer Anfrage.</p>' +
    '<h3>Hosting</h3><p>Diese Website wird über GitHub Pages bereitgestellt, einen Dienst der GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. Beim Aufruf der Seite verarbeitet GitHub technisch notwendige Zugriffsdaten (u. a. Ihre IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp), um die Seite auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und zuverlässigen Webauftritt (Art. 6 Abs. 1 lit. f DSGVO). GitHub ist unter dem EU-U.S. Data Privacy Framework zertifiziert; die Übermittlung in die USA stützt sich auf den Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO).</p>' +
    '<h3>Google Maps</h3><p>Die Karte wird erst nach Ihrem Klick auf „Karte laden“ eingebunden. Dabei werden Daten (u. a. Ihre IP-Adresse) an Google übertragen. Rechtsgrundlage ist Ihre Einwilligung durch diesen Klick (Art. 6 Abs. 1 lit. a DSGVO).</p>' +
    '<h3>Schriftarten, Cookies &amp; Analyse</h3><p>Alle Schriftarten sind lokal eingebunden und werden zusammen mit dieser Website ausgeliefert; eine Verbindung zu Google Fonts besteht nicht. Wir setzen keine Tracking-Cookies und führen keine externen Analyse- oder Statistikskripte aus. Lediglich Ihre gewählte Sprache wird lokal in Ihrem Browser gespeichert und nie an uns übertragen.</p>' +
    '<h3>Ihre Rechte</h3><p>Ihnen stehen die Rechte auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21) zu. Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Schreiben Sie uns dazu einfach an marienbraeu@gmx.at.</p>' +
    '<h3>Beschwerderecht</h3><p>Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt, können Sie sich bei der Aufsichtsbehörde beschweren: Österreichische Datenschutzbehörde, Barichgasse 40-42, 1030 Wien, E-Mail: dsb@dsb.gv.at.</p>',
};
