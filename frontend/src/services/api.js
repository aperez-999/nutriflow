import axios from 'axios';

// Set base URL for all API calls
// Prefer explicit VITE_API_URL, else localhost:3000 in dev, else current origin in prod
const inferBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If a localhost URL is mistakenly present in production, ignore it
  if (envUrl) {
    const isLocal = /localhost|127\.0\.0\.1/i.test(envUrl);
    if (!import.meta.env.PROD || !isLocal) {
      return envUrl;
    }
  }
  if (!import.meta.env.PROD) return 'http://localhost:3000';
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return '';
};
const base = inferBaseUrl().replace(/\/?api\/?$/, '');
axios.defaults.baseURL = base;
axios.defaults.timeout = 60000;

// When deploying on Vercel Hobby, consolidate serverless routes under /api/[collection]
// so FE calls need to support both styles
const normalizePath = (p) => {
  // diets/workouts collections map to /api/[collection]
  if (/^\/api\/(diets|workouts)(\/.*)?$/.test(p)) return p; // keep standard paths
  return p; // no change for other APIs
};

axios.interceptors.request.use((config) => {
  if (config.url) {
    config.url = normalizePath(config.url);
  }
  return config;
});
axios.defaults.withCredentials = true;

// Get token function
const getToken = () => {
    return localStorage.getItem('token');
};

// Add default headers for all requests
axios.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token && !config.headers?.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const MAX_CHAT_HISTORY_MESSAGES = 100;
const MAX_CHAT_MESSAGE_LENGTH = 4000;

const normalizeChatRole = (message) => {
  const role = typeof message?.role === 'string' ? message.role.trim().toLowerCase() : '';
  const type = typeof message?.type === 'string' ? message.type.trim().toLowerCase() : '';

  if (role === 'user' || type === 'user') return 'user';
  if (role === 'assistant' || type === 'assistant' || type === 'ai') return 'assistant';
  return null;
};

export const normalizeChatMessage = (message, output = 'role') => {
  if (!message || typeof message !== 'object') {
    return null;
  }

  const role = normalizeChatRole(message);
  const content = typeof message.content === 'string' ? message.content.trim() : '';

  if (!role || !content) {
    return null;
  }

  const normalizedContent = content.slice(0, MAX_CHAT_MESSAGE_LENGTH);

  if (output === 'type') {
    return {
      type: role === 'user' ? 'user' : 'assistant',
      content: normalizedContent,
    };
  }

  return {
    role,
    content: normalizedContent,
  };
};

export const sanitizeChatMessages = (messages, output = 'role') => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((message) => normalizeChatMessage(message, output))
    .filter(Boolean)
    .slice(-MAX_CHAT_HISTORY_MESSAGES);
};

// Workout API functions
export const getWorkouts = async () => {
    const response = await axios.get('/api/workouts');
    return response.data;
};

export const addWorkout = async (workoutData) => {
    const response = await axios.post('/api/workouts', workoutData);
    return response.data;
};

export const updateWorkout = async (id, workoutData) => {
    const response = await axios.put(`/api/workouts/${id}`, workoutData);
    return response.data;
};

export const deleteWorkout = async (id) => {
    const response = await axios.delete(`/api/workouts/${id}`);
    return response.data;
};

// Auth API functions
export const login = async (credentials) => {
    try {
        const response = await axios.post('/api/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Login failed' };
    }
};

export const register = async ({ username, email, password }) => {
    try {
        const response = await axios.post('/api/auth/register', {
            username,
            email,
            password
        });

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Registration failed' };
    }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put('/api/auth/me', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

export const updateGoals = async (goals) => {
  try {
    const response = await axios.put('/api/auth/me/goals', goals);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update goals' };
  }
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await axios.put('/api/auth/me/password', { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update password' };
  }
};

// Diet functions
export const getDiets = async () => {
    const response = await axios.get('/api/diets');
    return response.data;
};

export const addDiet = async (dietData) => {
    const response = await axios.post('/api/diets', dietData);
    return response.data;
};

export const updateDiet = async (id, dietData) => {
    const response = await axios.put(`/api/diets/${id}`, dietData);
    return response.data;
};

export const deleteDiet = async (id) => {
    const response = await axios.delete(`/api/diets/${id}`);
    return response.data;
};

// Add error interceptor
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';
        const token = getToken();
        // Do not redirect on 401 for login attempts; let the caller handle the error
        if (status === 401 && token && !url.includes('/api/auth/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send reset email' };
  }
};

export const resetPassword = async (token, password) => {
  try {
    // Use PUT to avoid any serverless provider restrictions on POST to dynamic routes
    const response = await axios.put(`/api/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};

// AI Fitness Chat & History
export const aiChat = async (message, context, history = []) => {
  try {
    const safeHistory = sanitizeChatMessages(history, 'type');
    const response = await axios.post('/api/ai/chat', { message, context, history: safeHistory }, { timeout: 65000 });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'AI chat failed' };
  }
};

export const saveChatHistory = async (messages) => {
  try {
    const safeMessages = sanitizeChatMessages(messages, 'role');
    if (safeMessages.length === 0) {
      return { success: true, saved: 0, ignored: Array.isArray(messages) ? messages.length : 0 };
    }

    const response = await axios.post('/api/chat/history', { messages: safeMessages });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to save history' };
  }
};

export const loadChatHistory = async (limit = 40) => {
  try {
    const response = await axios.get(`/api/chat/history?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load history' };
  }
};

export const clearChatHistory = async () => {
  try {
    const response = await axios.delete('/api/chat/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to clear history' };
  }
};

// Daily check-ins (sleep, energy, soreness, water)
export const getCheckIns = async (limit = 90) => {
  try {
    const response = await axios.get('/api/checkins', { params: { limit } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load check-ins' };
  }
};

export const saveCheckIn = async (dayKey, checkIn) => {
  try {
    const response = await axios.put(`/api/checkins/${dayKey}`, checkIn);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to save check-in' };
  }
};

// Food search functions
export const searchFoods = async (query) => {
  try {
    const response = await axios.get(`/api/food/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search foods' };
  }
};

export const searchExercises = async (query) => {
  try {
    const response = await axios.get(`/api/exercise/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search exercises' };
  }
};

// AI Configuration check
export const checkAIConfig = async () => {
  try {
    const response = await axios.get('/api/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check AI configuration' };
  }
};
