<template>
  <div class="max-w-md mx-auto mt-16 px-4">
    <div class="bg-white p-8 rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-6">Inscription</h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Prénom</label>
          <input v-model="form.firstName" required class="w-full border rounded px-4 py-2">
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Nom</label>
          <input v-model="form.lastName" required class="w-full border rounded px-4 py-2">
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Email</label>
          <input v-model="form.email" type="email" required class="w-full border rounded px-4 py-2">
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Téléphone</label>
          <input v-model="form.phone" class="w-full border rounded px-4 py-2">
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Mot de passe</label>
          <input v-model="form.password" type="password" required class="w-full border rounded px-4 py-2">
        </div>
        <div class="mb-6">
          <label class="flex items-center">
            <input v-model="form.isPro" type="checkbox" class="mr-2">
            Je suis un professionnel
          </label>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          S'inscrire
        </button>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const form = ref({ firstName: '', lastName: '', email: '', phone: '', password: '', isPro: false });
const error = ref('');

const handleRegister = async () => {
  try {
    await authStore.register({
      ...form.value,
      role: form.value.isPro ? 'PROFESSIONAL' : 'USER'
    });
    router.push(form.value.isPro ? '/pro/dashboard' : '/');
  } catch (e) {
    error.value = 'Erreur lors de l\'inscription';
  }
};
</script>
