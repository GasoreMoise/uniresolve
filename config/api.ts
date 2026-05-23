const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Enhanced fetch client helper that enforces secure header configuration profiles
 */
async function fetchClient(endpoint: string, options: RequestInit = {}) {
  // Pull down the active JWT token from browser local storage keys
  const token = typeof window !== 'undefined' ? localStorage.getItem('uniresolve_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP operational failure: ${response.status}`);
  }

  // Return parsed JSON payload data if content exists
  return response.status !== 204 ? await response.json() : null;
}

export const api = {
  // Authentication Request Handlers
  auth: {
    login: (payload: object) => fetchClient('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    register: (payload: object) => fetchClient('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  },
  
  // Student Ticket Management Handlers
  tickets: {
    create: (payload: object) => fetchClient('/tickets/submit', { method: 'POST', body: JSON.stringify(payload) }),
    getStudentQueue: () => fetchClient('/tickets/student'),
    getDepartmentQueue: () => fetchClient('/tickets/department'),
    updateStatus: (id: string, payload: { status: string; comment?: string }) => 
      fetchClient(`/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  }
};