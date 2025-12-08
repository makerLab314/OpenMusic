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
const scanPatternInput = document.getElementById('scanPattern');
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
    downloadMp3.addEventListener('click', () => alert('MP3-Export erfordert serverseitige Konvertierung. Bitte laden Sie stattdessen die MIDI-Datei herunter.'));
    
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
    
    const numRegions = parseInt(resolutionInput.value) || 1000;
    const width = uploadedImage.width;
    const height = uploadedImage.height;
    
    displayImageInfo({
        width: width,
        height: height,
        total_pixels: numRegions,
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
        <p><strong>Regionen/Noten:</strong> ${info.total_pixels.toLocaleString()}</p>
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
        const scanPattern = scanPatternInput ? scanPatternInput.value : 'linear';
        const numRegions = parseInt(resolutionInput.value) || 1000;
        
        // Process image with region-based interpolation
        const canvas = document.createElement('canvas');
        canvas.width = uploadedImage.width;
        canvas.height = uploadedImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(uploadedImage, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Extract pixels using selected scanning pattern
        const pixels = extractPixelsWithPattern(imageData, canvas.width, canvas.height, numRegions, scanPattern);
        
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

// Extract regions from image by dividing it into a specified number of regions
// and averaging the RGB values within each region
function extractRegions(imageData, width, height, numRegions) {
    const pixels = [];
    const totalPixels = width * height;
    
    // Calculate the size of each region
    const pixelsPerRegion = Math.floor(totalPixels / numRegions);
    
    // Ensure we have at least 1 pixel per region
    if (pixelsPerRegion < 1) {
        // If requesting more regions than pixels, fall back to one region per pixel
        for (let i = 0; i < totalPixels; i++) {
            const index = i * 4;
            pixels.push({
                r: imageData.data[index],
                g: imageData.data[index + 1],
                b: imageData.data[index + 2]
            });
        }
        return pixels.slice(0, numRegions);
    }
    
    // Process the image in regions
    for (let regionIdx = 0; regionIdx < numRegions; regionIdx++) {
        const startPixel = regionIdx * pixelsPerRegion;
        // For the last region, extend to the end to include all remaining pixels
        const endPixel = (regionIdx === numRegions - 1) ? totalPixels : (regionIdx + 1) * pixelsPerRegion;
        
        // Average RGB values in this region
        let sumR = 0, sumG = 0, sumB = 0;
        let count = 0;
        
        for (let pixelIdx = startPixel; pixelIdx < endPixel; pixelIdx++) {
            const index = pixelIdx * 4;
            sumR += imageData.data[index];
            sumG += imageData.data[index + 1];
            sumB += imageData.data[index + 2];
            count++;
        }
        
        // Calculate average (count should always be > 0)
        pixels.push({
            r: Math.round(sumR / count),
            g: Math.round(sumG / count),
            b: Math.round(sumB / count)
        });
    }
    
    return pixels;
}

// NEW: Extract pixels using different scanning patterns for more musical variety
function extractPixelsWithPattern(imageData, width, height, numRegions, pattern) {
    const getPixel = (x, y) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return null;
        const index = (y * width + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2]
        };
    };
    
    const pixels = [];
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    switch (pattern) {
        case 'spiral':
            // Spiral from center outward
            let x = centerX, y = centerY;
            let dx = 0, dy = -1;
            let steps = 1, stepCount = 0, turnCount = 0;
            
            for (let i = 0; i < numRegions && (x >= 0 && x < width && y >= 0 && y < height); i++) {
                const pixel = getPixel(x, y);
                if (pixel) pixels.push(pixel);
                
                x += dx;
                y += dy;
                stepCount++;
                
                if (stepCount === steps) {
                    stepCount = 0;
                    turnCount++;
                    // Rotate direction: up -> right -> down -> left
                    const temp = dx;
                    dx = -dy;
                    dy = temp;
                    
                    if (turnCount === 2) {
                        turnCount = 0;
                        steps++;
                    }
                }
            }
            break;
            
        case 'diagonal':
            // Diagonal scanning from top-left to bottom-right
            const step = Math.ceil(Math.sqrt(width * height / numRegions));
            for (let d = 0; d < width + height && pixels.length < numRegions; d++) {
                for (let i = 0; i <= d; i++) {
                    const x = i;
                    const y = d - i;
                    if (x < width && y < height && x % step === 0 && y % step === 0) {
                        const pixel = getPixel(x, y);
                        if (pixel && pixels.length < numRegions) pixels.push(pixel);
                    }
                }
            }
            break;
            
        case 'wave':
            // Sine wave pattern across the image
            const amplitude = height / 4;
            const frequency = 3 * Math.PI / width;
            for (let i = 0; i < numRegions; i++) {
                const x = Math.floor((i / numRegions) * width);
                const y = Math.floor(centerY + amplitude * Math.sin(frequency * x));
                const pixel = getPixel(x, y);
                if (pixel) pixels.push(pixel);
            }
            break;
            
        case 'circular':
            // Concentric circles from center
            const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
            const radiusStep = maxRadius / Math.sqrt(numRegions);
            let angle = 0;
            const angleStep = 0.1;
            
            for (let i = 0; i < numRegions; i++) {
                const radius = (i / numRegions) * maxRadius;
                const x = Math.floor(centerX + radius * Math.cos(angle));
                const y = Math.floor(centerY + radius * Math.sin(angle));
                const pixel = getPixel(x, y);
                if (pixel) pixels.push(pixel);
                angle += angleStep + (radius / maxRadius) * 0.2; // Vary angle speed
            }
            break;
            
        case 'random':
            // Random sampling for unpredictable music
            const sampled = new Set();
            while (pixels.length < numRegions) {
                const x = Math.floor(Math.random() * width);
                const y = Math.floor(Math.random() * height);
                const key = `${x},${y}`;
                if (!sampled.has(key)) {
                    sampled.add(key);
                    const pixel = getPixel(x, y);
                    if (pixel) pixels.push(pixel);
                }
            }
            break;
            
        case 'checkerboard':
            // Checkerboard pattern alternating sampling
            const cbStep = Math.ceil(Math.sqrt(width * height / (numRegions * 2)));
            for (let y = 0; y < height && pixels.length < numRegions; y += cbStep) {
                for (let x = ((y / cbStep) % 2) * cbStep; x < width && pixels.length < numRegions; x += cbStep * 2) {
                    const pixel = getPixel(x, y);
                    if (pixel) pixels.push(pixel);
                }
            }
            break;
            
        case 'zigzag':
            // Zigzag pattern left-to-right then right-to-left
            const zzStep = Math.ceil(Math.sqrt(width * height / numRegions));
            for (let y = 0; y < height && pixels.length < numRegions; y += zzStep) {
                if (Math.floor(y / zzStep) % 2 === 0) {
                    // Left to right
                    for (let x = 0; x < width && pixels.length < numRegions; x += zzStep) {
                        const pixel = getPixel(x, y);
                        if (pixel) pixels.push(pixel);
                    }
                } else {
                    // Right to left
                    for (let x = width - 1; x >= 0 && pixels.length < numRegions; x -= zzStep) {
                        const pixel = getPixel(x, y);
                        if (pixel) pixels.push(pixel);
                    }
                }
            }
            break;
            
        case 'fibonacci':
            // Fibonacci spiral pattern
            const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
            for (let i = 0; i < numRegions; i++) {
                const angle = i * 2 * Math.PI / phi;
                const radius = Math.sqrt(i) * Math.min(width, height) / (2 * Math.sqrt(numRegions));
                const x = Math.floor(centerX + radius * Math.cos(angle));
                const y = Math.floor(centerY + radius * Math.sin(angle));
                const pixel = getPixel(x, y);
                if (pixel) pixels.push(pixel);
            }
            break;
            
        default:
            // Fallback to standard region extraction
            return extractRegions(imageData, width, height, numRegions);
    }
    
    // If we didn't get enough pixels, fill with remaining from standard extraction
    if (pixels.length < numRegions) {
        const remaining = extractRegions(imageData, width, height, numRegions - pixels.length);
        pixels.push(...remaining);
    }
    
    return pixels.slice(0, numRegions);
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
    } else if (mode === 'harmonic') {
        // Harmonic series mode - uses overtone relationships
        pixels.forEach((pixel, i) => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            const harmonics = [1, 2, 3, 4, 5]; // First 5 harmonics
            const selectedHarmonic = harmonics[i % harmonics.length];
            
            // Adjust pitch based on harmonic
            let harmonicPitch = note.pitch + Math.floor(12 * Math.log2(selectedHarmonic));
            harmonicPitch = Math.min(127, Math.max(0, harmonicPitch));
            
            addNote(track, 0, harmonicPitch, time, note.duration, note.velocity);
            time += note.duration * 480;
        });
    } else if (mode === 'fibonacci-rhythm') {
        // Fibonacci sequence for rhythm variations
        const fib = [1, 1, 2, 3, 5, 8, 13];
        pixels.forEach((pixel, i) => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            const fibIndex = i % fib.length;
            const rhythmMultiplier = fib[fibIndex] / 8; // Normalize
            
            const duration = note.duration * rhythmMultiplier;
            addNote(track, 0, note.pitch, time, duration, note.velocity);
            time += duration * 480;
        });
    } else if (mode === 'golden-ratio') {
        // Golden ratio for musical proportions
        const phi = (1 + Math.sqrt(5)) / 2;
        pixels.forEach((pixel, i) => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            
            // Apply golden ratio to duration
            const duration = i % 2 === 0 ? note.duration * phi : note.duration / phi;
            
            // Apply golden ratio to velocity
            const velocity = Math.floor(note.velocity * (1 - (i % 10) / 10 / phi));
            
            addNote(track, 0, note.pitch, time, duration, Math.max(1, velocity));
            time += duration * 480;
        });
    } else if (mode === 'wave-modulation') {
        // Sine wave modulation for pitch and rhythm
        pixels.forEach((pixel, i) => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            const phase = (i / pixels.length) * 2 * Math.PI;
            
            // Modulate pitch with sine wave
            const pitchMod = Math.floor(12 * Math.sin(phase * 3));
            const modulatedPitch = Math.min(127, Math.max(0, note.pitch + pitchMod));
            
            // Modulate duration with cosine wave
            const durationMod = 0.5 + 0.5 * Math.cos(phase * 2);
            const duration = note.duration * durationMod;
            
            addNote(track, 0, modulatedPitch, time, duration, note.velocity);
            time += duration * 480;
        });
    } else if (mode === 'polyrhythm') {
        // Polyrhythmic patterns with overlapping notes
        const rhythms = [3, 4, 5]; // 3:4:5 polyrhythm
        pixels.forEach((pixel, i) => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            
            rhythms.forEach((rhythm, r) => {
                if (i % rhythm === 0) {
                    const pitchOffset = r * 7; // Offset by fifths
                    const adjustedPitch = Math.min(127, note.pitch + pitchOffset);
                    const duration = note.duration * (rhythm / 4);
                    const velocity = Math.floor(note.velocity * (1 - r * 0.2));
                    
                    addNote(track, 0, adjustedPitch, time, duration, Math.max(1, velocity));
                }
            });
            
            time += note.duration * 480;
        });
    } else if (mode === 'fractal') {
        // Fractal pattern - self-similar at different scales
        const depth = 3;
        const fractalPattern = (pixel, level, baseTime) => {
            if (level > depth) return;
            
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            const scaleFactor = Math.pow(0.5, level);
            const duration = note.duration * scaleFactor;
            const velocity = Math.floor(note.velocity * (1 - level * 0.15));
            
            addNote(track, 0, note.pitch, baseTime, duration, Math.max(1, velocity));
            
            // Recursive calls for fractal pattern
            if (level < depth) {
                fractalPattern(pixel, level + 1, baseTime + duration * 240);
            }
        };
        
        pixels.forEach((pixel, i) => {
            if (i % 5 === 0) { // Apply fractal to every 5th note
                fractalPattern(pixel, 0, time);
            } else {
                const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
                addNote(track, 0, note.pitch, time, note.duration, note.velocity);
            }
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            time += note.duration * 480;
        });
    } else if (mode === 'palindrome') {
        // Palindromic structure - plays forward then backward
        const half = Math.floor(pixels.length / 2);
        const forwardPixels = pixels.slice(0, half);
        const backwardPixels = [...forwardPixels].reverse();
        const allPixels = [...forwardPixels, ...backwardPixels];
        
        allPixels.forEach(pixel => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            addNote(track, 0, note.pitch, time, note.duration, note.velocity);
            time += note.duration * 480;
        });
    } else if (mode === 'canon') {
        // Canon mode - melody follows itself at an interval
        const delayBeats = 4;
        const delayTicks = delayBeats * 480;
        const pitchInterval = 7; // Perfect fifth
        
        pixels.forEach((pixel, i) => {
            const note = rgbToNote(pixel.r, pixel.g, pixel.b, scale);
            
            // Original voice
            addNote(track, 0, note.pitch, time, note.duration, note.velocity);
            
            // Following voice at interval
            const canonPitch = Math.min(127, note.pitch + pitchInterval);
            const canonVelocity = Math.floor(note.velocity * 0.7);
            addNote(track, 0, canonPitch, time + delayTicks, note.duration, canonVelocity);
            
            time += note.duration * 480;
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
    // MIDI Variable Length Quantity encoding
    // Most significant byte first, continuation bit (0x80) on all but last byte
    const bytes = [];
    
    // Handle special case of 0
    if (value === 0) {
        return [0];
    }
    
    // Build the bytes in reverse order first
    bytes.push(value & 0x7F); // Last byte has no continuation bit
    value >>= 7;
    
    while (value > 0) {
        bytes.push((value & 0x7F) | 0x80); // Set continuation bit
        value >>= 7;
    }
    
    // Reverse to get most significant byte first
    return bytes.reverse();
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
    if (scanPatternInput) scanPatternInput.value = 'linear';
    resolutionInput.value = 1000;
    resolutionValue.textContent = '1000';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
