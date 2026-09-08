const DEVICE_ID_KEY = 'pine_device_id';

export function getRegistrationDeviceIdentity() {
  if (typeof window === 'undefined') throw new Error('Device identity is unavailable.');

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
  ].join('|');

  return { deviceId, fingerprint };
}
