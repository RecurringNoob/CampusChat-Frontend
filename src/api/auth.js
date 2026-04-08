import api from './axios';

export const register = (email, password, fullName) =>
  api.post('/auth/register', { email, password, fullName });

export const verifyOtp = (email, code) =>
  api.post('/auth/verify-otp', { email, code });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const resendOtp = (email) =>
  api.post('/auth/resend-otp', { email });

export const logout = async () => {
  try {
    await api.post('/auth/logout', {}, { withCredentials: true });
  } catch (err) {
    console.log(err);
  }
  localStorage.removeItem('accessToken');
};

// Google OAuth – redirect to backend
export const getGoogleAuthUrl = () =>
  `${api.defaults.baseURL}/auth/google`;