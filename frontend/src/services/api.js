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
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Workout API functions
export const getWorkouts = async () => {
    try {
        const response = await axios.get('/api/workouts');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addWorkout = async (workoutData) => {
    try {
        const response = await axios.post('/api/workouts', workoutData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateWorkout = async (id, workoutData) => {
    try {
        const response = await axios.put(`/api/workouts/${id}`, workoutData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteWorkout = async (id) => {
    try {
        const response = await axios.delete(`/api/workouts/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
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

// Diet functions
export const getDiets = async () => {
    try {
        const response = await axios.get('/api/diets');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addDiet = async (dietData) => {
    try {
        const response = await axios.post('/api/diets', dietData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateDiet = async (id, dietData) => {
    try {
        const response = await axios.put(`/api/diets/${id}`, dietData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteDiet = async (id) => {
    try {
        const response = await axios.delete(`/api/diets/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Add error interceptor
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
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
    const response = await axios.post(`/api/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};

// AI Fitness Chat & History
export const aiChat = async (message, context, history = []) => {
  try {
    const response = await axios.post('/api/ai/chat', { message, context, history });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'AI chat failed' };
  }
};

export const saveChatHistory = async (messages) => {
  try {
    const response = await axios.post('/api/chat/history', { messages });
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