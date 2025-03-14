import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

export interface BatteryMetric {
  deviceId: string;
  percentage: number;
  charging: boolean;
  temperature: number | null;
  predictedRemainingTime: number | null;
}

const STORAGE_KEY = 'batteryLogs';
const TELEGRAM_BOT_TOKEN = '8041827122:AAFrzGqUdCt-nrrm-N5a5WyMN1Nn_aAv8n0';

async function sendTelegramAlert(chatId: string, message: string) {
  try {
    if (!chatId) return;
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

export async function recordBatteryMetric(metric: BatteryMetric) {
  try {
    // Store locally
    const storedLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    storedLogs.push(metric);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedLogs));

    // Also send to Supabase
    const { error } = await supabase
      .from('battery_metrics')
      .insert([{
        id: uuidv4(),
        device_id: metric.deviceId,
        percentage: metric.percentage,
        charging: metric.charging,
        temperature: metric.temperature,
        predicted_remaining_time: metric.predictedRemainingTime,
      }]);

    if (error) throw error;

    // Check for low battery or charging stop alerts
    const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    if (metric.percentage <= userSettings.lowBatteryThreshold && !metric.charging) {
      await sendTelegramAlert(userSettings.telegramChatId, `⚠️ Battery low: ${metric.percentage}%`);
    }
    if (!metric.charging) {
      await sendTelegramAlert(userSettings.telegramChatId, `🔋 Charger disconnected! Battery at ${metric.percentage}%`);
    }
  } catch (error) {
    console.error('Error recording battery metric:', error);
    throw error;
  }
}
