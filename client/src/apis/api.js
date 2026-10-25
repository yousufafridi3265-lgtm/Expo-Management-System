import axios from "axios";

// Login ke baad token browser mein is naam se save hota hai (AuthContext yahi use karta hai)
export const TOKEN_KEY = "expo_token";

// Token expire ho jaye to yeh event chalta hai, taake AuthContext user ko logout kar de
export const AUTH_EXPIRED_EVENT = "auth:expired";

// Login aur register ka 401 "galat password" hota hai, token expire nahi
const AUTH_PATHS = ["/auth/login", "/auth/register"];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Har request se pehle: token ho to Authorization header laga do
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token kharab ya expire ho (401) to usay hata do aur AuthContext ko bata do
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = AUTH_PATHS.includes(error.config?.url);
    const hadToken = Boolean(localStorage.getItem(TOKEN_KEY));

    if (error.response?.status === 401 && hadToken && !isAuthRequest) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);

export default api;
