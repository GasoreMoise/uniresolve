const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchClient(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('uniresolve_token') : null;
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
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
    const friendlyMessage = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message;
      
    throw new Error(friendlyMessage || `HTTP operational failure: ${response.status}`);
  }

  return response.status !== 204 ? await response.json() : null;
}

export const api = {
  auth: {
    login: (payload: object) => fetchClient('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    register: (payload: object) => fetchClient('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  },
  
  users: {
    getLecturers: () => fetchClient('/auth/lecturers', { method: 'GET' }),
  },
  
  tickets: {
    create: (payload: FormData | object) => {
      const isFormData = payload instanceof FormData;
      return fetchClient('/tickets/submit', { 
        method: 'POST', 
        body: isFormData ? payload : JSON.stringify(payload) 
      });
    },
    getStudentQueue: () => fetchClient('/tickets/student'),
    getDepartmentQueue: () => fetchClient('/tickets/department'),
    
    updateStatus: (id: string, payload: { status: string; comment?: string }) => 
      fetchClient(`/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),

    resolveSpecialAssessment: (id: string, payload: { date: string; venue: string; notes?: string }) =>
      fetchClient(`/tickets/${id}/resolve-assessment`, { method: 'PATCH', body: JSON.stringify(payload) }),

    submitReviewDecision: (id: string, payload: { status: 'REJECTED' | 'ACTION_REQUIRED'; comment: string }) =>
      fetchClient(`/tickets/${id}/review-decision`, { method: 'PATCH', body: JSON.stringify(payload) }),

    resolveExamClaim: (id: string, payload: { isMarkAltered: boolean; revisedMarkInfo?: string; notes: string }) =>
      fetchClient(`/tickets/${id}/resolve-exam-claim`, { method: 'PATCH', body: JSON.stringify(payload) }),

    resolveTranscriptRequest: (id: string, payload: { decision: 'APPROVED' | 'REJECTED'; reason?: string }) =>
      fetchClient(`/tickets/${id}/resolve-transcript`, { method: 'PATCH', body: JSON.stringify(payload) }),

    resolveCardReplacement: (id: string) => 
      fetchClient(`/tickets/${id}/resolve-card`, { method: 'PATCH' }),

    resubmitTicket: (id: string, payload: any) => 
      fetchClient(`/tickets/${id}/resubmit`, { method: 'PATCH', body: JSON.stringify(payload) }),
  },

  profile: {
    getMe: () => fetchClient('/profile/me', { method: 'GET' }),
    // ◄ NEW: IAM Endpoints mapped to the profile module
    getAllUsers: () => fetchClient('/profile/users', { method: 'GET' }),
    updateRole: (id: string, payload: { role: string; department: string | null }) => 
      fetchClient(`/profile/users/${id}/role`, { method: 'PATCH', body: JSON.stringify(payload) }),
  },

  grades: {
    getRoster: () => fetchClient('/grades/roster', { method: 'GET' }),
    updateStudentMarks: (moduleId: string, studentId: string, payload: any) => 
      fetchClient(`/grades/module/${moduleId}/student/${studentId}`, { 
        method: 'PUT', 
        body: JSON.stringify(payload) 
      }),
  },

  // ◄ NEW: Audit Endpoints
  audit: {
    getLogs: () => fetchClient('/audit', { method: 'GET' }),
  },
};