# 🎵 OpenMusic - Image to Music Converter

OpenMusic ist eine vollständige Webanwendung, die Bilder in Musik umwandelt. Die Anwendung scannt Bilder pixelweise und konvertiert RGB-Werte in musikalische Parameter wie Tonhöhe, Lautstärke und Notenlänge.

![OpenMusic Demo](docs/screenshot.png)

## ✨ Features

### Kernfunktionalität
- **Bildverarbeitung**: Automatisches Scannen von Bildern von links oben nach rechts unten
- **RGB zu Musik Mapping**:
  - **Rot (R)**: Bestimmt die Tonhöhe/Note (0-255 → mehrere Oktaven)
  - **Grün (G)**: Bestimmt die Lautstärke/Velocity (0-255 → MIDI Velocity 0-127)
  - **Blau (B)**: Bestimmt die Notenlänge/Duration
- **MIDI-Export**: Standard MIDI-Datei zum Download
- **MP3-Export**: Audio-Datei zum Download und Abspielen (erfordert FluidSynth)

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
- Audio-Player für Vorschau
- Download-Buttons für MIDI und MP3

## 🚀 Installation

### Voraussetzungen
- Python 3.8 oder höher
- pip (Python Package Manager)
- Optional: FluidSynth für MP3-Konvertierung

### System-Abhängigkeiten installieren

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y fluidsynth fluid-soundfont-gm ffmpeg
```

#### macOS
```bash
brew install fluid-synth ffmpeg
```

#### Windows
- Laden Sie FluidSynth von [https://github.com/FluidSynth/fluidsynth/releases](https://github.com/FluidSynth/fluidsynth/releases) herunter
- Laden Sie FFmpeg von [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html) herunter
- Fügen Sie beide zum System-PATH hinzu

### Python-Abhängigkeiten installieren

1. Repository klonen:
```bash
git clone https://github.com/makerLab314/OpenMusic.git
cd OpenMusic
```

2. Virtuelle Umgebung erstellen (empfohlen):
```bash
python -m venv venv
source venv/bin/activate  # Auf Windows: venv\Scripts\activate
```

3. Abhängigkeiten installieren:
```bash
pip install -r requirements.txt
```

## 🎮 Verwendung

### Server starten

**Einfacher Start (empfohlen):**
```bash
./start_server.sh
```

**Oder manuell:**
```bash
python app/main.py
```

Der Server läuft standardmäßig auf `http://localhost:5000`

**Hinweis für Entwicklung:**
Um den Debug-Modus zu aktivieren, setzen Sie die Umgebungsvariable:
```bash
export FLASK_DEBUG=true
python app/main.py
```

**Warnung:** Verwenden Sie niemals Debug-Modus in Produktionsumgebungen!

### Web-Interface verwenden

1. Öffnen Sie `http://localhost:5000` in Ihrem Browser
2. Laden Sie ein Bild hoch (PNG, JPG, GIF, BMP)
3. Passen Sie die Einstellungen an:
   - **Tempo**: Geschwindigkeit der Musik in BPM
   - **Tonart/Skala**: Musikalische Skala für die Noten
   - **Spielmodus**: Art der Musikgenerierung
   - **Auflösung**: Anzahl der zu verwendenden Pixel (höhere Werte = schnellere Verarbeitung)
4. Klicken Sie auf "In Musik umwandeln"
5. Hören Sie sich das Ergebnis an oder laden Sie MIDI/MP3 herunter

### Beispiel-Workflow

```
Bild hochladen → Einstellungen anpassen → Konvertieren → Anhören → Herunterladen
```

## 📁 Projektstruktur

```
OpenMusic/
├── app/
│   ├── __init__.py           # Python Package Init
│   ├── main.py               # Flask Webanwendung
│   ├── image_processor.py    # Bildverarbeitung
│   ├── music_generator.py    # MIDI/Musik-Generierung
│   └── audio_converter.py    # MP3-Konvertierung
├── static/
│   ├── css/
│   │   └── style.css         # CSS Styling
│   └── js/
│       └── app.js            # Frontend JavaScript
├── templates/
│   └── index.html            # HTML Template
├── uploads/                  # Hochgeladene Bilder (temporär)
├── outputs/                  # Generierte MIDI/MP3-Dateien
├── requirements.txt          # Python-Abhängigkeiten
├── .gitignore               # Git Ignore-Datei
└── README.md                # Diese Datei
```

## 🔧 API-Dokumentation

### Endpunkte

#### `POST /api/upload`
Lädt ein Bild hoch

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file)

**Response:**
```json
{
  "success": true,
  "file_id": "uuid-string",
  "filename": "original-filename.jpg",
  "info": {
    "width": 1920,
    "height": 1080,
    "mode": "RGB",
    "total_pixels": 2073600,
    "resolution": 1
  }
}
```

#### `POST /api/convert`
Konvertiert ein hochgeladenes Bild in Musik

**Request:**
- Content-Type: `application/json`
- Body:
```json
{
  "file_id": "uuid-string",
  "tempo": 120,
  "scale": "chromatic",
  "mode": "linear",
  "resolution": 1
}
```

**Response:**
```json
{
  "success": true,
  "midi_file": "uuid.mid",
  "mp3_file": "uuid.mp3",
  "note_count": 2073600,
  "duration_estimate": 1036800
}
```

#### `GET /api/download/<file_type>/<filename>`
Lädt eine generierte Datei herunter

**Parameters:**
- `file_type`: "midi" oder "mp3"
- `filename`: Name der Datei

#### `GET /api/preview/<filename>`
Streamt eine MP3-Datei zur Vorschau

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

### MP3-Konvertierung funktioniert nicht
- Stellen Sie sicher, dass FluidSynth installiert ist: `fluidsynth --version`
- Überprüfen Sie, ob ein Soundfont vorhanden ist
- MIDI-Dateien werden trotzdem generiert und können heruntergeladen werden

### Server startet nicht
- Überprüfen Sie, ob Port 5000 frei ist
- Stellen Sie sicher, dass alle Abhängigkeiten installiert sind: `pip list`

### Bild-Upload schlägt fehl
- Maximale Dateigröße ist 16MB
- Unterstützte Formate: PNG, JPG, GIF, BMP

## 🤝 Mitwirken

Beiträge sind willkommen! Bitte erstellen Sie einen Pull Request oder öffnen Sie ein Issue.

## 📝 Lizenz

Dieses Projekt ist Open Source und unter der MIT-Lizenz verfügbar.

## 👥 Autoren

- MakerLab314

## 🙏 Danksagungen

- PIL/Pillow für Bildverarbeitung
- midiutil für MIDI-Generierung
- Flask für das Web-Framework
- FluidSynth für Audio-Synthese

## 📚 Weitere Ressourcen

- [MIDI Specification](https://www.midi.org/specifications)
- [Musical Scales Reference](https://en.wikipedia.org/wiki/Musical_scale)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

**Viel Spaß beim Erstellen von Musik aus Ihren Bildern! 🎵🖼️**
