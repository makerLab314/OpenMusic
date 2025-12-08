# 🎵 OpenMusic - Image to Music Converter

OpenMusic ist eine **browserbasierte Client-Side-Anwendung**, die Bilder in Musik umwandelt. Die Anwendung scannt Bilder pixelweise und konvertiert RGB-Werte in musikalische Parameter wie Tonhöhe, Lautstärke und Notenlänge.

**Neu:** Die Anwendung läuft jetzt vollständig im Browser - **kein Server erforderlich!**

![OpenMusic Demo](https://github.com/user-attachments/assets/053c59bd-4a8e-41be-9902-0d64aff1b68a)

## ✨ Features

### Kernfunktionalität
- **Bildverarbeitung**: Das Bild wird in konfigurierbare Regionen unterteilt und jede Region wird zu einer Note interpoliert
- **RGB zu Musik Mapping**:
  - **Rot (R)**: Bestimmt die Tonhöhe/Note (0-255 → mehrere Oktaven)
  - **Grün (G)**: Bestimmt die Lautstärke/Velocity (0-255 → MIDI Velocity 0-127)
  - **Blau (B)**: Bestimmt die Notenlänge/Duration
- **Regionen-basierte Interpolation**: RGB-Werte werden innerhalb jeder Region gemittelt für kürzere, prägnantere Musik
- **MIDI-Export**: Standard MIDI-Datei zum direkten Download
- **Client-Side**: Keine Server-Installation erforderlich - läuft vollständig im Browser

### Erweiterte Modi
- **Linear**: Standard-Modus mit direkter Pixel-zu-Note-Konvertierung
- **Arpeggio**: Noten werden als aufsteigende/absteigende Arpeggios gespielt
- **Akkorde**: Mehrere benachbarte Pixel werden zu Akkorden kombiniert
- **Melodisch**: Intelligentes Mapping mit glatten Übergängen
- **Rhythmisch**: Variationen im Rhythmus basierend auf Farbintensität
- **Harmonisch**: Verwendet Obertonreihen für natürliche Klangverhältnisse
- **Fibonacci Rhythmus**: Rhythmische Muster basierend auf der Fibonacci-Folge
- **Goldener Schnitt**: Musikalische Proportionen nach dem goldenen Schnitt
- **Wellen-Modulation**: Sinuswellen modulieren Tonhöhe und Rhythmus
- **Polyrhythmus**: Überlappende rhythmische Muster (3:4:5)
- **Fraktal**: Selbstähnliche Muster auf verschiedenen Zeitskalen
- **Palindrom**: Melodie spielt vorwärts und dann rückwärts
- **Kanon**: Melodie folgt sich selbst in einem Intervall

### Scan-Muster
- **Linear**: Standard links-nach-rechts, oben-nach-unten Scannen
- **Spirale**: Spiralförmig vom Zentrum nach außen
- **Diagonal**: Diagonales Scannen über das Bild
- **Welle**: Sinuskurven-Muster
- **Kreisförmig**: Konzentrische Kreise vom Zentrum
- **Zufällig**: Zufällige Pixel-Auswahl für unvorhersehbare Musik
- **Schachbrett**: Alternierendes Muster
- **Zickzack**: Links-rechts alternierendes Scannen
- **Fibonacci-Spirale**: Basierend auf dem goldenen Schnitt

### Benutzeroberfläche
- Modernes, responsives Design
- Drag & Drop Bild-Upload
- Live-Vorschau des hochgeladenen Bildes
- Einstellbare Parameter:
  - Tempo/BPM (40-240)
  - Tonart/Skala (Chromatisch, Dur, Moll, Pentatonisch, Blues)
  - Spielmodus
  - Anzahl der Regionen (10-50000) - Steuert die Länge der generierten Musik
- Download-Button für MIDI-Dateien

## 🚀 Installation

### Einfache Verwendung (Empfohlen)

**Keine Installation erforderlich!** Öffnen Sie einfach `index.html` in einem modernen Webbrowser:

1. Repository klonen oder herunterladen:
```bash
git clone https://github.com/makerLab314/OpenMusic.git
cd OpenMusic
```

2. Öffnen Sie `index.html` in Ihrem Browser:
   - **Doppelklick** auf die Datei, oder
   - Rechtsklick → "Öffnen mit" → Ihr Browser, oder
   - Ziehen Sie die Datei in ein Browser-Fenster

3. Fertig! Die Anwendung läuft jetzt vollständig in Ihrem Browser.

### Alternative: Mit lokalem Webserver

Wenn Sie die Anwendung über einen lokalen Webserver ausführen möchten:

```bash
# Mit Python
python3 -m http.server 8000

# Oder mit Node.js
npx http-server

# Dann im Browser öffnen
# http://localhost:8000/index.html
```

### Browser-Kompatibilität

Die Anwendung funktioniert mit allen modernen Browsern:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

**Hinweis:** Die Anwendung nutzt moderne Web-APIs (FileReader, Canvas, Blob). Sehr alte Browser werden nicht unterstützt.

## 🎮 Verwendung

1. Öffnen Sie `index.html` in Ihrem Browser
2. Laden Sie ein Bild hoch (PNG, JPG, GIF, BMP - max. 16MB)
3. Passen Sie die Einstellungen an:
   - **Tempo**: Geschwindigkeit der Musik in BPM
   - **Tonart/Skala**: Musikalische Skala für die Noten
   - **Spielmodus**: Art der Musikgenerierung
   - **Anzahl der Regionen**: Anzahl der zu generierenden Noten (weniger Regionen = kürzere Musik)
4. Klicken Sie auf "In Musik umwandeln"
5. Laden Sie die MIDI-Datei herunter

### Beispiel-Workflow

```
Bild hochladen → Einstellungen anpassen → Konvertieren → MIDI herunterladen
```

### Performance-Tipps

- **Kürzere Musik**: Verwenden Sie weniger Regionen (z.B. 100-500)
- **Längere, detailliertere Musik**: Verwenden Sie mehr Regionen (z.B. 5000-10000)
- Das Bild wird automatisch in die gewünschte Anzahl von Regionen unterteilt
- Jede Region wird zu einer einzigen Note interpoliert (RGB-Werte werden gemittelt)
- Empfohlene Einstellung für die meisten Bilder: 1000-2000 Regionen

## 📁 Projektstruktur

```
OpenMusic/
├── index.html                # Haupt-HTML-Datei (einfach im Browser öffnen!)
├── static/
│   ├── css/
│   │   └── style.css         # CSS Styling
│   └── js/
│       └── app.js            # Gesamte Anwendungslogik (Client-Side)
├── app/                      # Legacy Python-Code (nicht mehr erforderlich)
├── artwork.jpg               # Beispielbild
└── README.md                 # Diese Datei
```

## 🔧 Technische Details

### Client-Side Technologien
- **HTML5 Canvas API**: Für Bildverarbeitung und Pixel-Extraktion
- **FileReader API**: Für lokales Laden von Bildern
- **Blob API**: Für MIDI-Datei-Erstellung
- **Vanilla JavaScript**: Keine externen Bibliotheken erforderlich

### MIDI-Generierung
Die Anwendung implementiert einen vollständigen MIDI-Datei-Generator in reinem JavaScript:
- MIDI Format 1 Unterstützung
- Variable Length Quantity (VLQ) Encoding
- Note On/Off Events
- Tempo-Events
- Korrekte Delta-Time-Berechnung

## 🎨 RGB zu Musik Mapping Details

### Rot (R) → Tonhöhe
- 0-255 wird auf 4 Oktaven verteilt
- Verwendet die gewählte musikalische Skala
- Basis-Note ist C4 (MIDI Note 60)

### Grün (G) → Lautstärke
- 0-255 wird linear auf MIDI Velocity 0-127 gemappt
- Mindest-Velocity ist 1 (um stumme Noten zu vermeiden)

### Blau (B) → Notenlänge
- 0-255 wird auf 0.1 bis 2.0 Beats gemappt
- Längere Noten für höhere Blau-Werte

## 🎼 Spielmodi erklärt

### Basis-Modi

#### Linear
Jedes Pixel wird direkt in eine Note umgewandelt. Dies ist der einfachste Modus und folgt exakt den RGB-Werten.

#### Arpeggio
Jedes Pixel erzeugt ein Arpeggio (Dreiklang), bestehend aus Grundton, Terz und Quinte.

#### Akkorde
Drei aufeinanderfolgende Pixel werden zu einem Akkord kombiniert und gleichzeitig gespielt.

#### Melodisch
Ähnlich wie Linear, aber mit glatteren Übergängen zwischen weit auseinanderliegenden Noten durch Einschub von Durchgangsnoten.

#### Rhythmisch
Die Notenlänge variiert basierend auf der Gesamthelligkeit (Intensität) des Pixels.

### Mathematische Modi

#### Harmonisch (Obertonreihe)
Verwendet die natürliche Obertonreihe (harmonische Serie) für musikalisch konsistente Intervalle. Jede Note basiert auf einem Oberton (1., 2., 3., 4., 5. Oberton), was zu natürlichen Klangverhältnissen führt.

#### Fibonacci Rhythmus
Nutzt die Fibonacci-Folge (1, 1, 2, 3, 5, 8, 13...) für rhythmische Variationen. Jede Note erhält eine Länge basierend auf einem Fibonacci-Wert, was zu organischen, sich entwickelnden Rhythmen führt.

#### Goldener Schnitt
Wendet das Verhältnis des goldenen Schnitts (φ ≈ 1.618) auf Notenlängen und Lautstärke an. Dies erzeugt ästhetisch ausgewogene musikalische Proportionen.

#### Wellen-Modulation
Moduliert Tonhöhe und Rhythmus mit Sinus- und Kosinuswellen. Die Tonhöhe variiert wellenförmig, während die Notenlänge ebenfalls periodisch schwankt.

#### Polyrhythmus
Erzeugt überlappende rhythmische Schichten im Verhältnis 3:4:5. Verschiedene rhythmische Stimmen spielen gleichzeitig und erzeugen komplexe, vielschichtige Muster.

#### Fraktal
Verwendet selbstähnliche Muster auf verschiedenen Zeitskalen. Jede Note wird auf mehreren Ebenen wiederholt, wobei jede Ebene kürzer und leiser ist.

#### Palindrom
Die Melodie wird vorwärts gespielt und dann in umgekehrter Reihenfolge wiederholt, was eine symmetrische Struktur erzeugt.

#### Kanon
Die Melodie folgt sich selbst nach einer Verzögerung und in einem anderen Tonhöhenintervall (Quinte höher), ähnlich wie "Frère Jacques".

## 🔍 Scan-Muster erklärt

Die Art und Weise, wie das Bild gescannt wird, hat einen enormen Einfluss auf die resultierende Musik:

### Linear
Standard-Scannen von links nach rechts, oben nach unten. Dies folgt der traditionellen Leserichtung und erzeugt eine vorhersehbare Progression.

### Spirale
Beginnt in der Bildmitte und spiralt nach außen. Dies erzeugt Musik, die sich vom Zentrum des Bildes entwickelt und kann zu überraschenden melodischen Verläufen führen.

### Diagonal
Scannt diagonal über das Bild. Dies kombiniert Elemente aus verschiedenen Bereichen des Bildes auf neue Weise.

### Welle
Folgt einer Sinuskurve durch das Bild. Dies erzeugt wellenförmige melodische Bewegungen, die der visuellen Wellenbewegung entsprechen.

### Kreisförmig
Scannt in konzentrischen Kreisen vom Zentrum nach außen. Ähnlich wie Spirale, aber mit gleichmäßigeren Radien.

### Zufällig
Wählt Pixel in zufälliger Reihenfolge aus. Dies erzeugt unvorhersehbare, überraschende Musik, die jedes Mal anders klingt.

### Schachbrett
Alternierendes Muster wie auf einem Schachbrett. Dies sampelt das Bild gleichmäßig verteilt.

### Zickzack
Scannt abwechselnd von links nach rechts und von rechts nach links. Dies erzeugt eine Balance zwischen benachbarten Bereichen.

### Fibonacci-Spirale
Basiert auf dem goldenen Schnitt. Dies folgt natürlichen Wachstumsmustern, die in der Natur häufig vorkommen (wie bei Sonnenblumenkernen oder Schneckenhäusern).

## 🐛 Troubleshooting

### Bild wird nicht geladen
- Überprüfen Sie, ob das Bildformat unterstützt wird (PNG, JPG, GIF, BMP)
- Maximale Dateigröße ist 16MB
- Stellen Sie sicher, dass Sie einen modernen Browser verwenden

### Konvertierung dauert zu lange
- Reduzieren Sie die Auflösung auf einen höheren Wert (z.B. 50-100)
- Kleinere Bilder verarbeiten schneller
- Sehr große Bilder (> 5 Megapixel) können mehrere Minuten dauern

### MIDI-Datei wird nicht heruntergeladen
- Überprüfen Sie die Browser-Konsole auf Fehler
- Erlauben Sie Downloads in Ihren Browser-Einstellungen
- Bei sehr großen MIDI-Dateien (> 100MB) kann der Download einige Sekunden dauern

### Browser friert ein
- Dies passiert bei sehr großen Bildern mit niedriger Auflösung
- Erhöhen Sie die Auflösung auf mindestens 20-50
- Schließen Sie andere Browser-Tabs, um Speicher freizugeben

## 🤝 Mitwirken

Beiträge sind willkommen! Bitte erstellen Sie einen Pull Request oder öffnen Sie ein Issue.

## 📝 Lizenz

Dieses Projekt ist Open Source und unter der MIT-Lizenz verfügbar.

## 👥 Autoren

- MakerLab314

## 🙏 Danksagungen

- HTML5 Canvas API für Bildverarbeitung
- Web Audio APIs für Browser-basierte Multimedia-Verarbeitung
- MIDI-Spezifikation für das Dateiformat

## 📚 Weitere Ressourcen

- [MIDI Specification](https://www.midi.org/specifications)
- [Musical Scales Reference](https://en.wikipedia.org/wiki/Musical_scale)
- [Canvas API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 🆕 Was ist neu?

### Version 2.0 - Client-Side Edition
- ✅ **Kein Server erforderlich** - Läuft vollständig im Browser
- ✅ **Keine Installation** - Einfach `index.html` öffnen
- ✅ **Vollständige MIDI-Implementierung** in JavaScript
- ✅ **Verbesserte Performance** bei der Bildverarbeitung
- ✅ **Datenschutz** - Alle Daten bleiben lokal auf Ihrem Computer

### Legacy Server-Version (app/)
Der alte Python/Flask-Code ist noch im Repository verfügbar, wird aber nicht mehr aktiv verwendet. Die neue Client-Side-Version bietet dieselbe Funktionalität ohne Server-Anforderungen.

---

**Viel Spaß beim Erstellen von Musik aus Ihren Bildern! 🎵🖼️**
