import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  message: string;
  type?: 'info' | 'warning' | 'error';
}

const STORAGE_KEY = 'notificationsEnabled';

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ message, type = 'info' }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const savedSetting = localStorage.getItem(STORAGE_KEY);
    return savedSetting ? JSON.parse(savedSetting) : false;
  });

  useEffect(() => {
    if (notificationsEnabled && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(true));
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(false));
          setNotificationsEnabled(false);
        }
      });
    }
  }, [notificationsEnabled]);

  const showNotification = () => {
    if (notificationsEnabled && Notification.permission === 'granted') {
      new Notification('Battery Alert', {
        body: message,
        icon: '/icons/battery.png'
      });
    }
  };

  useEffect(() => {
    showNotification();
  }, [message]);

  const toggleNotifications = () => {
    const newSetting = !notificationsEnabled;
    setNotificationsEnabled(newSetting);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSetting));
  };

  const getBgColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getBgColor()}`}>
      <Bell className="w-4 h-4 cursor-pointer" onClick={toggleNotifications} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};