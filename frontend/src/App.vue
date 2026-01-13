<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold text-blue-600">🚗 Garage Booking</router-link>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <router-link v-if="authStore.user?.role === 'PROFESSIONAL'" to="/pro/dashboard" class="text-gray-700 hover:text-blue-600">Dashboard Pro</router-link>
              <router-link v-else to="/bookings" class="text-gray-700 hover:text-blue-600">Mes RDV</router-link>
              <button @click="authStore.logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Déconnexion</button>
            </template>
            <template v-else>
              <router-link to="/login" class="text-gray-700 hover:text-blue-600">Connexion</router-link>
              <router-link to="/register" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Inscription</router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
</script>
