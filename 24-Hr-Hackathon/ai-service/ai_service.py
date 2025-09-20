# Simple AI service for demo
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import time
import random

app = Flask(__name__)
CORS(app)

def decode_base64_image(base64_string):
    """Convert base64 string to OpenCV image"""
    try:
        # Remove data URL prefix if present
        if 'base64,' in base64_string:
            base64_string = base64_string.split('base64,')[1]
        
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            print("cv2.imdecode returned None")
            return None
            
        return img
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def analyze_frame(frame):
    """Simple frame analysis"""
    try:
        # Check if frame is valid
        if frame is None or frame.size == 0:
            print("Invalid frame received")
            return {
                'detections': [],
                'crowd_density': 'low',
                'person_count': 0,
                'risk_level': 'low'
            }
        
        print(f"Analyzing frame with shape: {frame.shape}")
        
        # Convert to HSV for color detection
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        detections = []
        
        # Detect orange/red colors (fire simulation)
        lower_fire = np.array([0, 50, 50])
        upper_fire = np.array([20, 255, 255])
        fire_mask = cv2.inRange(hsv, lower_fire, upper_fire)
        
        # Find contours
        contours, _ = cv2.findContours(fire_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        print(f"Found {len(contours)} potential fire regions")
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:  # Significant area
                x, y, w, h = cv2.boundingRect(contour)
                detections.append({
                    'type': 'fire',
                    'bbox': [x, y, x+w, y+h],
                    'confidence': 0.85,
                    'severity': 'high',
                    'area': area
                })
                print(f"Fire detected at {x},{y} with area {area}")
        
        # Simulate crowd detection
        person_count = random.randint(0, 15)
        crowd_density = 'low'
        
        if person_count > 10:
            crowd_density = 'medium'
        if person_count > 20:
            crowd_density = 'high'
            detections.append({
                'type': 'crowd_surge',
                'confidence': 0.75,
                'severity': 'medium',
                'person_count': person_count
            })
        
        # Random person detections
        for i in range(min(person_count, 5)):
            detections.append({
                'type': 'person',
                'bbox': [
                    random.randint(50, 500),
                    random.randint(50, 400),
                    random.randint(80, 120),
                    random.randint(100, 150)
                ],
                'confidence': random.uniform(0.7, 0.95)
            })
        
        return {
            'detections': detections,
            'crowd_density': crowd_density,
            'person_count': person_count,
            'risk_level': 'high' if len(detections) > 5 else 'medium' if len(detections) > 2 else 'low'
        }
    except Exception as e:
        print(f"Error in analyze_frame: {e}")
        import traceback
        traceback.print_exc()
        return {
            'detections': [],
            'crowd_density': 'low',
            'person_count': 0,
            'risk_level': 'low'
        }

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze video frame endpoint"""
    try:
        start_time = time.time()
        
        # Debug: Print what we received
        print("Received request")
        
        data = request.json
        if not data:
            print("No JSON data received")
            return jsonify({'error': 'No JSON data provided'}), 400
            
        frame_base64 = data.get('frame')
        camera_id = data.get('camera_id')
        
        print(f"Camera ID: {camera_id}")
        print(f"Frame data length: {len(frame_base64) if frame_base64 else 0}")
        if frame_base64 and len(frame_base64) < 50:
            print(f"Frame data content: {frame_base64}")
        
        if not frame_base64:
            return jsonify({'error': 'No frame provided'}), 400
        
        # Decode frame
        frame = decode_base64_image(frame_base64)
        if frame is None:
            print("Failed to decode image")
            return jsonify({'error': 'Invalid frame data'}), 400
        
        print(f"Image decoded successfully: {frame.shape}")
        
        # Analyze frame
        results = analyze_frame(frame)
        
        # Add processing time
        results['processing_time'] = time.time() - start_time
        results['timestamp'] = time.time()
        
        return jsonify(results)
        
    except Exception as e:
        print(f"Analysis error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '1.0-simple'
    })

if __name__ == '__main__':
    print("Starting AI Service (Simple Demo Version)...")
    print("Server running on http://localhost:5000")
    print("\nTo test fire detection: Show orange/red objects to camera")
    print("Crowd density is simulated with random values")
    app.run(host='127.0.0.1', port=5000, debug=True)