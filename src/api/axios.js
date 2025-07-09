import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: { 'Content-Type': 'application/json' },
});

/* ---------- attach access token ---------- */
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ---------- refresh on 401 ---------- */
axiosInstance.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh');

      if (!refresh) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // 👉 делаем запрос ТОЧНО к back-end, минуя localhost:3000
        const { data } = await axios.post(
          'http://127.0.0.1:8000/api/token/refresh/',
          { refresh },
          { headers: { 'Content-Type': 'application/json' } }
        );

        localStorage.setItem('access', data.access);
        // обновляем заголовок и повторяем исходный запрос
        original.headers.Authorization = `Bearer ${data.access}`;
        return axiosInstance(original);
      } catch (e) {
        // refresh-токен истёк — сбрасываем сессию
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
