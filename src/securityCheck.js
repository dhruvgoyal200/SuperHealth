import { NativeModules, Platform } from 'react-native';

const { SecurityCheck } = NativeModules;

export interface SecurityCheckResult {
  isInsecure: boolean;
  type: 'secure' | 'jailbroken' | 'rooted' | 'emulator';
}

export const performSecurityCheck = async (): Promise<SecurityCheckResult> => {
  try {
    if (!SecurityCheck) {
      console.warn('SecurityCheck module not available');
      return { isInsecure: false, type: 'secure' };
    }

    const result = await SecurityCheck.checkDeviceSecurity({});
    return result;
  } catch (error) {
    console.error('Security check failed:', error);
    return { isInsecure: false, type: 'secure' };
  }
};

export const getSecurityWarningMessage = (type: string): { title: string; message: string } => {
  switch (type) {
    case 'jailbroken':
      return {
        title: 'Device Compromised',
        message: 'This device appears to be jailbroken. For security reasons, sensitive data access is restricted. Please use an official, unmodified device.',
      };
    case 'rooted':
      return {
        title: 'Device Compromised',
        message: 'This device appears to be rooted. For security reasons, sensitive data access is restricted. Please use an official, unmodified device.',
      };
    case 'emulator':
      return {
        title: 'Emulator Detected',
        message: 'This app cannot run on emulators or simulators. Please use a physical device.',
      };
    default:
      return { title: '', message: '' };
  }
};
