const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Enhanced fetch client helper that enforces secure header configuration profiles
 * Dynamically handles multi-part form payloads for file asset integration.
 */
async function fetchClient(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('uniresolve_token') : null;

  // ◄ Check if the incoming body is an instance of browser FormData
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    // ◄ THE FIX: Exclude application/json if sending files so the browser writes boundaries automatically
    ...(!isFormData && { 'Content-Type': 'application/json' }),
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
    // Gracefully handle string arrays thrown by NestJS ValidationPipe layers
    const friendlyMessage = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message;
      
    throw new Error(friendlyMessage || `HTTP operational failure: ${response.status}`);
  }

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
    // ◄ ACCEPT DYNAMIC PAYLOAD TYPES (Allows standard JSON objects or multi-part FormData maps)
    create: (payload: FormData | object) => {
      const isFormData = payload instanceof FormData;
      return fetchClient('/tickets/submit', { 
        method: 'POST', 
        // ◄ If it's FormData, pass it raw. Otherwise, encode it to a standard JSON string.
        body: isFormData ? payload : JSON.stringify(payload) 
      });
    },
    getStudentQueue: () => fetchClient('/tickets/student'),
    getDepartmentQueue: () => fetchClient('/tickets/department'),
    updateStatus: (id: string, payload: { status: string; comment?: string }) => 
      fetchClient(`/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  }
};