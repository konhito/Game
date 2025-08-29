// Frontend Configuration
export const config = {
  // API Configuration
  API_BASE: 'https://casino-backend-obvo.onrender.com',
  
  // App Configuration
  APP_NAME: 'Casino Dashboard',
  APP_VERSION: '1.0.0',
  
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
