"""
Audio Converter Module
Converts MIDI to MP3 using FluidSynth and pydub
"""
import subprocess
import os
from pydub import AudioSegment


class AudioConverter:
    """Convert MIDI files to MP3"""
    
    def __init__(self, midi_path, output_path):
        """
        Initialize audio converter
        
        Args:
            midi_path: Path to input MIDI file
            output_path: Path for output MP3 file
        """
        self.midi_path = midi_path
        self.output_path = output_path
    
    def midi_to_wav(self, wav_path):
        """
        Convert MIDI to WAV using FluidSynth
        
        Args:
            wav_path: Output WAV file path
            
        Returns:
            Path to WAV file or None if failed
        """
        try:
            # Try to use FluidSynth if available
            # fluidsynth -ni soundfont.sf2 input.mid -F output.wav -r 44100
            soundfont = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
            
            # Check if FluidSynth is available
            result = subprocess.run(
                ['which', 'fluidsynth'],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                print("FluidSynth not found, trying alternative method")
                return None
            
            # Check for soundfont
            if not os.path.exists(soundfont):
                # Try alternative soundfont locations
                alternatives = [
                    '/usr/share/soundfonts/default.sf2',
                    '/usr/share/soundfonts/FluidR3_GM.sf2',
                    '/usr/local/share/soundfonts/default.sf2'
                ]
                soundfont = None
                for alt in alternatives:
                    if os.path.exists(alt):
                        soundfont = alt
                        break
                
                if soundfont is None:
                    print("No soundfont found")
                    return None
            
            # Convert MIDI to WAV
            cmd = [
                'fluidsynth',
                '-ni',
                soundfont,
                self.midi_path,
                '-F', wav_path,
                '-r', '44100'
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0 and os.path.exists(wav_path):
                return wav_path
            else:
                print(f"FluidSynth conversion failed: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"Error converting MIDI to WAV: {e}")
            return None
    
    def wav_to_mp3(self, wav_path):
        """
        Convert WAV to MP3 using pydub
        
        Args:
            wav_path: Input WAV file path
            
        Returns:
            Path to MP3 file
        """
        try:
            audio = AudioSegment.from_wav(wav_path)
            audio.export(self.output_path, format='mp3', bitrate='192k')
            return self.output_path
        except Exception as e:
            print(f"Error converting WAV to MP3: {e}")
            return None
    
    def convert(self):
        """
        Convert MIDI to MP3
        
        Returns:
            Path to MP3 file or None if conversion failed
        """
        # Generate temporary WAV file path
        wav_path = self.output_path.replace('.mp3', '.wav')
        
        try:
            # Step 1: MIDI to WAV
            result = self.midi_to_wav(wav_path)
            if result is None:
                print("MIDI to WAV conversion failed")
                return None
            
            # Step 2: WAV to MP3
            mp3_path = self.wav_to_mp3(wav_path)
            
            # Clean up temporary WAV file
            if os.path.exists(wav_path):
                os.remove(wav_path)
            
            return mp3_path
            
        except Exception as e:
            print(f"Conversion error: {e}")
            # Clean up temporary files
            if os.path.exists(wav_path):
                os.remove(wav_path)
            return None
