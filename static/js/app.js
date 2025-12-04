// OpenMusic JavaScript - Client-Side Version
let uploadedImage = null;
let currentMidiBlob = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const imageInfo = document.getElementById('imageInfo');
const settingsSection = document.getElementById('settingsSection');
const convertBtn = document.getElementById('convertBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsSection = document.getElementById('resultsSection');
const resultsInfo = document.getElementById('resultsInfo');
const audioPlayer = document.getElementById('audioPlayer');
const audioPlayerContainer = document.getElementById('audioPlayerContainer');
const downloadMidi = document.getElementById('downloadMidi');
const downloadMp3 = document.getElementById('downloadMp3');
const resetBtn = document.getElementById('resetBtn');

// Settings inputs
const tempoInput = document.getElementById('tempo');
const tempoValue = document.getElementById('tempoValue');
const scaleInput = document.getElementById('scale');
const modeInput = document.getElementById('mode');
const resolutionInput = document.getElementById('resolution');
const resolutionValue = document.getElementById('resolutionValue');

// Musical scales (MIDI note numbers relative to C)
const SCALES = {
    'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    'major': [0, 2, 4, 5, 7, 9, 11],
    'minor': [0, 2, 3, 5, 7, 8, 10],
    'pentatonic': [0, 2, 4, 7, 9],
    'blues': [0, 3, 5, 6, 7, 10]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    settingsSection.classList.add('hidden');
});

function setupEventListeners() {
    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Settings sliders
    tempoInput.addEventListener('input', () => {
        tempoValue.textContent = tempoInput.value;
    });
    
    resolutionInput.addEventListener('input', () => {
        resolutionValue.textContent = resolutionInput.value;
    });
    
    // Convert button
    convertBtn.addEventListener('click', handleConvert);
    
    // Download buttons
    downloadMidi.addEventListener('click', downloadMidiFile);
    downloadMp3.addEventListener('click', () => alert('MP3 export requires server-side conversion. Please download MIDI file instead.'));
    
    // Reset button
    resetBtn.addEventListener('click', resetApp);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragging');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragging');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragging');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFile(file) {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
        alert('Bitte wählen Sie eine gültige Bilddatei (PNG, JPG, GIF, BMP)');
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        uploadedImage = new Image();
        uploadedImage.onload = () => {
            processImage();
        };
        uploadedImage.src = e.target.result;
        imagePreview.classList.remove('hidden');
        imagePreview.classList.add('fade-in');
    };
    reader.readAsDataURL(file);
}

function processImage() {
    if (!uploadedImage) return;
    
    const resolution = parseInt(resolutionInput.value) || 1;
    const width = uploadedImage.width;
    const height = uploadedImage.height;
    const total_pixels = Math.floor(width / resolution) * Math.floor(height / resolution);
    
    displayImageInfo({
        width: width,
        height: height,
        total_pixels: total_pixels,
        mode: 'RGB'
    });
    
    settingsSection.classList.remove('hidden');
    settingsSection.classList.add('fade-in');
    convertBtn.disabled = false;
}

function displayImageInfo(info) {
    imageInfo.innerHTML = `
        <p><strong>Breite:</strong> ${info.width}px</p>
        <p><strong>Höhe:</strong> ${info.height}px</p>
        <p><strong>Pixel gesamt:</strong> ${info.total_pixels.toLocaleString()}</p>
        <p><strong>Modus:</strong> ${info.mode}</p>
    `;
}

