import axios, { AxiosRequestConfig } from 'axios';
import keycloak from '../auth/keycloak';

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV !== 'production' ? 'http://localhost:1337' : 'https://api.tavl.no');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  if (keycloak.authenticated && keycloak.token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${keycloak.token}`
    } as any;
  }
  return config;
});

export const get = <T = any>(url: string, config?: AxiosRequestConfig) => api.get<T>(url, config);
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => api.post<T>(url, data, config);
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => api.put<T>(url, data, config);

export default api;
