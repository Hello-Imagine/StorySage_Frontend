interface Config {
  API_BASE_URL: string;
  API_ENDPOINTS: {
    SESSIONS: string;
    MESSAGES: string;
    LOGIN: string;
    END_SESSION: (sessionId: string) => string;
  };
}

const config: Config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  API_ENDPOINTS: {
    SESSIONS: '/sessions',
    MESSAGES: '/messages',
    LOGIN: '/user/login',
    END_SESSION: (sessionId: string) => `/sessions/${sessionId}/end`,
  },
};

export const getApiUrl = (endpoint: keyof Config['API_ENDPOINTS'] | string) => {
  if (endpoint in config.API_ENDPOINTS) {
    const configEndpoint = config.API_ENDPOINTS[endpoint as keyof Config['API_ENDPOINTS']];
    return `${config.API_BASE_URL}${configEndpoint}`;
  }
  return `${config.API_BASE_URL}${endpoint}`;
};

export default config; 