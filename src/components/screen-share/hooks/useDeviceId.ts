import { useEffect, useState } from "react";

export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('screen_share_device_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('screen_share_device_id', id);
    }
    setDeviceId(id);
  }, []);

  return deviceId;
};