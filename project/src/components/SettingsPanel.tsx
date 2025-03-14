import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
}

const STORAGE_KEY = 'userSettings';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    return savedSettings ? JSON.parse(savedSettings) : {
      lowBatteryThreshold: 20,
      notificationSound: true,
      darkMode: false,
      autoStartPowerSave: false,
      telegramChatId: '', // New field for Telegram notifications
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleChange = (key: keyof typeof settings, value: boolean | number | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <label className="block mb-4">
          <span className="text-gray-700">Low Battery Threshold (%)</span>
          <input type="number" value={settings.lowBatteryThreshold}
            onChange={e => handleChange('lowBatteryThreshold', Number(e.target.value))}
            className="w-full p-2 border rounded-md" />
        </label>
        <label className="flex items-center space-x-2 mb-4">
          <input type="checkbox" checked={settings.notificationSound}
            onChange={e => handleChange('notificationSound', e.target.checked)} />
          <span>Enable Notification Sound</span>
        </label>
        <label className="block mb-4">
          <span className="text-gray-700">Telegram Chat ID</span>
          <input type="text" value={settings.telegramChatId}
            onChange={e => handleChange('telegramChatId', e.target.value)}
            placeholder="Enter Telegram Chat ID"
            className="w-full p-2 border rounded-md" />
        </label>
      </div>
    </div>
  );
};