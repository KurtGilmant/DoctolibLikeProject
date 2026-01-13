import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token'));
  const router = useRouter();

  const isAuthenticated = computed(() => !!token.value);
  const isProfessional = computed(() => user.value?.role === 'PROFESSIONAL');

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const init = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      user.value = JSON.parse(savedUser);
    }
  };

  init();

  return { user, token, isAuthenticated, isProfessional, login, register, logout };
});
