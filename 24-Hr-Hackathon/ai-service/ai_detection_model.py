# ai_detection_model.py - Fixed AI detection with proper thresholds
import cv2
import numpy as np
import torch
import base64
from io import BytesIO
from PIL import Image
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import time

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
CONFIG = {
    'PERSON_CONFIDENCE': 0.70,      # Minimum confidence for person detection
    'FIRE_CONFIDENCE': 0.85,        # Minimum confidence for fire detection
    'SMOKE_CONFIDENCE': 0.80,       # Minimum confidence for smoke detection
    'NMS_THRESHOLD': 0.45,          # Non-max suppression threshold
    'IOU_THRESHOLD': 0.3,           # IoU threshold for duplicate removal
    'MIN_PERSON_SIZE': 0.01,        # Minimum size of person bbox relative to image
    'MAX_PERSON_SIZE': 0.8,         # Maximum size of person bbox relative to image
}

# Load YOLOv5 model (or your preferred model)
# For this example, we'll use YOLOv5 for person detection
try:
    model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
    model.conf = CONFIG['PERSON_CONFIDENCE']  # Set confidence threshold
    model.iou = CONFIG['NMS_THRESHOLD']       # Set NMS threshold
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def decode_base64_image(base64_string):
    """Decode base64 image string to numpy array"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        img_data = base64.b64decode(base64_string)
        img = Image.open(BytesIO(img_data))
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        return np.array(img)
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def filter_person_detections(detections, img_width, img_height):
    """Filter person detections based on size and position"""
    filtered = []
    
    for det in detections:
        if det['type'] != 'person':
            filtered.append(det)
            continue
        
        bbox = det['bbox']
        width = bbox[2] - bbox[0]
        height = bbox[3] - bbox[1]
        
        # Calculate relative size
        rel_width = width / img_width
        rel_height = height / img_height
        rel_area = rel_width * rel_height
        
        # Filter based on size constraints
        if (rel_area >= CONFIG['MIN_PERSON_SIZE'] and 
            rel_area <= CONFIG['MAX_PERSON_SIZE'] and
            height > width * 0.8):  # Basic aspect ratio check for people
            filtered.append(det)
    
    return filtered

def remove_duplicate_detections(detections):
    """Remove duplicate detections using IoU"""
    if len(detections) <= 1:
        return detections
    
    # Sort by confidence
    detections.sort(key=lambda x: x['confidence'], reverse=True)
    
    keep = []
    for i, det1 in enumerate(detections):
        duplicate = False
        
        for det2 in keep:
            if det1['type'] == det2['type']:
                iou = calculate_iou(det1['bbox'], det2['bbox'])
                if iou > CONFIG['IOU_THRESHOLD']:
                    duplicate = True
                    break
        
        if not duplicate:
            keep.append(det1)
    
    return keep

def calculate_iou(box1, box2):
    """Calculate Intersection over Union of two bounding boxes"""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    
    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    
    union = area1 + area2 - intersection
    
    return intersection / union if union > 0 else 0

def detect_objects(image):
    """Run object detection on image"""
    detections = []
    
    if model is None or image is None:
        return detections
    
    try:
        # Run inference
        results = model(image)
        
        # Parse results
        for *box, conf, cls in results.xyxy[0]:  # xyxy format
            x1, y1, x2, y2 = [int(x) for x in box]
            class_name = model.names[int(cls)]
            
            # Only include person detections with high confidence
            if class_name == 'person' and conf >= CONFIG['PERSON_CONFIDENCE']:
                detections.append({
                    'type': 'person',
                    'bbox': [x1, y1, x2, y2],
                    'confidence': float(conf)
                })
        
        # Filter detections
        img_height, img_width = image.shape[:2]
        detections = filter_person_detections(detections, img_width, img_height)
        
        # Remove duplicates
        detections = remove_duplicate_detections(detections)
        
    except Exception as e:
        print(f"Error during detection: {e}")
    
    return detections

def mock_fire_smoke_detection(image):
    """Mock fire and smoke detection - replace with actual model"""
    # This is a placeholder - implement actual fire/smoke detection here
    # For now, return no detections to prevent false alerts
    return []

@app.route('/analyze', methods=['POST'])
def analyze_frame():
    """Analyze a single frame"""
    start_time = time.time()
    
    try:
        data = request.json
        base64_image = data.get('frame')
        
        if not base64_image:
            return jsonify({'error': 'No frame provided'}), 400
        
        # Decode image
        image = decode_base64_image(base64_image)
        if image is None:
            return jsonify({'error': 'Failed to decode image'}), 400
        
        # Run person detection
        person_detections = detect_objects(image)
        
        # Run fire/smoke detection (mock for now)
        fire_smoke_detections = mock_fire_smoke_detection(image)
        
        # Combine all detections
        all_detections = person_detections + fire_smoke_detections
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        return jsonify({
            'detections': all_detections,
            'processing_time': processing_time
        })
        
    except Exception as e:
        print(f"Error in analyze_frame: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'config': CONFIG
    })

if __name__ == '__main__':
    print("Starting AI Detection Service...")
    print(f"Configuration: {CONFIG}")
    app.run(host='0.0.0.0', port=5000, debug=False)