function handleConvert() {
    if (!uploadedImage || !uploadedImage.complete) {
        alert('Bitte laden Sie zuerst ein Bild hoch');
        return;
    }
    
    try {
        // Hide previous results
        resultsSection.classList.add('hidden');
        
        // Show progress
        showProgress('Konvertierung läuft...', 50);
        
        // Get settings
        const tempo = parseInt(tempoInput.value);
        const scale = scaleInput.value;
        const mode = modeInput.value;
        const resolution = parseInt(resolutionInput.value) || 1;
        
        // Reprocess image with current resolution
        const canvas = document.createElement('canvas');
        canvas.width = uploadedImage.width;
        canvas.height = uploadedImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(uploadedImage, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Extract pixels with current resolution
        const pixels = [];
        for (let y = 0; y < canvas.height; y += resolution) {
            for (let x = 0; x < canvas.width; x += resolution) {
                const index = (y * canvas.width + x) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                pixels.push({ r, g, b });
            }
        }
        
        // Generate MIDI
        setTimeout(() => {
            try {
                currentMidiBlob = generateMIDI(pixels, tempo, scale, mode);
                
                const noteCount = pixels.length;
                const durationEstimate = noteCount * 0.5; // Default note duration estimate
                
                showProgress('Fertig!', 100);
                
                setTimeout(() => {
                    hideProgress();
                    displayResults({
                        note_count: noteCount,
                        duration_estimate: durationEstimate,
                        midi_file: 'output.mid',
                        mp3_file: null
                    });
                }, 500);
            } catch (error) {
                console.error('Conversion error:', error);
                alert('Fehler bei der Konvertierung: ' + error.message);
                hideProgress();
            }
        }, 100);
    } catch (error) {
        console.error('Conversion error:', error);
        alert('Fehler bei der Konvertierung');
        hideProgress();
    }
}

function displayResults(data) {
    resultsInfo.innerHTML = `
        <p><strong>Noten generiert:</strong> ${data.note_count.toLocaleString()}</p>
        <p><strong>Geschätzte Dauer:</strong> ~${Math.round(data.duration_estimate)} Sekunden</p>
        <p><strong>MIDI-Datei:</strong> Bereit zum Download</p>
        <p><em>MP3-Konvertierung ist im Client-Modus nicht verfügbar</em></p>
    `;
    
    // Hide audio player (not available in client-side mode)
    audioPlayerContainer.classList.add('hidden');
    downloadMp3.disabled = true;
    
    resultsSection.classList.remove('hidden');
    resultsSection.classList.add('fade-in');
}

// RGB to MIDI conversion
function rgbToNote(r, g, b, scale) {
    const scaleNotes = SCALES[scale] || SCALES['chromatic'];
    const baseNote = 60; // Middle C
    
    // Map R (0-255) to pitch across 4 octaves
    const scaleLength = scaleNotes.length;
    const octaves = 4;
    const totalNotes = scaleLength * octaves;
    
    const noteIndex = Math.floor((r / 255) * (totalNotes - 1));
    const octave = Math.floor(noteIndex / scaleLength);
    const scaleDegree = noteIndex % scaleLength;
    
    const pitch = baseNote + (octave * 12) + scaleNotes[scaleDegree];
    
    // Map G (0-255) to MIDI velocity (1-127)
    const velocity = Math.max(1, Math.floor((g / 255) * 127));
    
    // Map B (0-255) to duration (0.1 to 2.0 beats)
    const duration = 0.1 + (b / 255) * 1.9;
    
    return { pitch, velocity, duration };
}

// Generate MIDI file from pixels
function generateMIDI(pixels, tempo, scaleName, mode) {
    const scale = scaleName || 'chromatic';
    
    // Create MIDI file structure
    const midiData = {
        format: 1,
        tracks: [{
            events: []
        }]
    };
    
    let time = 0;
    const track = midiData.tracks[0].events;
    
    // Add tempo
    const microsecondsPerBeat = Math.floor(60000000 / tempo);
    track.push({
        type: 'setTempo',
        time: 0,
        microsecondsPerBeat: microsecondsPerBeat
    });
    
    // Process pixels based on mode
    if (mode === 'linear') {
        pixels.forEach(pixel => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            addNote(track, 0, note.pitch, time, note.duration, note.velocity);
            time += note.duration * 480; // Convert to ticks (480 ticks per beat)
        });
    } else if (mode === 'arpeggio') {
        pixels.forEach(pixel => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            const arpNotes = [note.pitch, note.pitch + 4, note.pitch + 7];
            const noteDuration = note.duration / 3;
            
            arpNotes.forEach(pitch => {
                if (pitch >= 0 && pitch <= 127) {
                    addNote(track, 0, pitch, time, noteDuration, note.velocity);
                    time += noteDuration * 480;
                }
            });
        });
    } else if (mode === 'chords') {
        for (let i = 0; i < pixels.length; i += 3) {
            const chordPixels = pixels.slice(i, i + 3);
            if (chordPixels.length === 0) continue;
            
            const firstNote = rgbToNote(chordPixels[0].r, chordPixels[0].g, chordPixels[0].b, scale);
            const duration = firstNote.duration;
            
            chordPixels.forEach(pixel => {
                const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
                if (note.pitch >= 0 && note.pitch <= 127) {
                    addNote(track, 0, note.pitch, time, duration, note.velocity);
                }
            });
            
            time += duration * 480;
        }
    } else if (mode === 'melodic') {
        let prevPitch = null;
        pixels.forEach(pixel => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            
            // Add passing note for large jumps
            if (prevPitch !== null) {
                const interval = Math.abs(note.pitch - prevPitch);
                if (interval > 12) {
                    const passingPitch = Math.floor((note.pitch + prevPitch) / 2);
                    const passingDuration = note.duration / 3;
                    addNote(track, 0, passingPitch, time, passingDuration, note.velocity);
                    time += passingDuration * 480;
                }
            }
            
            addNote(track, 0, note.pitch, time, note.duration, note.velocity);
            time += note.duration * 480;
            prevPitch = note.pitch;
        });
    } else if (mode === 'rhythmic') {
        pixels.forEach(pixel => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            const intensity = (pixel.r + pixel.g + pixel.b) / (3 * 255);
            
            let duration = note.duration;
            if (intensity > 0.7) {
                duration *= 0.3; // Short staccato
            } else if (intensity < 0.3) {
                duration *= 1.5; // Long sustained
            }
            
            addNote(track, 0, note.pitch, time, duration, note.velocity);
            time += duration * 480;
        });
    } else {
        // Default to linear
        pixels.forEach(pixel => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            addNote(track, 0, note.pitch, time, note.duration, note.velocity);
            time += note.duration * 480;
        });
    }
    
    // End of track
    track.push({
        type: 'endOfTrack',
        time: time
    });
    
    // Convert to MIDI file bytes
    return createMIDIFile(midiData);
}

