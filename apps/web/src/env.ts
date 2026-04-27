const getVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key] as string | undefined;
  if (!value && !fallback) {
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }
  return value ?? fallback ?? '';
};

export const env = {
  VITE_API_URL: getVar('VITE_API_URL', 'http://localhost:3001'),
  VITE_CLERK_PUBLISHABLE_KEY: getVar('VITE_CLERK_PUBLISHABLE_KEY', ''),
  VITE_APP_URL: getVar('VITE_APP_URL', 'http://localhost:5173'),
  VITE_ENABLE_AI: getVar('VITE_ENABLE_AI', 'true') === 'true',
  VITE_GOOGLE_MAPS_KEY: getVar('VITE_GOOGLE_MAPS_KEY', ''),
  NODE_ENV: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;
