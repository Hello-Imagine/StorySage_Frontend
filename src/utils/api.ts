import { useAuthStore } from '../stores/authStore';
import { getApiUrl } from '../config';

interface RequestConfig extends RequestInit {
  requireAuth?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const handleUnauthorized = () => {
  useAuthStore.getState().logout();
  window.location.href = '/';
};

export async function apiClient(
  endpoint: keyof typeof import('../config').default['API_ENDPOINTS'] | string,
  config: RequestConfig = {}
) {
  const { token } = useAuthStore.getState();
  const { requireAuth = true, ...customConfig } = config;

  // Check if we're sending FormData
  const isFormData = customConfig.body instanceof FormData;
  
  const headers = new Headers({
    // Only set Content-Type for non-FormData requests
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Directed to login page if token is expired (aka unauthorized)
    if (response.status === 401) {
      handleUnauthorized();
    } 
    // Or throw an error if the request failed
    else {
      throw new ApiError(
        response.status,
        data?.detail || data?.message || 'Request failed'
      );
    }
  }

  return data;
}

export const transcribeAudio = async (formData: FormData): Promise<string> => {
  const response = await apiClient('TRANSCRIBE', {
    method: 'POST',
    headers: {},
    body: formData,
  });
  
  return response.text;
}; 