import axios from 'axios';

// Set base URL for all API calls
axios.defaults.baseURL = 'https://nutriflow.onrender.com';
axios.defaults.withCredentials = true;

// Get token function (if you have it)
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
