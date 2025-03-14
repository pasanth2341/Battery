/*
  # Battery Analytics Schema

  1. New Tables
    - `devices`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
      - `last_seen` (timestamp)
      - `user_id` (uuid, references auth.users)
    
    - `battery_metrics`
      - `id` (uuid, primary key)
      - `device_id` (uuid, references devices)
      - `timestamp` (timestamp)
      - `percentage` (integer)
      - `charging` (boolean)
      - `temperature` (decimal)
      - `predicted_remaining_time` (integer)
      
    - `battery_analytics`
      - `id` (uuid, primary key)
      - `device_id` (uuid, references devices)
      - `avg_discharge_rate` (decimal)
      - `avg_charge_time` (integer)
      - `usage_pattern` (jsonb)
      - `last_updated` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Create battery_metrics table
CREATE TABLE IF NOT EXISTS battery_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices NOT NULL,
  timestamp timestamptz DEFAULT now(),
  percentage integer NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  charging boolean DEFAULT false,
  temperature decimal,
  predicted_remaining_time integer,
  created_at timestamptz DEFAULT now()
);

-- Create battery_analytics table
CREATE TABLE IF NOT EXISTS battery_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices NOT NULL,
  avg_discharge_rate decimal,
  avg_charge_time integer,
  usage_pattern jsonb,
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own devices"
  ON devices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices"
  ON devices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their device metrics"
  ON battery_metrics
  FOR SELECT
  TO authenticated
  USING (
    device_id IN (
      SELECT id FROM devices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert device metrics"
  ON battery_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    device_id IN (
      SELECT id FROM devices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their analytics"
  ON battery_analytics
  FOR SELECT
  TO authenticated
  USING (
    device_id IN (
      SELECT id FROM devices WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_battery_metrics_device_timestamp 
  ON battery_metrics(device_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_battery_metrics_percentage 
  ON battery_metrics(percentage);

CREATE INDEX IF NOT EXISTS idx_devices_user_id 
  ON devices(user_id);