# 🎵 OpenMusic - Image to Music Converter

OpenMusic ist eine **browserbasierte Client-Side-Anwendung**, die Bilder in Musik umwandelt. Die Anwendung scannt Bilder pixelweise und konvertiert RGB-Werte in musikalische Parameter wie Tonhöhe, Lautstärke und Notenlänge.

**Neu:** Die Anwendung läuft jetzt vollständig im Browser - **kein Server erforderlich!**

![OpenMusic Demo](https://github.com/user-attachments/assets/053c59bd-4a8e-41be-9902-0d64aff1b68a)

## ✨ Features

### Kernfunktionalität
- **Bildverarbeitung**: Automatisches Scannen von Bildern von links oben nach rechts unten
- **RGB zu Musik Mapping**:
  - **Rot (R)**: Bestimmt die Tonhöhe/Note (0-255 → mehrere Oktaven)
  - **Grün (G)**: Bestimmt die Lautstärke/Velocity (0-255 → MIDI Velocity 0-127)
  - **Blau (B)**: Bestimmt die Notenlänge/Duration
- **MIDI-Export**: Standard MIDI-Datei zum direkten Download
- **Client-Side**: Keine Server-Installation erforderlich - läuft vollständig im Browser

### Erweiterte Modi
- **Linear**: Standard-Modus mit direkter Pixel-zu-Note-Konvertierung
- **Arpeggio**: Noten werden als aufsteigende/absteigende Arpeggios gespielt
- **Akkorde**: Mehrere benachbarte Pixel werden zu Akkorden kombiniert
- **Melodisch**: Intelligentes Mapping mit glatten Übergängen
- **Rhythmisch**: Variationen im Rhythmus basierend auf Farbintensität

### Benutzeroberfläche
- Modernes, responsives Design
- Drag & Drop Bild-Upload
- Live-Vorschau des hochgeladenen Bildes
- Einstellbare Parameter:
  - Tempo/BPM (40-240)
  - Tonart/Skala (Chromatisch, Dur, Moll, Pentatonisch, Blues)
  - Spielmodus
  - Auflösung (Anzahl der verwendeten Pixel)
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
   - **Auflösung**: Anzahl der zu überspringenden Pixel (höhere Werte = schnellere Verarbeitung, weniger Noten)
4. Klicken Sie auf "In Musik umwandeln"
5. Laden Sie die MIDI-Datei herunter

### Beispiel-Workflow

```
Bild hochladen → Einstellungen anpassen → Konvertieren → MIDI herunterladen
```

### Performance-Tipps

- **Große Bilder**: Verwenden Sie eine höhere Auflösung (z.B. 50-100), um die Anzahl der Noten zu reduzieren
- **Kleine Bilder**: Niedrige Auflösung (1-10) für mehr Details
- Ein 1920x1080 Bild mit Auflösung 1 erzeugt über 2 Millionen Noten!
- Empfohlene Auflösung für die meisten Bilder: 20-50

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

### Linear
Jedes Pixel wird direkt in eine Note umgewandelt. Dies ist der einfachste Modus und folgt exakt den RGB-Werten.

### Arpeggio
Jedes Pixel erzeugt ein Arpeggio (Dreiklang), bestehend aus Grundton, Terz und Quinte.

### Akkorde
Drei aufeinanderfolgende Pixel werden zu einem Akkord kombiniert und gleichzeitig gespielt.

### Melodisch
Ähnlich wie Linear, aber mit glatteren Übergängen zwischen weit auseinanderliegenden Noten durch Einschub von Durchgangsnoten.

### Rhythmisch
Die Notenlänge variiert basierend auf der Gesamthelligkeit (Intensität) des Pixels.

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
