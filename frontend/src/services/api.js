import axios from 'axios';

// API base URL: VITE_API_URL when set (a localhost value is ignored in production),
// else localhost:3000 in development, else the app's own origin.
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

export const register = async ({ username, email, password, invite }) => {
    try {
        const response = await axios.post('/api/auth/register', {
            username,
            email,
            password,
            ...(invite && { invite }),
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
        // 401 only ever means the session is gone (expired or invalid token). Login attempts
        // handle their own 401. Send the user to log in, then back to where they were.
        if (status === 401 && token && !url.includes('/api/auth/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const from = `${window.location.pathname}${window.location.search}`;
            window.location.href = `/login?expired=1&from=${encodeURIComponent(from)}`;
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

// AI coach chat, and the single saved conversation older versions kept (imported once)
export const aiChat = async (message, context, history = []) => {
  try {
    const safeHistory = sanitizeChatMessages(history, 'type');
    const response = await axios.post('/api/ai/chat', { message, context, history: safeHistory }, { timeout: 65000 });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'AI chat failed' };
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

// Daily check-ins (sleep, energy, soreness, water)
/** The account as the server has it now (the app may have changed it). */
export const getMe = async () => {
    const response = await axios.get('/api/auth/me');
    return response.data;
};

/** The account's profile photo as an object URL, or null without one. */
export const getAvatarUrl = async () => {
    try {
        const response = await axios.get('/api/auth/me/avatar', { responseType: 'blob' });
        return URL.createObjectURL(response.data);
    } catch (error) {
        if (error.response?.status === 404) return null;
        throw error.response?.data || { message: 'Failed to load your photo' };
    }
};

/** A small square photo, as base64 JPEG (see Settings → Profile). */
export const uploadAvatar = async (image) => {
    try {
        const response = await axios.put('/api/auth/me/avatar', { image });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to save your photo' };
    }
};

export const deleteAvatar = async () => {
    try {
        const response = await axios.delete('/api/auth/me/avatar');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to remove your photo' };
    }
};

/** What the person is training for and how they eat, for the coach. */
export const updateAbout = async (about) => {
  try {
    const response = await axios.put('/api/auth/me/about', about);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to save that' };
  }
};

/** What the coach has saved from earlier chats, newest first. */
export const getCoachNotes = async () => {
  try {
    const response = await axios.get('/api/auth/me/notes');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load what your coach remembers' };
  }
};

export const deleteCoachNote = async (id) => {
  try {
    const response = await axios.delete(`/api/auth/me/notes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to remove that note' };
  }
};

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

// Exercise library (stored in MongoDB, seeded from the backend catalog)
export const getExerciseLibrary = async () => {
  try {
    const response = await axios.get('/api/exercises');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load the exercise library' };
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

// Saved plans, kept on the account so they follow the user across devices
export const getSavedPlans = async () => {
  try {
    const response = await axios.get('/api/plans');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load saved plans' };
  }
};

export const saveSavedPlan = async (id, plan) => {
  try {
    const response = await axios.put(`/api/plans/${encodeURIComponent(id)}`, plan);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to save the plan' };
  }
};

export const deleteSavedPlan = async (id) => {
  try {
    const response = await axios.delete(`/api/plans/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete the plan' };
  }
};

// Your data: download everything, or delete the account and all of its records
export const exportMyData = async () => {
  try {
    const response = await axios.get('/api/auth/me/export');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to export your data' };
  }
};

export const deleteMyAccount = async (password) => {
  try {
    const response = await axios.delete('/api/auth/me', { data: { password } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete your account' };
  }
};

// Coach conversations, kept on the account so they follow the user across devices
export const getConversations = async () => {
  try {
    const response = await axios.get('/api/chat/conversations');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load conversations' };
  }
};

export const saveConversation = async (id, conversation) => {
  try {
    const response = await axios.put(`/api/chat/conversations/${encodeURIComponent(id)}`, conversation);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to save the conversation' };
  }
};

export const deleteConversation = async (id) => {
  try {
    const response = await axios.delete(`/api/chat/conversations/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete the conversation' };
  }
};
