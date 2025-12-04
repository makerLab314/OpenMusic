"""
Image Processor Module
Handles image loading and RGB pixel extraction
"""
from PIL import Image
import numpy as np


class ImageProcessor:
    """Process images and extract RGB values in scan pattern"""
    
    def __init__(self, image_path, resolution=1):
        """
        Initialize the image processor
        
        Args:
            image_path: Path to the image file
            resolution: Sampling resolution (1 = every pixel, 2 = every other pixel, etc.)
        """
        self.image_path = image_path
        self.resolution = max(1, int(resolution))
        self.image = None
        self.pixels = []
        
    def load_image(self):
        """Load and prepare the image"""
        self.image = Image.open(self.image_path)
        # Convert to RGB if not already
        if self.image.mode != 'RGB':
            self.image = self.image.convert('RGB')
        return self.image
    
    def scan_pixels(self):
        """
        Scan image from left to right, top to bottom
        Returns list of (R, G, B) tuples
        """
        if self.image is None:
            self.load_image()
        
        width, height = self.image.size
        self.pixels = []
        
        # Scan from top to bottom, left to right
        for y in range(0, height, self.resolution):
            for x in range(0, width, self.resolution):
                r, g, b = self.image.getpixel((x, y))
                self.pixels.append((r, g, b))
        
        return self.pixels
    
    def get_image_info(self):
        """Get basic image information"""
        if self.image is None:
            self.load_image()
        
        width, height = self.image.size
        total_pixels = (width // self.resolution) * (height // self.resolution)
        
        return {
            'width': width,
            'height': height,
            'mode': self.image.mode,
            'total_pixels': total_pixels,
            'resolution': self.resolution
        }
