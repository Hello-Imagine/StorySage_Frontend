interface Config {
  API_BASE_URL: string;
  API_ENDPOINTS: {
    SESSIONS: string;
    MESSAGES: string;
    LOGIN: string;
    // Add other endpoints here
  };
}

const config: Config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  API_ENDPOINTS: {
    SESSIONS: '/sessions',
    MESSAGES: '/messages',
    LOGIN: '/user/login',
  },
};

export const getApiUrl = (endpoint: keyof Config['API_ENDPOINTS']) => {
  return `${config.API_BASE_URL}${config.API_ENDPOINTS[endpoint]}`;
};

export default config; 