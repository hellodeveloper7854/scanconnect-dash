export type ScreenType = 'register' | 'login' | 'send-otp' | 'login-options' | 'verify-otp' | 'dashboard';

export interface UserFormData {
  fullName: string;
  mobileNumber: string;
  email: string;
  vehicleId?: string;
  accessKey?: string;
  rememberMe?: boolean;
}

export interface OtpState {
  mobileNumber: string;
  digits: string[];
  isSent: boolean;
  timer: number;
}
