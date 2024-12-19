import { useAuthStore } from '../stores/authStore';
import { getApiUrl } from '../config';

interface RequestConfig extends RequestInit {
  requireAuth?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiClient(
  endpoint: keyof typeof import('../config').default['API_ENDPOINTS'] | string,
  config: RequestConfig = {}
) {
  const { token } = useAuthStore.getState();
  const { requireAuth = true, ...customConfig } = config;

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...customConfig.headers,
  });

  if (requireAuth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(
    getApiUrl(endpoint),
    {
      ...customConfig,
      headers,
    }
  );

  if (!response.ok) {
    throw new ApiError(response.status, 
      response.status === 401 ? 'Unauthorized' : 'Request failed'
    );
  }

  return response.json();
} 