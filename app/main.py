"""
OpenMusic Flask Application
Main web server for image to music conversion
"""
from flask import Flask, render_template, request, jsonify, send_file
import os
import sys
import uuid
from werkzeug.utils import secure_filename

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.image_processor import ImageProcessor
from app.music_generator import MusicGenerator
from app.audio_converter import AudioConverter


app = Flask(__name__, 
            static_folder='../static',
            template_folder='../templates')

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# Constants for music generation
DEFAULT_NOTE_DURATION = 0.5  # Average note duration in seconds for estimation

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')


@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Handle image upload"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400
    
    # Generate unique filename
    unique_id = str(uuid.uuid4())
    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[1].lower()
    saved_filename = f"{unique_id}.{ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], saved_filename)
    
    file.save(filepath)
    
    # Get image info
    try:
        processor = ImageProcessor(filepath)
        info = processor.get_image_info()
        
        return jsonify({
            'success': True,
            'file_id': unique_id,
            'filename': filename,
            'info': info
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/convert', methods=['POST'])
def convert_to_music():
    """Convert uploaded image to music"""
    data = request.get_json()
    
    file_id = data.get('file_id')
    if not file_id:
        return jsonify({'error': 'No file_id provided'}), 400
    
    # Get conversion parameters
    tempo = int(data.get('tempo', 120))
    scale = data.get('scale', 'chromatic')
    mode = data.get('mode', 'linear')
    resolution = int(data.get('resolution', 1))
    
    # Find uploaded image
    image_path = None
    for ext in ALLOWED_EXTENSIONS:
        path = os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.{ext}")
        if os.path.exists(path):
            image_path = path
            break
    
    if not image_path:
        return jsonify({'error': 'Image file not found'}), 404
    
    try:
        # Process image
        processor = ImageProcessor(image_path, resolution=resolution)
        pixels = processor.scan_pixels()
        
        if not pixels:
            return jsonify({'error': 'No pixels extracted from image'}), 400
        
        # Generate MIDI
        generator = MusicGenerator(pixels, tempo=tempo, scale=scale, mode=mode)
        midi_filename = f"{file_id}.mid"
        midi_path = os.path.join(app.config['OUTPUT_FOLDER'], midi_filename)
        generator.save_midi(midi_path)
        
        # Try to convert to MP3
        mp3_filename = f"{file_id}.mp3"
        mp3_path = os.path.join(app.config['OUTPUT_FOLDER'], mp3_filename)
        
        converter = AudioConverter(midi_path, mp3_path)
        mp3_result = converter.convert()
        
        response = {
            'success': True,
            'midi_file': midi_filename,
            'mp3_file': mp3_filename if mp3_result else None,
            'note_count': len(pixels),
            'duration_estimate': len(pixels) * DEFAULT_NOTE_DURATION
        }
        
        return jsonify(response)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/download/<file_type>/<filename>')
def download_file(file_type, filename):
    """Download generated files"""
    # Security: only allow downloads from output folder
    safe_filename = secure_filename(filename)
    filepath = os.path.join(app.config['OUTPUT_FOLDER'], safe_filename)
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    
    mimetype = 'audio/midi' if file_type == 'midi' else 'audio/mpeg'
    
    return send_file(
        filepath,
        mimetype=mimetype,
        as_attachment=True,
        download_name=safe_filename
    )


@app.route('/api/preview/<filename>')
def preview_audio(filename):
    """Stream audio file for preview"""
    safe_filename = secure_filename(filename)
    filepath = os.path.join(app.config['OUTPUT_FOLDER'], safe_filename)
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(filepath, mimetype='audio/mpeg')


if __name__ == '__main__':
    # Note: Set debug=False in production environments
    # Debug mode is enabled here for development only
    import os
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
