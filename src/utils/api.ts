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

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    throw new ApiError(
      response.status,
      response.status === 401 ? 'Unauthorized' : 'Request failed'
    );
  }

  return response.json();
}

export const transcribeAudio = async (formData: FormData): Promise<string> => {
  const response = await apiClient('TRANSCRIBE', {
    method: 'POST',
    headers: {},
    body: formData,
  });
  
  return response.text;
}; 