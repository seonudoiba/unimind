const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let authToken = localStorage.getItem('authToken');

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

export const apiClient = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

export const authAPI = {
  login: (email, password) => 
    apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  verify: () => apiClient('/auth/verify'),
  
  setup: (email, password, name) =>
    apiClient('/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    })
};

export const contentAPI = {
  getGrades: () => apiClient('/content/grades'),
  getDay: (dayId) => apiClient(`/content/day/${dayId}`),
  createGrade: (data) => apiClient('/content/grades', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  createWeek: (data) => apiClient('/content/weeks', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  createDay: (data) => apiClient('/content/days', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDay: (dayId, data) => apiClient(`/content/days/${dayId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteDay: (dayId) => apiClient(`/content/days/${dayId}`, {
    method: 'DELETE'
  }),
  deleteGrade: (gradeId) => apiClient(`/content/grades/${gradeId}`, {
    method: 'DELETE'
  })
};

export const progressAPI = {
  getProgress: (studentId, dayId) => 
    apiClient(`/progress/student/${studentId}/day/${dayId}`),
  markComplete: (studentId, dayId) =>
    apiClient('/progress/complete', {
      method: 'POST',
      body: JSON.stringify({ studentId, dayId })
    }),
  getStudentProgress: (studentId) =>
    apiClient(`/progress/student/${studentId}`)
};

export const teacherAPI = {
  getStudents: () => apiClient('/teacher/students'),
  getStudent: (studentId) => apiClient(`/teacher/students/${studentId}`),
  getClassStats: () => apiClient('/teacher/class-stats')
};

export const uploadAPI = {
  uploadAudio: (audioData, fileName, stepId, duration) => 
    apiClient('/upload/audio', {
      method: 'POST',
      body: JSON.stringify({ audioData, fileName, stepId, duration })
    }),
  deleteAudio: (publicId) =>
    apiClient(`/upload/audio/${publicId}`, {
      method: 'DELETE'
    })
};