<template>
  <div class="max-w-md mx-auto mt-16 px-4">
    <div class="bg-white p-8 rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-6">Connexion</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Email</label>
          <input v-model="form.email" type="email" required class="w-full border rounded px-4 py-2">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Mot de passe</label>
          <input v-model="form.password" type="password" required class="w-full border rounded px-4 py-2">
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Se connecter
        </button>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
      </form>
      <p class="mt-4 text-center">
        Pas de compte ? <router-link to="/register" class="text-blue-600">S'inscrire</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const form = ref({ email: '', password: '' });
const error = ref('');

const handleLogin = async () => {
  try {
    await authStore.login(form.value.email, form.value.password);
    router.push(authStore.isProfessional ? '/pro/dashboard' : '/');
  } catch (e) {
    error.value = 'Identifiants invalides';
  }
};
</script>
