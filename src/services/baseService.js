/**
 * 基础服务
 * 提供通用的API调用方法和错误处理
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 创建axios实例
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    // 统一错误处理
    console.error('API错误:', error.response || error);
    return Promise.reject(error);
  }
);

// 模拟延迟 - 使用Vite环境变量方式
export const delay = (ms) => 
  import.meta.env.DEV
    ? new Promise(resolve => setTimeout(resolve, ms)) 
    : Promise.resolve();

// 辅助函数：将模拟数据包装成API响应格式
export const mockSuccess = (data, delayMs = 500) => 
  delay(delayMs).then(() => ({
    success: true,
    data
  }));

export const mockError = (message, delayMs = 500) =>
  delay(delayMs).then(() => Promise.reject({
    success: false,
    message
  }));
