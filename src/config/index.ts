interface Config {
  API_BASE_URL: string;
  API_ENDPOINTS: {
    MESSAGES: string;
    LOGIN: string;
    REGISTER: string;
    END_SESSION: string;
    BIOGRAPHY_LATEST: string;
    BIOGRAPHY_EDIT: string;
    TRANSCRIBE: string;
  };
}

const config: Config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  API_ENDPOINTS: {
    MESSAGES: '/messages',
    LOGIN: '/user/login',
    REGISTER: '/user/register',
    END_SESSION: '/sessions/end',
    BIOGRAPHY_LATEST: '/biography/latest',
    BIOGRAPHY_EDIT: '/biography/edit',
    TRANSCRIBE: '/transcribe',
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