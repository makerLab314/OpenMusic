// OpenMusic JavaScript
let uploadedFileId = null;
let currentMidiFile = null;
let currentMp3File = null;

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
    downloadMidi.addEventListener('click', () => downloadFile('midi', currentMidiFile));
    downloadMp3.addEventListener('click', () => downloadFile('mp3', currentMp3File));
    
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

async function handleFile(file) {
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
        imagePreview.classList.remove('hidden');
        imagePreview.classList.add('fade-in');
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        showProgress('Bild wird hochgeladen...', 30);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            uploadedFileId = data.file_id;
            displayImageInfo(data.info);
            settingsSection.classList.remove('hidden');
            settingsSection.classList.add('fade-in');
            convertBtn.disabled = false;
            hideProgress();
        } else {
            alert('Fehler beim Hochladen: ' + data.error);
            hideProgress();
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Fehler beim Hochladen des Bildes');
        hideProgress();
    }
}

function displayImageInfo(info) {
    imageInfo.innerHTML = `
        <p><strong>Breite:</strong> ${info.width}px</p>
        <p><strong>Höhe:</strong> ${info.height}px</p>
        <p><strong>Pixel gesamt:</strong> ${info.total_pixels.toLocaleString()}</p>
        <p><strong>Modus:</strong> ${info.mode}</p>
    `;
}

async function handleConvert() {
    if (!uploadedFileId) {
        alert('Bitte laden Sie zuerst ein Bild hoch');
        return;
    }
    
    // Get settings
    const settings = {
        file_id: uploadedFileId,
        tempo: parseInt(tempoInput.value),
        scale: scaleInput.value,
        mode: modeInput.value,
        resolution: parseInt(resolutionInput.value)
    };
    
    try {
        // Hide previous results
        resultsSection.classList.add('hidden');
        
        // Show progress
        showProgress('Konvertierung läuft...', 50);
        
        const response = await fetch('/api/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentMidiFile = data.midi_file;
            currentMp3File = data.mp3_file;
            
            showProgress('Fertig!', 100);
            
            setTimeout(() => {
                hideProgress();
                displayResults(data);
            }, 500);
        } else {
            alert('Fehler bei der Konvertierung: ' + data.error);
            hideProgress();
        }
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
        <p><strong>MIDI-Datei:</strong> ${data.midi_file}</p>
        ${data.mp3_file ? `<p><strong>MP3-Datei:</strong> ${data.mp3_file}</p>` : '<p><em>MP3-Konvertierung nicht verfügbar</em></p>'}
    `;
    
    // Show audio player if MP3 is available
    if (data.mp3_file) {
        audioPlayer.src = `/api/preview/${data.mp3_file}`;
        audioPlayerContainer.classList.remove('hidden');
        downloadMp3.disabled = false;
    } else {
        audioPlayerContainer.classList.add('hidden');
        downloadMp3.disabled = true;
    }
    
    resultsSection.classList.remove('hidden');
    resultsSection.classList.add('fade-in');
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
    uploadedFileId = null;
    currentMidiFile = null;
    currentMp3File = null;
    
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
