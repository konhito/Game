// Frontend Configuration
console.log("Environment variables:", {
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME
});

export const config = {
  // API Configuration - use env or fallback
  API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'https://api.pinecrest247.com',
  
  // App Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'PineCoin',
  APP_VERSION: '1.0.0',
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Feature Flags
  FEATURES: {
    SPIN_WHEEL: true,
    LEADERBOARD: true,
    ACHIEVEMENTS: true,
    NOTIFICATIONS: true,
    TASK_CATEGORIES: true,
    USER_PRODUCTS: true,
    USER_ORDERS: true,
  },
  
  // UI Configuration
  UI: {
    THEME: 'light',
    ANIMATIONS: true,
    SOUND_EFFECTS: false,
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
};

export default config;
