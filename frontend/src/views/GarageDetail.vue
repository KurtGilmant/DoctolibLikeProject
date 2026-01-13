<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div v-if="garage" class="bg-white rounded-lg shadow p-8 mb-8">
      <h1 class="text-3xl font-bold mb-4">{{ garage.name }}</h1>
      <p class="text-gray-600 mb-2">📍 {{ garage.address }}, {{ garage.city }} {{ garage.postalCode }}</p>
      <p class="text-gray-600 mb-2">📞 {{ garage.phone }}</p>
      <p class="text-gray-600 mb-4">✉️ {{ garage.email }}</p>
      <p v-if="garage.description" class="text-gray-700">{{ garage.description }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Services -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-4">Services disponibles</h2>
        <div v-for="service in garage?.services" :key="service.id" 
          @click="selectedService = service" 
          :class="['p-4 border rounded mb-2 cursor-pointer', selectedService?.id === service.id ? 'border-blue-600 bg-blue-50' : '']">
          <h3 class="font-bold">{{ service.name }}</h3>
          <p class="text-sm text-gray-600">{{ service.duration }} min - {{ service.price }}€</p>
        </div>
      </div>

      <!-- Créneaux -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-4">Créneaux disponibles</h2>
        <input v-model="selectedDate" @change="loadSlots" type="date" class="border rounded px-4 py-2 mb-4 w-full">
        
        <div v-if="slots.length === 0" class="text-gray-500">Aucun créneau disponible</div>
        <div v-for="slot in slots" :key="slot.id" class="p-3 border rounded mb-2 hover:bg-gray-50 cursor-pointer" @click="bookSlot(slot)">
          {{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const garage = ref(null);
const slots = ref([]);
const selectedService = ref(null);
const selectedDate = ref(new Date().toISOString().split('T')[0]);

const loadGarage = async () => {
  const { data } = await api.get(`/garages/${route.params.id}`);
  garage.value = data;
  if (data.services?.length > 0) {
    selectedService.value = data.services[0];
  }
};

const loadSlots = async () => {
  const { data } = await api.get('/slots', {
    params: { garageId: route.params.id, date: selectedDate.value }
  });
  slots.value = data;
};

const bookSlot = async (slot) => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  if (!selectedService.value) {
    alert('Veuillez sélectionner un service');
    return;
  }

  try {
    await api.post('/bookings', {
      garageId: garage.value.id,
      serviceId: selectedService.value.id,
      slotId: slot.id
    });
    alert('Réservation confirmée !');
    router.push('/bookings');
  } catch (e) {
    alert('Erreur lors de la réservation');
  }
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

onMounted(async () => {
  await loadGarage();
  await loadSlots();
});
</script>
