// App.js - Complete AI Detection System with Additional Pages
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import io from 'socket.io-client';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard'); // Add page state
  
  // Navigation Component
  const NavigationBar = () => {
    if (!isLoggedIn) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '56px',
        left: '0',
        right: '0',
        background: '#1e293b',
        padding: '14px 30px',
        display: 'flex',
        gap: '20px',
        borderBottom: '1px solid rgba(74, 158, 255, 0.2)',
        zIndex: 998,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <button
          onClick={() => setCurrentPage('dashboard')}
          style={{
            background: currentPage === 'dashboard' ? '#4a9eff' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => currentPage !== 'dashboard' && (e.target.style.background = 'rgba(74, 158, 255, 0.1)')}
          onMouseLeave={(e) => currentPage !== 'dashboard' && (e.target.style.background = 'transparent')}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentPage('alerts-history')}
          style={{
            background: currentPage === 'alerts-history' ? '#4a9eff' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => currentPage !== 'alerts-history' && (e.target.style.background = 'rgba(74, 158, 255, 0.1)')}
          onMouseLeave={(e) => currentPage !== 'alerts-history' && (e.target.style.background = 'transparent')}
        >
          Alert History
        </button>
        <button
          onClick={() => setCurrentPage('settings')}
          style={{
            background: currentPage === 'settings' ? '#4a9eff' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => currentPage !== 'settings' && (e.target.style.background = 'rgba(74, 158, 255, 0.1)')}
          onMouseLeave={(e) => currentPage !== 'settings' && (e.target.style.background = 'transparent')}
        >
          Settings
        </button>
      </div>
    );
  };
  
  // Settings Page Component
  const SettingsPage = () => {
    const [settings, setSettings] = useState({
      detectionSensitivity: 'medium',
      confidenceThreshold: 85,
      videoAnalysisFrequency: '1',
      realTimeAnalysis: true,
      autoDispatch: true,
      criticalAlerts: true,
      highPriorityAlerts: true,
      mediumPriorityAlerts: false,
      lowPriorityAlerts: false,
      alertSound: 'standard',
      dataRetention: '30',
      backupFrequency: 'weekly',
      autoUpdate: true,
      performanceMonitoring: true,
      debugMode: false,
      twoFactorAuth: true,
      sessionTimeout: true,
      sessionDuration: '30',
      auditLogging: true
    });
    
    const ToggleSwitch = ({ value, onChange }) => (
      <div
        onClick={onChange}
        style={{
          width: '50px',
          height: '26px',
          background: value ? '#4a9eff' : '#475569',
          borderRadius: '13px',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.3s'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '3px',
          left: value ? '27px' : '3px',
          width: '20px',
          height: '20px',
          background: 'white',
          borderRadius: '50%',
          transition: 'left 0.3s'
        }} />
      </div>
    );
    
    return (
      <div style={{ 
        padding: '110px 20px 20px 20px',
        background: '#0f172a',
        minHeight: '100vh',
        color: 'white'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '10px',
          color: '#4a9eff' 
        }}>
          Settings & Configuration
        </h2>
        <p style={{ 
          textAlign: 'center', 
          color: '#94a3b8',
          marginBottom: '30px' 
        }}>
          Configure AI monitoring parameters and system preferences
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* AI Detection Settings */}
          <div style={{
            background: '#1e293b',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid rgba(74, 158, 255, 0.2)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#4a9eff' }}>
              AI Detection Settings
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#94a3b8' }}>
                Detection Sensitivity
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {['Low', 'Medium', 'High'].map(level => (
                  <button
                    key={level}
                    onClick={() => setSettings({...settings, detectionSensitivity: level.toLowerCase()})}
                    style={{
                      flex: 1,
                      padding: '8px',
                      margin: '0 5px',
                      background: settings.detectionSensitivity === level.toLowerCase() ? '#4a9eff' : '#334155',
                      border: 'none',
                      borderRadius: '5px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#94a3b8' }}>
                Confidence Threshold
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>50%</span>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={settings.confidenceThreshold}
                  onChange={(e) => setSettings({...settings, confidenceThreshold: e.target.value})}
                  style={{ flex: 1 }}
                />
                <span>99%</span>
                <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{settings.confidenceThreshold}%</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#94a3b8' }}>
                Video Analysis Frequency
              </label>
              <select
                value={settings.videoAnalysisFrequency}
                onChange={(e) => setSettings({...settings, videoAnalysisFrequency: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#334155',
                  border: '1px solid rgba(74, 158, 255, 0.3)',
                  borderRadius: '5px',
                  color: 'white'
                }}
              >
                <option value="1">Every 1 second</option>
                <option value="2">Every 2 seconds</option>
                <option value="5">Every 5 seconds</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ color: '#94a3b8' }}>Enable Real-time Analysis</span>
              <ToggleSwitch 
                value={settings.realTimeAnalysis}
                onChange={() => setSettings({...settings, realTimeAnalysis: !settings.realTimeAnalysis})}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8' }}>Auto-dispatch Response Teams</span>
              <ToggleSwitch 
                value={settings.autoDispatch}
                onChange={() => setSettings({...settings, autoDispatch: !settings.autoDispatch})}
              />
            </div>
          </div>
          
          {/* Alert Configuration */}
          <div style={{
            background: '#1e293b',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid rgba(74, 158, 255, 0.2)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#4a9eff' }}>
              Alert Configuration
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ color: '#94a3b8' }}>Critical Alerts</span>
              <ToggleSwitch 
                value={settings.criticalAlerts}
                onChange={() => setSettings({...settings, criticalAlerts: !settings.criticalAlerts})}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ color: '#94a3b8' }}>High Priority Alerts</span>
              <ToggleSwitch 
                value={settings.highPriorityAlerts}
                onChange={() => setSettings({...settings, highPriorityAlerts: !settings.highPriorityAlerts})}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ color: '#94a3b8' }}>Medium Priority Alerts</span>
              <ToggleSwitch 
                value={settings.mediumPriorityAlerts}
                onChange={() => setSettings({...settings, mediumPriorityAlerts: !settings.mediumPriorityAlerts})}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#94a3b8' }}>Low Priority Alerts</span>
              <ToggleSwitch 
                value={settings.lowPriorityAlerts}
                onChange={() => setSettings({...settings, lowPriorityAlerts: !settings.lowPriorityAlerts})}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#94a3b8' }}>
                Alert Sound
              </label>
              <select
                value={settings.alertSound}
                onChange={(e) => setSettings({...settings, alertSound: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#334155',
                  border: '1px solid rgba(74, 158, 255, 0.3)',
                  borderRadius: '5px',
                  color: 'white'
                }}
              >
                <option value="standard">Standard Alert</option>
                <option value="critical">Critical Alert</option>
                <option value="subtle">Subtle Alert</option>
                <option value="none">No Sound</option>
              </select>
            </div>
          </div>
          
          {/* Zone Configuration */}
          <div style={{
            background: '#1e293b',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid rgba(74, 158, 255, 0.2)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#4a9eff' }}>
              Zone Configuration
            </h3>
            
            <div style={{
              padding: '15px',
              background: '#334155',
              borderRadius: '5px',
              marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>East Zone</h4>
                <span style={{
                  padding: '4px 12px',
                  background: '#ef4444',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Critical
                </span>
              </div>
              <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
                High traffic area, requires constant monitoring
              </p>
            </div>
            
            <div style={{
              padding: '15px',
              background: '#334155',
              borderRadius: '5px',
              marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>North Zone</h4>
                <span style={{
                  padding: '4px 12px',
                  background: '#f59e0b',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Warning
                </span>
              </div>
              <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
                Medium traffic, periodic monitoring
              </p>
            </div>
            
            <div style={{
              padding: '15px',
              background: '#334155',
              borderRadius: '5px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>West Zone</h4>
                <span style={{
                  padding: '4px 12px',
                  background: '#10b981',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Normal
                </span>
              </div>
              <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
                Low traffic area, standard monitoring
              </p>
            </div>
          </div>
          
          {/* Security Settings */}
          <div style={{
            background: '#1e293b',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid rgba(74, 158, 255, 0.2)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#4a9eff' }}>
              Security Settings
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ color: '#94a3b8' }}>Two-Factor Authentication</span>
              <ToggleSwitch 
                value={settings.twoFactorAuth}
                onChange={() => setSettings({...settings, twoFactorAuth: !settings.twoFactorAuth})}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#94a3b8' }}>Session Timeout</span>
              <ToggleSwitch 
                value={settings.sessionTimeout}
                onChange={() => setSettings({...settings, sessionTimeout: !settings.sessionTimeout})}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#94a3b8' }}>
                Session Duration
              </label>
              <select
                value={settings.sessionDuration}
                onChange={(e) => setSettings({...settings, sessionDuration: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#334155',
                  border: '1px solid rgba(74, 158, 255, 0.3)',
                  borderRadius: '5px',
                  color: 'white'
                }}
              >
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#94a3b8' }}>Audit Logging</span>
              <ToggleSwitch 
                value={settings.auditLogging}
                onChange={() => setSettings({...settings, auditLogging: !settings.auditLogging})}
              />
            </div>
            
            <button style={{
              width: '100%',
              padding: '10px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}>
              🔒 Security Audit
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Alert History Page with Location
  const AlertHistoryPage = () => {
    const [alertHistory] = useState([
      {
        id: 1,
        type: 'Fire',
        message: 'Fire detected in East Zone',
        severity: 'critical',
        time: '2024-03-15 10:30 AM',
        location: { 
          zone: 'East Zone', 
          coordinates: 'Area A, Section 3',
          lat: 17.4399,
          lng: 78.4983
        },
        status: 'resolved',
        resolvedBy: 'Team Alpha',
        responseTime: '2 minutes'
      },
      {
        id: 2,
        type: 'Crowd',
        message: '5 people detected in North Zone',
        severity: 'high',
        time: '2024-03-15 10:25 AM',
        location: { 
          zone: 'North Zone', 
          coordinates: 'Area B, Section 1',
          lat: 17.4489,
          lng: 78.4903
        },
        status: 'resolved',
        resolvedBy: 'Auto-resolved',
        responseTime: '5 minutes'
      },
      {
        id: 3,
        type: 'Smoke',
        message: 'Smoke detected in West Zone',
        severity: 'high',
        time: '2024-03-15 09:45 AM',
        location: { 
          zone: 'West Zone', 
          coordinates: 'Area C, Section 2',
          lat: 17.4329,
          lng: 78.4803
        },
        status: 'resolved',
        resolvedBy: 'Team Beta',
        responseTime: '3 minutes'
      },
      {
        id: 4,
        type: 'Crowd',
        message: '4 people detected in East Zone',
        severity: 'medium',
        time: '2024-03-15 09:15 AM',
        location: { 
          zone: 'East Zone', 
          coordinates: 'Area A, Section 1',
          lat: 17.4419,
          lng: 78.5013
        },
        status: 'resolved',
        resolvedBy: 'Auto-resolved',
        responseTime: '8 minutes'
      }
    ]);
    
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [filterType, setFilterType] = useState('all');
    
    const filteredAlerts = alertHistory.filter(alert => 
      filterType === 'all' || alert.type.toLowerCase() === filterType
    );
    
    return (
      <div style={{ 
        padding: '110px 20px 20px 20px',
        background: '#0f172a',
        minHeight: '100vh',
        color: 'white'
      }}>
        <h2 style={{ marginBottom: '30px', color: '#4a9eff' }}>
          Alert History & Location Tracking
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          {/* Alert List */}
          <div>
            <div style={{
              background: '#1e293b',
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid rgba(74, 158, 255, 0.2)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px' 
              }}>
                <h3 style={{ margin: 0 }}>Previous Alerts</h3>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    padding: '5px 10px',
                    background: '#334155',
                    border: '1px solid rgba(74, 158, 255, 0.3)',
                    borderRadius: '5px',
                    color: 'white'
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="fire">Fire</option>
                  <option value="crowd">Crowd</option>
                  <option value="smoke">Smoke</option>
                </select>
              </div>
              
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {filteredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    style={{
                      background: selectedAlert?.id === alert.id ? '#334155' : '#0f172a',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      borderLeft: `4px solid ${
                        alert.severity === 'critical' ? '#ef4444' : 
                        alert.severity === 'high' ? '#f59e0b' : '#10b981'
                      }`,
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>{alert.type} Alert</span>
                      <span style={{
                        padding: '2px 8px',
                        background: '#10b981',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {alert.status}
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#94a3b8' }}>
                      {alert.message}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      <span>{alert.location.zone}</span>
                      <span>{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Location Map and Details */}
          <div>
            {/* Simple Location Map */}
            <div style={{
              background: '#1e293b',
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid rgba(74, 158, 255, 0.2)',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '15px' }}>Location Map</h3>
              <div style={{
                background: '#0f172a',
                height: '300px',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Zone Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'repeat(3, 1fr)',
                  height: '100%',
                  gap: '2px',
                  padding: '20px'
                }}>
                  <div style={{
                    gridColumn: '1 / 2',
                    gridRow: '1 / 3',
                    background: selectedAlert?.location.zone === 'West Zone' ? 'rgba(74, 158, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(74, 158, 255, 0.2)',
                    cursor: 'pointer'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px' }}>🏭</div>
                      <div style={{ marginTop: '5px', fontSize: '14px' }}>West Zone</div>
                    </div>
                  </div>
                  
                  <div style={{
                    gridColumn: '2 / 4',
                    gridRow: '1 / 2',
                    background: selectedAlert?.location.zone === 'North Zone' ? 'rgba(74, 158, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(74, 158, 255, 0.2)',
                    cursor: 'pointer'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px' }}>🏢</div>
                      <div style={{ marginTop: '5px', fontSize: '14px' }}>North Zone</div>
                    </div>
                  </div>
                  
                  <div style={{
                    gridColumn: '2 / 4',
                    gridRow: '2 / 4',
                    background: selectedAlert?.location.zone === 'East Zone' ? 'rgba(74, 158, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(74, 158, 255, 0.2)',
                    cursor: 'pointer'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px' }}>🏗️</div>
                      <div style={{ marginTop: '5px', fontSize: '14px' }}>East Zone</div>
                    </div>
                  </div>
                  
                  <div style={{
                    gridColumn: '1 / 2',
                    gridRow: '3 / 4',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(74, 158, 255, 0.2)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px' }}>🎯</div>
                      <div style={{ marginTop: '5px', fontSize: '14px' }}>Main Stage</div>
                    </div>
                  </div>
                </div>
                
                {selectedAlert && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px'
                  }}>
                    📍 {selectedAlert.location.coordinates}
                    <br />
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                      Lat: {selectedAlert.location.lat}, Lng: {selectedAlert.location.lng}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Alert Details */}
            {selectedAlert && (
              <div style={{
                background: '#1e293b',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid rgba(74, 158, 255, 0.2)'
              }}>
                <h3 style={{ marginBottom: '15px' }}>Alert Details</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <p style={{ color: '#94a3b8', margin: '5px 0' }}>Type</p>
                    <p style={{ fontWeight: 'bold' }}>{selectedAlert.type}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', margin: '5px 0' }}>Severity</p>
                    <p style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                      {selectedAlert.severity}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', margin: '5px 0' }}>Location</p>
                    <p style={{ fontWeight: 'bold' }}>{selectedAlert.location.zone}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', margin: '5px 0' }}>Coordinates</p>
                    <p style={{ fontWeight: 'bold' }}>{selectedAlert.location.coordinates}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', margin: '5px 0' }}>GPS Coordinates</p>
                    <p style={{ fontWeight: 'bold', fontSize: '13px' }}>
                      {selectedAlert.location.lat}°N, {selectedAlert.location.lng}°E
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', margin: '5px 0' }}>Time</p>
                    <p style={{ fontWeight: 'bold' }}>{selectedAlert.time}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', margin: '5px 0' }}>Response Time</p>
                    <p style={{ fontWeight: 'bold' }}>{selectedAlert.responseTime}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', margin: '5px 0' }}>Resolved By</p>
                    <p style={{ fontWeight: 'bold' }}>{selectedAlert.resolvedBy}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', margin: '5px 0' }}>Status</p>
                    <p style={{ fontWeight: 'bold', color: '#10b981' }}>
                      {selectedAlert.status}
                    </p>
                  </div>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <p style={{ color: '#94a3b8', margin: '5px 0' }}>Description</p>
                  <p>{selectedAlert.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Enhanced Login Component
  const LoginComponent = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Mock credentials - In production, this would be handled by backend
    const VALID_CREDENTIALS = {
      username: 'admin',
      password: 'admin123'
    };
    
    const handleLogin = (e) => {
      e.preventDefault();
      
      // Reset error
      setError('');
      
      // Validation
      if (!username.trim()) {
        setError('Please enter username');
        return;
      }
      
      if (!password.trim()) {
        setError('Please enter password');
        return;
      }
      
      // Show loading
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
          setIsLoggedIn(true);
        } else {
          setError('Invalid username or password');
          setIsLoading(false);
        }
      }, 1500);
    };
    
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at 20% 50%, rgba(74, 158, 255, 0.1) 0%, transparent 50%)',
          animation: 'float 20s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at 80% 50%, rgba(74, 158, 255, 0.05) 0%, transparent 50%)',
          animation: 'float 25s ease-in-out infinite reverse'
        }} />
        
        <form onSubmit={handleLogin} style={{
          background: 'rgba(30, 41, 59, 0.8)',
          padding: '50px',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(74, 158, 255, 0.2)',
          width: '400px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Logo/Icon */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #4a9eff 0%, #3a7eef 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '36px',
              boxShadow: '0 10px 25px -5px rgba(74, 158, 255, 0.3)'
            }}>
              🎥
            </div>
            <h1 style={{ 
              color: '#ffffff', 
              marginBottom: '5px',
              fontSize: '28px',
              fontWeight: '700'
            }}>
              AI Monitoring System
            </h1>
            <p style={{ 
              color: '#94a3b8', 
              margin: 0,
              fontSize: '14px'
            }}>
              Secure Access Portal
            </p>
          </div>
          
          {/* Username Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                style={{
                  width: '100%',
                  padding: '12px 15px 12px 45px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(74, 158, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #4a9eff';
                  e.target.style.background = 'rgba(15, 23, 42, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(74, 158, 255, 0.2)';
                  e.target.style.background = 'rgba(15, 23, 42, 0.6)';
                }}
              />
              <span style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '18px'
              }}>
                👤
              </span>
            </div>
          </div>
          
          {/* Password Field */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 45px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(74, 158, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #4a9eff';
                  e.target.style.background = 'rgba(15, 23, 42, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(74, 158, 255, 0.2)';
                  e.target.style.background = 'rgba(15, 23, 42, 0.6)';
                }}
              />
              <span style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '18px'
              }}>
                🔒
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          {/* Remember Me & Forgot Password */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              color: '#94a3b8',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                style={{
                  marginRight: '8px',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              Remember me
            </label>
            <a href="#" style={{
              color: '#4a9eff',
              fontSize: '14px',
              textDecoration: 'none'
            }}>
              Forgot password?
            </a>
          </div>
          
          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span style={{ color: '#ef4444', fontSize: '14px' }}>{error}</span>
            </div>
          )}
          
          {/* Login Button */}
          <button 
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading 
                ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' 
                : 'linear-gradient(135deg, #4a9eff 0%, #3a7eef 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: isLoading ? 'none' : '0 10px 25px -5px rgba(74, 158, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 30px -5px rgba(74, 158, 255, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 25px -5px rgba(74, 158, 255, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <>
                <span style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login to Dashboard</span>
                <span style={{ fontSize: '18px' }}>→</span>
              </>
            )}
          </button>
          
          {/* Demo Credentials */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(74, 158, 255, 0.05)',
            border: '1px solid rgba(74, 158, 255, 0.2)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ 
              margin: '0 0 5px 0', 
              color: '#94a3b8', 
              fontSize: '12px' 
            }}>
              Demo Credentials
            </p>
            <p style={{ 
              margin: 0, 
              color: '#4a9eff', 
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              Username: admin | Password: admin123
            </p>
          </div>
        </form>
        
        {/* Loading Animation */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  };
  
  const ChatbotComponent = ({ alerts, personCount, fireDetected, smokeDetected }) => {
    const [messages, setMessages] = useState([
      { id: 1, text: "Hello! I'm your AI assistant. How can I help you with the monitoring system?", sender: 'bot' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const messagesEndRef = useRef(null);
    const lastAlertRef = useRef(null);
    
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    useEffect(() => {
      scrollToBottom();
    }, [messages]);
    
    // Announce alerts in chat
    useEffect(() => {
      if (alerts && alerts.length > 0 && alerts[0] !== lastAlertRef.current) {
        lastAlertRef.current = alerts[0];
        const alertMessage = {
          id: Date.now(),
          text: `🚨 ALERT: ${alerts[0].message}`,
          sender: 'bot'
        };
        setMessages(prev => [...prev, alertMessage]);
      }
    }, [alerts]);
    
    const handleSendMessage = (e) => {
      e.preventDefault();
      if (!inputMessage.trim()) return;
      
      // Add user message
      const userMessage = {
        id: Date.now(),
        text: inputMessage,
        sender: 'user'
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsTyping(true);
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = getBotResponse(inputMessage);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot'
        }]);
        setIsTyping(false);
      }, 1500);
    };
    
    const getBotResponse = (message) => {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('how many people') || lowerMessage.includes('person count') || lowerMessage.includes('people detected')) {
        return `Currently, there are ${personCount} people detected in the monitoring area.`;
      } else if (lowerMessage.includes('alert') || lowerMessage.includes('notification')) {
        return `The system has generated ${alerts.length} alerts so far. ${alerts.length > 0 ? 'The most recent was: ' + alerts[0].message : 'No alerts yet.'}`;
      } else if (lowerMessage.includes('crowd') || lowerMessage.includes('threshold')) {
        return "The crowd threshold is set to 3 people. When 3 or more people are detected, the system will generate an alert.";
      } else if (lowerMessage.includes('fire')) {
        return fireDetected ? "🔥 FIRE HAS BEEN DETECTED! Please check the monitoring area immediately!" : "No fire detected at this time. The system is actively monitoring.";
      } else if (lowerMessage.includes('smoke')) {
        return smokeDetected ? "💨 SMOKE HAS BEEN DETECTED! Please investigate the area!" : "No smoke detected. The system continuously monitors for smoke hazards.";
      } else if (lowerMessage.includes('status') || lowerMessage.includes('summary')) {
        return `System Status: ${personCount} people detected. Fire: ${fireDetected ? 'DETECTED' : 'Clear'}. Smoke: ${smokeDetected ? 'DETECTED' : 'Clear'}. Total alerts: ${alerts.length}.`;
      } else if (lowerMessage.includes('help')) {
        return "I can help you with: person count, alerts, fire/smoke detection status, crowd threshold info, and system summary. Just ask!";
      } else {
        return "I can help you with questions about current detections, alerts, crowd monitoring, fire/smoke detection, and system status. What would you like to know?";
      }
    };
    
    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#4a9eff',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000
          }}
        >
          💬
        </button>
      );
    }
    
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '350px',
        height: '450px',
        background: '#1e293b',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(74, 158, 255, 0.2)',
        zIndex: 1000
      }}>
        <div style={{
          padding: '15px',
          background: '#334155',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          borderBottom: '1px solid rgba(74, 158, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#4a9eff', fontSize: '18px' }}>
            AI Assistant 🤖
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {messages.map(message => (
            <div
              key={message.id}
              style={{
                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '10px 15px',
                borderRadius: '15px',
                background: message.sender === 'user' ? '#4a9eff' : message.text.includes('🚨') ? '#ef4444' : '#475569',
                color: 'white',
                fontSize: '14px',
                wordWrap: 'break-word'
              }}
            >
              {message.text}
            </div>
          ))}
          {isTyping && (
            <div style={{
              alignSelf: 'flex-start',
              padding: '10px 15px',
              borderRadius: '15px',
              background: '#475569',
              color: '#94a3b8',
              fontSize: '14px'
            }}>
              Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} style={{
          padding: '15px',
          borderTop: '1px solid rgba(74, 158, 255, 0.2)',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything..."
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(74, 158, 255, 0.3)',
              borderRadius: '5px',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              background: '#4a9eff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Send
          </button>
        </form>
      </div>
    );
  };
  
  const DashboardComponent = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const socketRef = useRef(null);
    const modelRef = useRef(null);
    const detectionIntervalRef = useRef(null);
    
    const [isConnected, setIsConnected] = useState(false);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [isWebcamReady, setIsWebcamReady] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isLoadingModel, setIsLoadingModel] = useState(true);
    const [personCount, setPersonCount] = useState(0);
    const [alerts, setAlerts] = useState([]);
    const [lastAlertTime, setLastAlertTime] = useState({});
    const [fireDetected, setFireDetected] = useState(false);
    const [smokeDetected, setSmokeDetected] = useState(false);
    
    const CROWD_THRESHOLD = 3;
    const ALERT_COOLDOWN = 7000;
    const DETECTION_INTERVAL = 1000; // Run detection every 1 second
    
    // Load AI model
    useEffect(() => {
      const loadModel = async () => {
        try {
          setIsLoadingModel(true);
          console.log('🤖 Loading COCO-SSD model...');
          modelRef.current = await cocoSsd.load();
          setIsModelLoaded(true);
          setIsLoadingModel(false);
          console.log('✅ AI model loaded successfully!');
        } catch (error) {
          console.error('❌ Error loading model:', error);
          setIsLoadingModel(false);
        }
      };
      loadModel();
    }, []);
    
    // Socket connection
    useEffect(() => {
      socketRef.current = io('http://localhost:3001');
      
      socketRef.current.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Connected to server');
      });
      
      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        setIsMonitoring(false);
      });
      
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }, []);
    
    // Fire and smoke detection (simulated based on color analysis)
    const detectFireAndSmoke = useCallback((video) => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let firePixels = 0;
      let smokePixels = 0;
      const totalPixels = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Fire detection (orange/red colors)
        if (r > 200 && g > 50 && g < 150 && b < 100) {
          firePixels++;
        }
        
        // Smoke detection (gray colors)
        if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r > 100 && r < 200) {
          smokePixels++;
        }
      }
      
      const firePercentage = (firePixels / totalPixels) * 100;
      const smokePercentage = (smokePixels / totalPixels) * 100;
      
      return {
        fire: firePercentage > 0.5, // 0.5% of image has fire-like colors
        smoke: smokePercentage > 2   // 2% of image has smoke-like colors
      };
    }, []);
    
    // Create alert
    const createAlert = useCallback((type, message, severity = 'high') => {
      const now = Date.now();
      const alertKey = `${type}_alert`;
      
      // Check cooldown
      if (lastAlertTime[alertKey] && (now - lastAlertTime[alertKey]) < ALERT_COOLDOWN) {
        return;
      }
      
      const alert = {
        id: now,
        type,
        message,
        severity,
        time: new Date().toLocaleTimeString()
      };
      
      setAlerts(prev => [alert, ...prev].slice(0, 10));
      setLastAlertTime(prev => ({ ...prev, [alertKey]: now }));
      
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(`${type} Alert!`, {
          body: message,
          icon: severity === 'critical' ? '🔥' : '🚨'
        });
      }
      
      // Send to server
      socketRef.current.emit('alert-generated', alert);
      
      console.log(`🚨 ${type}: ${message}`);
    }, [lastAlertTime]);
    
    // Detect people and hazards
    const performDetection = useCallback(async () => {
      if (!webcamRef.current || !modelRef.current || !isMonitoring) return;
      
      try {
        const video = webcamRef.current.video;
        if (video.readyState === 4) {
          // Person detection
          const predictions = await modelRef.current.detect(video);
          const people = predictions.filter(p => 
            p.class === 'person' && p.score > 0.5
          );
          const count = people.length;
          
          setPersonCount(count);
          
          // Fire and smoke detection
          const { fire, smoke } = detectFireAndSmoke(video);
          setFireDetected(fire);
          setSmokeDetected(smoke);
          
          // Draw detections on canvas
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // Set canvas size to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw person bounding boxes
          people.forEach(person => {
            const [x, y, width, height] = person.bbox;
            
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(
              `Person ${Math.round(person.score * 100)}%`, 
              x, 
              y > 20 ? y - 5 : y + height + 20
            );
          });
          
          // Draw fire/smoke warnings
          if (fire) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, 50);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('🔥 FIRE DETECTED!', 10, 35);
          }
          
          if (smoke) {
            ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
            ctx.fillRect(0, fire ? 50 : 0, canvas.width, 50);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('💨 SMOKE DETECTED!', 10, fire ? 85 : 35);
          }
          
          // Generate alerts
          if (count >= CROWD_THRESHOLD) {
            createAlert('Crowd', `${count} people detected in monitoring area!`, 'high');
          }
          
          if (fire) {
            createAlert('Fire', 'Fire detected in monitoring area!', 'critical');
          }
          
          if (smoke) {
            createAlert('Smoke', 'Smoke detected in monitoring area!', 'high');
          }
          
          // Send detection data to server
          socketRef.current.emit('detection-update', {
            person_count: count,
            fire_detected: fire,
            smoke_detected: smoke,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
    }, [isMonitoring, detectFireAndSmoke, createAlert]);
    
    // Run detection loop
    useEffect(() => {
      if (isMonitoring && isModelLoaded) {
        detectionIntervalRef.current = setInterval(performDetection, DETECTION_INTERVAL);
      } else {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      }
      
      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      };
    }, [isMonitoring, isModelLoaded, performDetection]);
    
    // Start/stop monitoring
    const toggleMonitoring = () => {
      if (!isWebcamReady || !isModelLoaded) {
        alert('Please wait for webcam and AI model to initialize');
        return;
      }
      
      if (!isMonitoring) {
        // Request notification permission
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
        
        setIsMonitoring(true);
        console.log('▶️ Monitoring started');
      } else {
        setIsMonitoring(false);
        setPersonCount(0);
        setFireDetected(false);
        setSmokeDetected(false);
        
        // Clear canvas
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        console.log('⏹️ Monitoring stopped');
      }
    };
    
    // Render different pages based on currentPage state
    if (currentPage === 'settings') {
      return <SettingsPage />;
    }
    
    if (currentPage === 'alerts-history') {
      return <AlertHistoryPage />;
    }
    
    // Default dashboard view
    return (
      <>
        <style>{`
          .header {
            position: fixed !important;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            height: 60px;
            background: #1e293b;
          }
          .app {
            position: relative;
          }
        `}</style>
        <div className="app" style={{ paddingTop: '95px' }}>
        <header className="header">
          <h1>AI Event Monitoring System</h1>
          <div className="header-right">
            <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '● Connected' : '● Disconnected'}
            </span>
            <span className={`status ${isModelLoaded ? 'ai-ready' : 'ai-loading'}`}>
              {isLoadingModel ? '🤖 Loading AI...' : isModelLoaded ? '🤖 AI Ready' : '🤖 AI Failed'}
            </span>
            <button onClick={() => setIsLoggedIn(false)} className="logout-btn">
              Logout
            </button>
          </div>
        </header>
        
        <div className="main-content">
          <div className="video-section">
            <div className="card">
              <div className="card-header">
                <h2>Live Camera Feed</h2>
                <button 
                  onClick={toggleMonitoring} 
                  disabled={!isModelLoaded || !isWebcamReady}
                  className={`btn ${isMonitoring ? 'btn-stop' : 'btn-start'}`}
                >
                  {isMonitoring ? '⏹ Stop Monitoring' : '▶ Start Monitoring'}
                </button>
              </div>
              
              <div className="video-container">
                <Webcam
                  ref={webcamRef}
                  className="webcam"
                  videoConstraints={{
                    facingMode: "user"
                  }}
                  onUserMedia={() => {
                    console.log('✅ Webcam ready!');
                    setIsWebcamReady(true);
                  }}
                  onUserMediaError={(error) => {
                    console.error('❌ Webcam error:', error);
                    alert('Please allow camera access');
                  }}
                />
                
                <canvas
                  ref={canvasRef}
                  className="detection-canvas"
                />
                
                <div className={`person-count ${personCount >= CROWD_THRESHOLD ? 'alert' : 'normal'}`}>
                  {personCount} People
                </div>
                
                {isMonitoring && (
                  <div className="monitoring-indicator">
                    <span className="blink"></span>
                    AI MONITORING
                  </div>
                )}
                
                {fireDetected && (
                  <div className="hazard-warning fire">
                    🔥 FIRE DETECTED!
                  </div>
                )}
                
                {smokeDetected && (
                  <div className="hazard-warning smoke">
                    💨 SMOKE DETECTED!
                  </div>
                )}
              </div>
              
              <div className="info-bar">
                <div>
                  <strong>AI Model:</strong> {isModelLoaded ? 'COCO-SSD' : 'Loading...'}
                </div>
                <div>
                  <strong>Crowd Threshold:</strong> {CROWD_THRESHOLD}+ people
                </div>
                <div>
                  <strong>Status:</strong> {isMonitoring ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="sidebar">
            <div className="card">
              <h3>🚨 Alerts</h3>
              <div className="alerts-list">
                {alerts.length === 0 ? (
                  <div className="no-alerts">
                    <p>No alerts yet</p>
                    <p className="sub-text">
                      System will alert when {CROWD_THRESHOLD}+ people, fire, or smoke are detected
                    </p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} className={`alert-item ${alert.severity}`}>
                      <div className="alert-header">
                        <span className="alert-type">{alert.type}</span>
                        <span className="alert-time">{alert.time}</span>
                      </div>
                      <div className="alert-message">{alert.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="card stats-card">
              <h3>System Stats</h3>
              <div className="stats">
                <div className="stat-row">
                  <span>Current Count:</span>
                  <strong className={personCount >= CROWD_THRESHOLD ? 'danger' : 'safe'}>
                    {personCount} people
                  </strong>
                </div>
                <div className="stat-row">
                  <span>Total Alerts:</span>
                  <strong>{alerts.length}</strong>
                </div>
                <div className="stat-row">
                  <span>Fire Status:</span>
                  <strong className={fireDetected ? 'danger' : 'safe'}>
                    {fireDetected ? '🔥 Detected' : '✓ Clear'}
                  </strong>
                </div>
                <div className="stat-row">
                  <span>Smoke Status:</span>
                  <strong className={smokeDetected ? 'danger' : 'safe'}>
                    {smokeDetected ? '💨 Detected' : '✓ Clear'}
                  </strong>
                </div>
                <div className="stat-row">
                  <span>Alert Cooldown:</span>
                  <strong>{ALERT_COOLDOWN / 1000}s</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chatbot Component */}
        <ChatbotComponent 
          alerts={alerts}
          personCount={personCount}
          fireDetected={fireDetected}
          smokeDetected={smokeDetected}
        />
      </div>
      </>
    );
  };
  
  return (
    <>
      <style>{`
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
      <NavigationBar />
      {isLoggedIn ? <DashboardComponent /> : <LoginComponent />}
    </>
  );
}

export default App;