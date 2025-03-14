import React, { useEffect, useState } from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryWarning,
  Settings,
  Moon,
  Thermometer,
  Bell,
  LineChart
} from 'lucide-react';
import { BatteryGraph } from './components/BatteryGraph';
import { SettingsPanel } from './components/SettingsPanel';
import { NotificationBadge } from './components/NotificationBadge';

interface BatteryState {
  level: number;
  charging: boolean;
  timeRemaining: number | null;
  temperature: number | null;
  powerSaveMode: boolean;
  dischargingTime: number | null;
  chargingTime: number | null;
}

interface BatteryHistory {
  timestamp: number;
  level: number;
  isCharging: boolean;
}

function App() {
  const [batteryState, setBatteryState] = useState<BatteryState>({
    level: 0,
    charging: false,
    timeRemaining: null,
    temperature: null,
    powerSaveMode: false,
    dischargingTime: null,
    chargingTime: null,
  });
  const [supported, setSupported] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [batteryHistory, setBatteryHistory] = useState<BatteryHistory[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    if (!('getBattery' in navigator)) {
      setSupported(false);
      return;
    }

    const updateBatteryStatus = async () => {
      try {
        const battery = await navigator.getBattery();
        const newHistory: BatteryHistory = {
          timestamp: Date.now(),
          level: battery.level * 100,
          isCharging: battery.charging,
        };

        setBatteryHistory(prev => [...prev.slice(-50), newHistory]); // Keep last 50 readings
        setBatteryState(prev => ({
          ...prev,
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          dischargingTime: battery.dischargingTime,
          chargingTime: battery.chargingTime,
          powerSaveMode: navigator.userAgent.includes('Low Power Mode') || false,
          temperature: Math.random() * 20 + 20, // Simulated temperature between 20-40°C
        }));

        // Handle notifications
        if (notificationEnabled && battery.level <= 0.2 && !battery.charging) {
          showNotification('Low Battery', 'Your battery is below 20%. Please connect your charger.');
        }

        // Set up event listeners
        battery.addEventListener('chargingchange', () => updateBatteryStatus());
        battery.addEventListener('levelchange', () => updateBatteryStatus());
        battery.addEventListener('chargingtimechange', () => updateBatteryStatus());
        battery.addEventListener('dischargingtimechange', () => updateBatteryStatus());
      } catch (error) {
        console.error('Error accessing battery status:', error);
        setSupported(false);
      }
    };

    updateBatteryStatus();
    const interval = setInterval(updateBatteryStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [notificationEnabled]);

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationEnabled(permission === 'granted');
    }
  };

  const formatTime = (seconds: number | null): string => {
    if (!seconds || !isFinite(seconds)) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getBatteryColor = () => {
    if (batteryState.charging) return 'text-green-500';
    if (batteryState.level <= 20) return 'text-red-500';
    if (batteryState.level <= 40) return 'text-yellow-500';
    return 'text-blue-500';
  };

  if (!supported) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <BatteryWarning className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Supported</h2>
            <p className="text-gray-600">
              Battery Status API is not supported in this browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Battery Status</h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="relative">
                <div className="flex items-center justify-center mb-4">
                  {batteryState.charging ? (
                    <BatteryCharging className={`w-24 h-24 ${getBatteryColor()} animate-pulse`} />
                  ) : (
                    <Battery className={`w-24 h-24 ${getBatteryColor()}`} />
                  )}
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-gray-200">
                        Battery Level
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-gray-600">
                        {batteryState.level}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${batteryState.level}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${getBatteryColor()}`}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700">Power Save</span>
                    </div>
                    <span className={`text-sm ${batteryState.powerSaveMode ? 'text-purple-600' : 'text-gray-500'}`}>
                      {batteryState.powerSaveMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">Temperature</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {batteryState.temperature?.toFixed(1)}°C
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Status Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={batteryState.charging ? 'text-green-500' : 'text-gray-900'}>
                      {batteryState.charging ? 'Charging' : 'Discharging'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Remaining</span>
                    <span className="text-gray-900">
                      {batteryState.charging
                        ? formatTime(batteryState.chargingTime)
                        : formatTime(batteryState.dischargingTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Battery History</h3>
                <BatteryGraph data={batteryHistory} />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={requestNotificationPermission}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {notificationEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
                </button>
              </div>
            </div>
          </div>

          {showSettings && (
            <SettingsPanel onClose={() => setShowSettings(false)} />
          )}
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Created by PrasanthDPL</p>
          <p>Version 1.0.0 | Last Updated: {new Date().toLocaleDateString()}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;