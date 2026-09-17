const API_BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('jobboard_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    // Gracefully handle free-tier sleeping server or network drop
    console.warn('Network request failed or server is waking up:', err);
    throw new ApiError(
      'Unable to connect to the server. The free-tier instance may be waking up from sleep mode — please wait a moment and try again.',
      0
    );
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  let data: any = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let rawMsg = data?.error?.message || `Request failed with status ${response.status}`;
    // Sanitize technical messages from exposing database or runtime internals
    if (/ECONNREFUSED|ENOTFOUND|MongoServerError|PostgresError|Sequelize|Knex|Stack trace/i.test(rawMsg)) {
      rawMsg = 'Unable to complete your request at this time. Please try again later.';
    }
    throw new ApiError(rawMsg, response.status, data?.error?.details);
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
