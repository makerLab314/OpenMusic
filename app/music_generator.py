"""
Music Generator Module
Converts RGB pixel data to MIDI music
"""
from midiutil import MIDIFile
import math


class MusicGenerator:
    """Generate MIDI music from RGB pixel data"""
    
    # Musical scales (MIDI note numbers relative to C)
    SCALES = {
        'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        'major': [0, 2, 4, 5, 7, 9, 11],
        'minor': [0, 2, 3, 5, 7, 8, 10],
        'pentatonic': [0, 2, 4, 7, 9],
        'blues': [0, 3, 5, 6, 7, 10],
    }
    
    def __init__(self, pixels, tempo=120, scale='chromatic', mode='linear', base_note=60):
        """
        Initialize music generator
        
        Args:
            pixels: List of (R, G, B) tuples
            tempo: BPM (beats per minute)
            scale: Musical scale to use
            mode: Playback mode (linear, arpeggio, chords, melodic, rhythmic)
            base_note: Base MIDI note (middle C = 60)
        """
        self.pixels = pixels
        self.tempo = tempo
        self.scale = self.SCALES.get(scale, self.SCALES['chromatic'])
        self.mode = mode
        self.base_note = base_note
        self.midi = None
        
    def rgb_to_note(self, r, g, b):
        """
        Convert RGB values to musical parameters
        
        Args:
            r: Red value (0-255) -> pitch
            g: Green value (0-255) -> velocity
            b: Blue value (0-255) -> duration
            
        Returns:
            (pitch, velocity, duration) tuple
        """
        # Map R (0-255) to pitch across multiple octaves
        # Using 4 octaves range (48 notes)
        scale_length = len(self.scale)
        octaves = 4
        total_notes = scale_length * octaves
        
        # Map red value to a note in the scale
        note_index = int((r / 255) * (total_notes - 1))
        octave = note_index // scale_length
        scale_degree = note_index % scale_length
        
        pitch = self.base_note + (octave * 12) + self.scale[scale_degree]
        
        # Map G (0-255) to MIDI velocity (0-127)
        velocity = int((g / 255) * 127)
        velocity = max(1, velocity)  # Ensure at least velocity 1
        
        # Map B (0-255) to duration (0.1 to 2.0 beats)
        duration = 0.1 + (b / 255) * 1.9
        
        return pitch, velocity, duration
    
    def generate_linear(self):
        """Generate music in linear mode (one note per pixel)"""
        track = 0
        channel = 0
        time = 0  # Start at beat 0
        
        self.midi = MIDIFile(1)
        self.midi.addTempo(track, time, self.tempo)
        
        for r, g, b in self.pixels:
            pitch, velocity, duration = self.rgb_to_note(r, g, b)
            self.midi.addNote(track, channel, pitch, time, duration, velocity)
            time += duration
        
        return self.midi
    
    def generate_arpeggio(self):
        """Generate arpeggiated notes"""
        track = 0
        channel = 0
        time = 0
        
        self.midi = MIDIFile(1)
        self.midi.addTempo(track, time, self.tempo)
        
        for i, (r, g, b) in enumerate(self.pixels):
            base_pitch, velocity, duration = self.rgb_to_note(r, g, b)
            
            # Create arpeggio pattern (root, third, fifth)
            arp_notes = [base_pitch, base_pitch + 4, base_pitch + 7]
            note_duration = duration / len(arp_notes)
            
            for note in arp_notes:
                # Ensure note is in valid MIDI range
                if 0 <= note <= 127:
                    self.midi.addNote(track, channel, note, time, note_duration, velocity)
                    time += note_duration
        
        return self.midi
    
    def generate_chords(self):
        """Generate chords from neighboring pixels"""
        track = 0
        channel = 0
        time = 0
        
        self.midi = MIDIFile(1)
        self.midi.addTempo(track, time, self.tempo)
        
        # Group pixels in sets of 3 for chords
        for i in range(0, len(self.pixels), 3):
            chord_pixels = self.pixels[i:i+3]
            if not chord_pixels:
                continue
            
            # Use first pixel for duration
            _, _, b = chord_pixels[0]
            duration = 0.1 + (b / 255) * 1.9
            
            # Add each note in the chord
            for r, g, _ in chord_pixels:
                pitch, velocity, _ = self.rgb_to_note(r, g, b)
                if 0 <= pitch <= 127:
                    self.midi.addNote(track, channel, pitch, time, duration, velocity)
            
            time += duration
        
        return self.midi
    
    def generate_melodic(self):
        """Generate melodic music with smooth transitions"""
        track = 0
        channel = 0
        time = 0
        
        self.midi = MIDIFile(1)
        self.midi.addTempo(track, time, self.tempo)
        
        prev_pitch = None
        
        for r, g, b in self.pixels:
            pitch, velocity, duration = self.rgb_to_note(r, g, b)
            
            # Smooth large jumps
            if prev_pitch is not None:
                interval = abs(pitch - prev_pitch)
                if interval > 12:  # More than an octave
                    # Insert a passing note
                    passing_pitch = (pitch + prev_pitch) // 2
                    passing_duration = duration / 3
                    self.midi.addNote(track, channel, passing_pitch, time, passing_duration, velocity)
                    time += passing_duration
                    duration = duration * 2 / 3
            
            self.midi.addNote(track, channel, pitch, time, duration, velocity)
            time += duration
            prev_pitch = pitch
        
        return self.midi
    
    def generate_rhythmic(self):
        """Generate rhythmic variations based on color intensity"""
        track = 0
        channel = 0
        time = 0
        
        self.midi = MIDIFile(1)
        self.midi.addTempo(track, time, self.tempo)
        
        for r, g, b in self.pixels:
            pitch, velocity, base_duration = self.rgb_to_note(r, g, b)
            
            # Calculate intensity (brightness)
            intensity = (r + g + b) / (3 * 255)
            
            # High intensity = shorter, more frequent notes
            # Low intensity = longer, sustained notes
            if intensity > 0.7:
                # Short staccato notes
                duration = base_duration * 0.3
            elif intensity < 0.3:
                # Long sustained notes
                duration = base_duration * 1.5
            else:
                duration = base_duration
            
            self.midi.addNote(track, channel, pitch, time, duration, velocity)
            time += duration
        
        return self.midi
    
    def generate(self):
        """Generate MIDI based on selected mode"""
        mode_generators = {
            'linear': self.generate_linear,
            'arpeggio': self.generate_arpeggio,
            'chords': self.generate_chords,
            'melodic': self.generate_melodic,
            'rhythmic': self.generate_rhythmic,
        }
        
        generator = mode_generators.get(self.mode, self.generate_linear)
        return generator()
    
    def save_midi(self, output_path):
        """Save MIDI file to disk"""
        if self.midi is None:
            self.generate()
        
        with open(output_path, 'wb') as output_file:
            self.midi.writeFile(output_file)
        
        return output_path
