# AI Event Monitoring System

A real-time AI-powered monitoring system that detects people, crowds, fire, and smoke using computer vision and machine learning. The system provides instant alerts, location tracking, and comprehensive analytics through an intuitive web interface.

## Features

### Core Functionality
- **Real-time Person Detection**: Uses COCO-SSD model for accurate person detection
- **Crowd Monitoring**: Automatic alerts when crowd threshold is exceeded
- **Fire & Smoke Detection**: Color-based analysis for hazard detection
- **Live Camera Feed**: WebRTC-based video streaming with overlay annotations
- **Instant Alerts**: Browser notifications and in-app alert system
- **Location Tracking**: Zone-based monitoring with GPS coordinates

### Additional Features
- **MongoDB Authentication**: Secure user management with JWT tokens
- **Role-Based Access Control**: Admin, user, and viewer roles
- **Alert History**: Complete log of all alerts with location data
- **AI Chatbot Assistant**: Interactive help system for monitoring queries
- **Configurable Settings**: Customizable detection parameters and thresholds
- **Activity Logging**: Comprehensive audit trail for all user actions

## Technology Stack

### Frontend
- **React.js**: UI framework
- **TensorFlow.js**: Client-side AI model execution
- **COCO-SSD**: Pre-trained object detection model
- **Socket.io Client**: Real-time communication
- **WebRTC**: Camera access and video streaming

### Backend
- **Node.js & Express**: Server framework
- **MongoDB**: Database for user management and alerts
- **Socket.io**: WebSocket communication
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing

### AI Service
- **Python**: AI processing service
- **OpenCV**: Computer vision operations
- **YOLO/Custom Models**: Advanced object detection

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Python 3.8+ (for AI service)
- Modern web browser with WebRTC support
- Webcam/Camera device

## Installation

### 1. Clone the Repository
Clone the project repository to your local machine and navigate to the project directory.

### 2. Backend Setup
Navigate to the backend directory and install all required dependencies. Create an environment configuration file with necessary variables including database connection, JWT secret, and server port. Ensure MongoDB is running before starting the backend server.

### 3. Frontend Setup
Navigate to the frontend directory and install all dependencies including TensorFlow models, React webcam, and Socket.io client. Start the React development server.

### 4. AI Service Setup (Optional)
For advanced AI features, navigate to the ai-service directory, install Python dependencies from requirements.txt, and run the AI service.

## Usage

### Default Login Credentials
- Username: admin
- Password: admin123

### Basic Operation
1. **Login**: Access the system using the secure login portal
2. **Allow Camera Access**: Grant permission when prompted
3. **Start Monitoring**: Click the "Start Monitoring" button
4. **View Alerts**: Monitor the alert panel for any detections
5. **Check History**: Navigate to Alert History for past events
6. **Configure Settings**: Adjust detection parameters in Settings

### Detection Thresholds
- **Crowd Alert**: 3 or more people detected
- **Fire Detection**: 0.5% of frame with fire-like colors
- **Smoke Detection**: 2% of frame with smoke-like colors
- **Person Confidence**: 50% minimum confidence score

## Project Structure

The project is organized into three main directories:

- **frontend/**: Contains the React application with all UI components, authentication utilities, and styling files
- **backend/**: Houses the Node.js server, Express routes, MongoDB models, and Socket.io configuration
- **ai-service/**: Python-based AI service with detection models and processing logic

## Configuration

### Environment Variables
The backend requires configuration for:
- Server port number
- MongoDB connection URI
- JWT secret key for authentication
- Node environment (development/production)

### Detection Parameters
The AI detection model can be configured with:
- Minimum and maximum person size thresholds
- IoU threshold for duplicate detection removal
- Confidence score thresholds

## API Endpoints

### Authentication Endpoints
- User login endpoint for authentication
- Token verification endpoint for session validation

### User Management Endpoints (Admin only)
- Retrieve all system users
- Create new user accounts
- Update user passwords

### Alert Management
- Fetch alert history with pagination support
- Update alert status and resolution

### Testing Endpoints
- Simulate crowd scenarios for testing
- Manually set person count for debugging

## Security Features

- **Password Protection**: Industry-standard bcrypt hashing with salt
- **Token Authentication**: Secure JWT-based session management
- **Session Control**: Configurable timeout periods
- **Audit Trail**: Comprehensive activity logging
- **Access Control**: Role-based permissions system
- **CORS Configuration**: Production-ready cross-origin settings

## Testing

The system provides dedicated endpoints for testing various scenarios:
- Crowd simulation for alert testing
- Manual person count adjustment
- Detection threshold validation
- Alert system verification

## Troubleshooting

### Camera Issues
- Ensure HTTPS or localhost connection
- Check browser camera permissions
- Verify webcam availability

### Database Connection
- Confirm MongoDB service is running
- Check connection string configuration
- Verify network accessibility

### WebSocket Connection
- Ensure backend server is operational
- Verify CORS configuration
- Check firewall settings