import defaultLogo from '../assets/app-icon.jpg';

export interface AppBranding {
  appName: string;
  appSubtitle: string;
  appLogo: string; // base64 data URL or path to image
  accentColor: string; // e.g. 'indigo' | 'emerald' | 'violet' | 'cyan' | 'rose' | 'amber'
}

export const DEFAULT_BRANDING: AppBranding = {
  appName: 'LifeSync✦',
  appSubtitle: 'by Salih',
  appLogo: defaultLogo,
  accentColor: 'indigo',
};

