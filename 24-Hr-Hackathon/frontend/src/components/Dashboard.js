// Dashboard.js - Complete Dashboard Component with MongoDB Integration
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import io from 'socket.io-client';
import axios from 'axios';
import { 
  Camera, Shield, Users, AlertTriangle, Activity, 
  BarChart3, TrendingUp, Clock, MapPin, Zap,
  ChevronRight, LogOut, Settings, Bell, Grid,
  Play, Pause, AlertCircle, CheckCircle, Wifi, WifiOff,
  Eye, EyeOff, Menu, X, Calendar, Download, Database
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  // Refs
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  
  // State variables
  const [isConnected, setIsConnected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [currentDetections, setCurrentDetections] = useState([]);
  const [incidents, setIncidents] = useState([]);  // MongoDB incidents
  const [alerts, setAlerts] = useState([]);  // Real-time alerts
  const [crowdDensity, setCrowdDensity] = useState('low');
  const [personCount, setPersonCount] = useState(0);
  const [riskLevel, setRiskLevel] = useState('low');
  const [processingTime, setProcessingTime] = useState(0);
  const [selectedView, setSelectedView] = useState('monitoring');
  const [notifications, setNotifications] = useState([]);
  const [dbConnected, setDbConnected] = useState(false);
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const FPS = 5;
  const CAMERA_ID = 'CAM-001';
  const LOCATION = {
    zone: 'Main Entrance',
    building: 'Building A',
    floor: 'Ground Floor',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  };

  // Mock data for demonstration
  const mockActivityLog = [
    { id: 1, time: '10:23 AM', event: 'Crowd surge detected', severity: 'medium' },
    { id: 2, time: '10:15 AM', event: 'System calibration completed', severity: 'info' },
    { id: 3, time: '09:45 AM', event: 'Fire alarm test', severity: 'low' },
  ];

  // ==========================================
  // MongoDB Integration - Fetch Incidents
  // ==========================================
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/incidents');
        setIncidents(response.data);
      } catch (error) {
        console.error('Error fetching incidents:', error);
      }
    };
    
    // Fetch on component mount
    fetchIncidents();
    
    // Fetch every 10 seconds for updates
    const interval = setInterval(fetchIncidents, 10000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // MongoDB Integration - Fetch Stats
  // ==========================================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // MongoDB Integration - Check Connection
  // ==========================================
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get('http://localhost:3001/health');
        setDbConnected(response.data.mongoConnected);
      } catch (error) {
        console.error('Health check failed:', error);
        setDbConnected(false);
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // MongoDB Integration - Update Incident
  // ==========================================
  const updateIncidentStatus = async (incidentId, newStatus) => {
    try {
      await axios.patch(`http://localhost:3001/api/incidents/${incidentId}`, {
        status: newStatus,
        verified: newStatus === 'verified',
        verified_by: 'System Operator',
        notes: `Status changed to ${newStatus}`
      });
      
      // Refresh incidents after update
      const response = await axios.get('http://localhost:3001/api/incidents');
      setIncidents(response.data);
    } catch (error) {
      console.error('Failed to update incident:', error);
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // WebSocket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:3001');
    
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });
    
    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      setIsMonitoring(false);
    });
    
    socketRef.current.on('frame-analysis', (data) => {
      setCurrentDetections(data.detections || []);
      setCrowdDensity(data.crowd_density);
      setPersonCount(data.person_count || 0);
      setRiskLevel(data.risk_level);
      setProcessingTime(Math.round((data.processing_time || 0) * 1000));
    });
    
    socketRef.current.on('incident-alert', (data) => {
      const newAlert = {
        id: data.incident._id || Date.now(),
        type: data.incident.type,
        severity: data.incident.severity,
        timestamp: new Date().toLocaleTimeString(),
        location: data.incident.location || LOCATION,
        description: data.incident.description || 'Incident detected'
      };
      
      setAlerts(prev => [newAlert, ...prev].slice(0, 10));
      
      // Show toast notification
      const notification = {
        id: Date.now(),
        type: newAlert.severity,
        message: `${newAlert.type.replace('_', ' ').toUpperCase()} detected at ${newAlert.location.zone}`,
        location: `${newAlert.location.building} - ${newAlert.location.floor}`
      };
      
      setNotifications(prev => [...prev, notification]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
      
      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Security Alert', {
          body: `${newAlert.type} detected at ${newAlert.location.zone}`,
          icon: '/icon.png'
        });
      }
      
      // Refresh incidents from MongoDB
      fetchIncidentsFromDB();
    });
    
    socketRef.current.on('service-status', (status) => {
      console.log('Service status:', status);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Helper function to fetch incidents
  const fetchIncidentsFromDB = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/incidents');
      setIncidents(response.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  // Capture and analyze frames
  const captureAndAnalyze = useCallback(() => {
    if (!webcamRef.current || !isMonitoring) return;
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc || imageSrc.length < 100) {
        return;
      }
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      
      img.src = imageSrc;
      
      socketRef.current.emit('video-frame', {
        frame: imageSrc,
        camera_id: CAMERA_ID,
        timestamp: Date.now(),
        location: LOCATION,
        metadata: {
          fps: FPS,
          resolution: '640x480',
          monitoring_active: isMonitoring
        }
      });
    } catch (error) {
      console.error('Error in captureAndAnalyze:', error);
    }
  }, [isMonitoring]);

  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(captureAndAnalyze, 1000 / FPS);
    return () => clearInterval(interval);
  }, [isMonitoring, captureAndAnalyze]);

  const toggleMonitoring = () => {
    if (!isWebcamReady) {
      alert('Webcam is not ready yet. Please allow camera access.');
      return;
    }
    
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      setAlerts([]);
    }
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500'
    };
    return colors[level] || colors.low;
  };

  const getRiskLevelIcon = (level) => {
    if (level === 'critical' || level === 'high') return <AlertTriangle className="w-4 h-4" />;
    if (level === 'medium') return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  // Export incidents to CSV
  const exportIncidents = () => {
    const data = incidents.map(i => ({
      time: new Date(i.created_at).toLocaleString(),
      type: i.type,
      location: `${i.location?.zone} - ${i.location?.building} - ${i.location?.floor}`,
      coordinates: `${i.location?.coordinates.lat}, ${i.location?.coordinates.lng}`,
      severity: i.severity,
      status: i.status
    }));
    const csv = 'Time,Type,Location,Coordinates,Severity,Status\n' + 
      data.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`animate-pulse p-4 rounded-lg shadow-lg backdrop-blur-xl border ${
              notification.type === 'critical' || notification.type === 'high'
                ? 'bg-red-500/90 border-red-400'
                : notification.type === 'medium'
                ? 'bg-yellow-500/90 border-yellow-400'
                : 'bg-blue-500/90 border-blue-400'
            }`}
            style={{
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{notification.message}</p>
                <p className="text-sm opacity-90">{notification.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors lg:hidden"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">SecureWatch AI</h1>
                  <p className="text-xs text-slate-400">Real-time Monitoring</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm ${
                isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm ${
                dbConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                <Database size={16} />
                <span>{dbConnected ? 'DB Connected' : 'DB Offline'}</span>
              </div>
              
              <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors relative">
                <Bell size={20} />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </button>
              
              <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static lg:translate-x-0 z-40 w-64 h-full bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 transition-transform duration-300`}>
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setSelectedView('monitoring')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                selectedView === 'monitoring' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-700/50'
              }`}
            >
              <Camera size={20} />
              <span>Live Monitoring</span>
            </button>
            
            <button
              onClick={() => setSelectedView('incidents')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                selectedView === 'incidents' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-700/50'
              }`}
            >
              <AlertTriangle size={20} />
              <span>Incidents</span>
            </button>
            
            <button
              onClick={() => setSelectedView('analytics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                selectedView === 'analytics' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 size={20} />
              <span>Analytics</span>
            </button>
          </nav>
          
          {/* System Health */}
          <div className="p-4 mt-auto">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">System Health</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">CPU Usage</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-slate-400">Memory</span>
                  <span>62%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {selectedView === 'monitoring' && (
              <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Total Incidents</p>
                        <p className="text-3xl font-bold mt-1">{stats?.todayIncidents || 0}</p>
                        <p className="text-xs text-green-400 mt-2">Today</p>
                      </div>
                      <div className="p-3 bg-red-500/20 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Active Incidents</p>
                        <p className="text-3xl font-bold mt-1">{stats?.activeIncidents || 0}</p>
                        <p className="text-xs text-yellow-400 mt-2">Requires attention</p>
                      </div>
                      <div className="p-3 bg-yellow-500/20 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">People Count</p>
                        <p className="text-3xl font-bold mt-1">{personCount}</p>
                        <p className="text-xs text-slate-400 mt-2">Current occupancy</p>
                      </div>
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Users className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Response Time</p>
                        <p className="text-3xl font-bold mt-1">{processingTime}ms</p>
                        <p className="text-xs text-green-400 mt-2">↑ Optimal</p>
                      </div>
                      <div className="p-3 bg-green-500/20 rounded-lg">
                        <Zap className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Video Feed */}
                  <div className="lg:col-span-2">
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50">
                      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <h2 className="font-semibold">Camera Feed - {CAMERA_ID}</h2>
                          <span className="text-xs text-slate-400">{LOCATION.zone}</span>
                        </div>
                        
                        <button
                          onClick={toggleMonitoring}
                          disabled={!isWebcamReady}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                            isMonitoring
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          } ${!isWebcamReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isMonitoring ? <Pause size={16} /> : <Play size={16} />}
                          <span>{isMonitoring ? 'Stop' : 'Start'} Monitoring</span>
                        </button>
                      </div>
                      
                      <div className="relative aspect-video bg-slate-900">
                        <Webcam
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="absolute inset-0 w-full h-full object-cover opacity-0"
                          videoConstraints={{
                            width: 640,
                            height: 480,
                            facingMode: "user"
                          }}
                          onUserMedia={() => setIsWebcamReady(true)}
                          onUserMediaError={(error) => {
                            console.error('Webcam error:', error);
                            alert('Please allow camera access to use this application');
                          }}
                        />
                        <canvas
                          ref={canvasRef}
                          width={640}
                          height={480}
                          className="w-full h-full object-contain"
                        />
                        
                        {/* Overlay Stats */}
                        <div className="absolute top-4 left-4 space-y-2">
                          <div className="bg-slate-900/80 backdrop-blur rounded-lg px-3 py-2 flex items-center space-x-2">
                            <Users size={16} />
                            <span className="text-sm">People: {personCount}</span>
                          </div>
                          <div className="bg-slate-900/80 backdrop-blur rounded-lg px-3 py-2 flex items-center space-x-2">
                            <Activity size={16} />
                            <span className="text-sm">Density: {crowdDensity}</span>
                          </div>
                        </div>
                        
                        {/* Risk Level Badge */}
                        <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg flex items-center space-x-2 ${getRiskLevelColor(riskLevel)} bg-opacity-20 backdrop-blur`}>
                          {getRiskLevelIcon(riskLevel)}
                          <span className="text-sm font-medium uppercase">Risk: {riskLevel}</span>
                        </div>
                        
                        {!isWebcamReady && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                            <div className="text-center">
                              <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                              <p className="text-slate-400">Initializing camera...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Incidents Panel */}
                  <div className="space-y-4">
                    {/* Recent Incidents from MongoDB */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50">
                      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                        <h3 className="font-semibold">Recent Incidents</h3>
                        <span className="text-xs text-slate-400">{incidents.length} total</span>
                      </div>
                      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                        {incidents.length === 0 ? (
                          <p className="text-center text-slate-500 py-8">No incidents yet</p>
                        ) : (
                          incidents.slice(0, 5).map((incident) => (
                            <div
                              key={incident._id}
                              className={`p-3 rounded-lg border ${
                                incident.severity === 'high' || incident.severity === 'critical'
                                  ? 'bg-red-500/10 border-red-500/30'
                                  : incident.severity === 'medium'
                                  ? 'bg-yellow-500/10 border-yellow-500/30'
                                  : 'bg-blue-500/10 border-blue-500/30'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-medium text-sm">
                                  {incident.type.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {new Date(incident.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center text-xs text-slate-400">
                                  <MapPin size={12} className="mr-1" />
                                  <span>{incident.location?.zone || 'Unknown'}</span>
                                </div>
                                <p className="text-xs text-slate-400">
                                  {incident.location?.building} - {incident.location?.floor}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  incident.severity === 'high' || incident.severity === 'critical'
                                    ? 'bg-red-500/20 text-red-400'
                                    : incident.severity === 'medium'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {incident.severity}
                                </span>
                                <button
                                  onClick={() => updateIncidentStatus(incident._id, 'resolved')}
                                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                                >
                                  <CheckCircle size={12} />
                                  <span>Resolve</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50">
                      <div className="p-4 border-b border-slate-700/50">
                        <h3 className="font-semibold">Activity Log</h3>
                      </div>
                      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                        {mockActivityLog.map((log) => (
                          <div key={log.id} className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 ${
                              log.severity === 'medium' ? 'bg-yellow-500' :
                              log.severity === 'info' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm">{log.event}</p>
                              <p className="text-xs text-slate-400">{log.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'incidents' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Incident History</h2>
                  <button
                    onClick={exportIncidents}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export Report</span>
                  </button>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left p-4 font-medium text-slate-400">Time</th>
                          <th className="text-left p-4 font-medium text-slate-400">Type</th>
                          <th className="text-left p-4 font-medium text-slate-400">Location</th>
                          <th className="text-left p-4 font-medium text-slate-400">Severity</th>
                          <th className="text-left p-4 font-medium text-slate-400">Status</th>
                          <th className="text-left p-4 font-medium text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incidents.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center p-8 text-slate-500">
                              No incidents recorded
                            </td>
                          </tr>
                        ) : (
                          incidents.map((incident) => (
                            <tr key={incident._id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                              <td className="p-4 text-sm">{new Date(incident.created_at).toLocaleString()}</td>
                              <td className="p-4 text-sm capitalize">{incident.type.replace('_', ' ')}</td>
                              <td className="p-4 text-sm">
                                <div>
                                  <p className="font-medium">{incident.location?.zone || 'N/A'}</p>
                                  <p className="text-xs text-slate-400">
                                    {incident.location?.building || ''} {incident.location?.floor ? `- ${incident.location.floor}` : ''}
                                  </p>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  incident.severity === 'high' || incident.severity === 'critical'
                                    ? 'bg-red-500/20 text-red-400'
                                    : incident.severity === 'medium'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-green-500/20 text-green-400'
                                }`}>
                                  {incident.severity}
                                </span>
                              </td>
                              <td className="p-4">
                                <select
                                  value={incident.status}
                                  onChange={(e) => updateIncidentStatus(incident._id, e.target.value)}
                                  className="bg-slate-700 text-white rounded px-2 py-1 text-xs"
                                >
                                  <option value="active">Active</option>
                                  <option value="acknowledged">Acknowledged</option>
                                  <option value="resolved">Resolved</option>
                                  <option value="false_alarm">False Alarm</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => updateIncidentStatus(incident._id, 'verified')}
                                  className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                  Verify
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'analytics' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-4">Incident Trends</h3>
                    <div className="h-64 flex items-center justify-center text-slate-500">
                      <TrendingUp size={48} />
                      <span className="ml-4">Chart visualization would go here</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-4">Detection Distribution</h3>
                    <div className="h-64 flex items-center justify-center text-slate-500">
                      <BarChart3 size={48} />
                      <span className="ml-4">Chart visualization would go here</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">System Statistics</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-400">{stats?.todayIncidents || 0}</p>
                        <p className="text-sm text-slate-400">Today's Incidents</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-400">{stats?.activeIncidents || 0}</p>
                        <p className="text-sm text-slate-400">Active Incidents</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-400">{stats?.activeCameras || 0}</p>
                        <p className="text-sm text-slate-400">Active Cameras</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-purple-400">{incidents.length}</p>
                        <p className="text-sm text-slate-400">Total Incidents</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;