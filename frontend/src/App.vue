<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
              <span class="text-3xl">🚗</span>
              <span>Garage Booking</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <span class="text-gray-600 hidden sm:block">Bonjour, {{ authStore.user?.firstName }}</span>
              <router-link 
                v-if="authStore.user?.role === 'PROFESSIONAL'" 
                to="/pro/dashboard" 
                class="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Dashboard
              </router-link>
              <router-link 
                v-else 
                to="/bookings" 
                class="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Mes RDV
              </router-link>
              <button 
                @click="handleLogout" 
                class="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Déconnexion
              </button>
            </template>
            <template v-else>
              <router-link to="/login" class="text-gray-700 hover:text-blue-600 font-medium transition">
                Connexion
              </router-link>
              <router-link to="/register" class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                Inscription
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>
    <router-view />
    
    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="mb-2">🚗 Garage Booking - Trouvez et réservez votre garage en quelques clics</p>
        <p class="text-sm text-gray-500">© 2024 - Tous droits réservés</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>
