import { useEffect, useState } from "react";

export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string>(() => {
    // Try to get existing device ID from localStorage
    const stored = localStorage.getItem('screen_share_device_id');
    if (stored) return stored;
    
    // Generate and store new device ID if none exists
    const newId = crypto.randomUUID();
    localStorage.setItem('screen_share_device_id', newId);
    return newId;
  });

  return deviceId;
};