function addNote(track, channel, pitch, time, duration, velocity) {
    // Note on
    track.push({
        type: 'noteOn',
        time: Math.floor(time),
        channel: channel,
        pitch: Math.min(127, Math.max(0, Math.floor(pitch))),
        velocity: Math.min(127, Math.max(1, Math.floor(velocity)))
    });
    
    // Note off
    track.push({
        type: 'noteOff',
        time: Math.floor(time + duration * 480),
        channel: channel,
        pitch: Math.min(127, Math.max(0, Math.floor(pitch))),
        velocity: 0
    });
}

// Create MIDI file bytes
function createMIDIFile(midiData) {
    const tracks = midiData.tracks;
    const division = 480; // Ticks per beat
    
    // Sort events by time
    tracks.forEach(track => {
        track.events.sort((a, b) => a.time - b.time);
    });
    
    // Build MIDI file
    const bytes = [];
    
    // Helper to append bytes safely
    function appendBytes(arr) {
        for (let i = 0; i < arr.length; i++) {
            bytes.push(arr[i]);
        }
    }
    
    // Header chunk
    appendBytes(stringToBytes('MThd'));
    appendBytes(int32ToBytes(6)); // Header length
    appendBytes(int16ToBytes(midiData.format || 1)); // Format
    appendBytes(int16ToBytes(tracks.length)); // Number of tracks
    appendBytes(int16ToBytes(division)); // Division
    
    // Track chunks
    tracks.forEach(track => {
        const trackBytes = [];
        let lastTime = 0;
        
        function appendToTrack(arr) {
            for (let i = 0; i < arr.length; i++) {
                trackBytes.push(arr[i]);
            }
        }
        
        track.events.forEach(event => {
            const deltaTime = event.time - lastTime;
            appendToTrack(variableLengthToBytes(deltaTime));
            
            if (event.type === 'setTempo') {
                trackBytes.push(0xFF, 0x51, 0x03);
                appendToTrack(int24ToBytes(event.microsecondsPerBeat));
            } else if (event.type === 'noteOn') {
                trackBytes.push(0x90 | event.channel);
                trackBytes.push(event.pitch);
                trackBytes.push(event.velocity);
            } else if (event.type === 'noteOff') {
                trackBytes.push(0x80 | event.channel);
                trackBytes.push(event.pitch);
                trackBytes.push(event.velocity);
            } else if (event.type === 'endOfTrack') {
                trackBytes.push(0xFF, 0x2F, 0x00);
            }
            
            lastTime = event.time;
        });
        
        appendBytes(stringToBytes('MTrk'));
        appendBytes(int32ToBytes(trackBytes.length));
        appendBytes(trackBytes);
    });
    
    return new Blob([new Uint8Array(bytes)], { type: 'audio/midi' });
}

// Helper functions for MIDI file creation
function stringToBytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}

function int16ToBytes(value) {
    return [
        (value >> 8) & 0xFF,
        value & 0xFF
    ];
}

function int24ToBytes(value) {
    return [
        (value >> 16) & 0xFF,
        (value >> 8) & 0xFF,
        value & 0xFF
    ];
}

function int32ToBytes(value) {
    return [
        (value >> 24) & 0xFF,
        (value >> 16) & 0xFF,
        (value >> 8) & 0xFF,
        value & 0xFF
    ];
}

function variableLengthToBytes(value) {
    const bytes = [];
    let buffer = value & 0x7F;
    
    while ((value >>= 7) > 0) {
        buffer <<= 8;
        buffer |= 0x80;
        buffer += (value & 0x7F);
    }
    
    while (true) {
        bytes.push(buffer & 0xFF);
        if (buffer & 0x80) {
            buffer >>= 8;
        } else {
            break;
        }
    }
    
    return bytes;
}

function downloadMidiFile() {
    if (!currentMidiBlob) {
        alert('Keine MIDI-Datei verfügbar');
        return;
    }
    
    const url = URL.createObjectURL(currentMidiBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openmusic-output.mid';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadFile(type, filename) {
    if (!filename) {
        alert('Datei nicht verfügbar');
        return;
    }
    
    window.location.href = `/api/download/${type}/${filename}`;
}

function showProgress(text, percent) {
    progressSection.classList.remove('hidden');
    progressText.textContent = text;
    progressFill.style.width = percent + '%';
}

function hideProgress() {
    progressSection.classList.add('hidden');
    progressFill.style.width = '0%';
}

function resetApp() {
    // Reset state
    uploadedImage = null;
    currentMidiBlob = null;
    
    // Reset UI
    fileInput.value = '';
    imagePreview.classList.add('hidden');
    settingsSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    convertBtn.disabled = true;
    
    // Reset settings to defaults
    tempoInput.value = 120;
    tempoValue.textContent = '120';
    scaleInput.value = 'chromatic';
    modeInput.value = 'linear';
    resolutionInput.value = 1;
    resolutionValue.textContent = '1';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
