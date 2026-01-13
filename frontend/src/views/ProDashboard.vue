<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Dashboard Professionnel</h1>

    <!-- Statistiques -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-600 mb-2">Total réservations</h3>
        <p class="text-3xl font-bold">{{ stats.totalBookings }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-600 mb-2">Réservations terminées</h3>
        <p class="text-3xl font-bold">{{ stats.completedBookings }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-600 mb-2">Revenu total</h3>
        <p class="text-3xl font-bold">{{ stats.totalRevenue }}€</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <button @click="tab = 'bookings'" :class="['px-6 py-2', tab === 'bookings' ? 'bg-blue-600 text-white' : 'bg-gray-200']">
        Réservations
      </button>
      <button @click="tab = 'services'" :class="['px-6 py-2', tab === 'services' ? 'bg-blue-600 text-white' : 'bg-gray-200']">
        Services
      </button>
      <button @click="tab = 'slots'" :class="['px-6 py-2', tab === 'slots' ? 'bg-blue-600 text-white' : 'bg-gray-200']">
        Créneaux
      </button>
    </div>

    <!-- Réservations -->
    <div v-if="tab === 'bookings'" class="space-y-4">
      <div v-for="booking in bookings" :key="booking.id" class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between">
          <div>
            <h3 class="font-bold">{{ booking.user.firstName }} {{ booking.user.lastName }}</h3>
            <p class="text-gray-600">{{ booking.service.name }} - {{ booking.service.price }}€</p>
            <p class="text-gray-600">📅 {{ formatDate(booking.slot.startTime) }} à {{ formatTime(booking.slot.startTime) }}</p>
            <p class="text-gray-600">📞 {{ booking.user.phone }}</p>
          </div>
          <select v-model="booking.status" @change="updateStatus(booking.id, booking.status)" class="border rounded px-4 py-2 h-10">
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="COMPLETED">Terminé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8 space-x-2">
        <button v-for="p in totalPages" :key="p" @click="page = p; loadBookings()" 
          :class="['px-4 py-2 rounded', p === page ? 'bg-blue-600 text-white' : 'bg-gray-200']">
          {{ p }}
        </button>
      </div>
    </div>

    <!-- Services -->
    <div v-if="tab === 'services'">
      <button @click="showServiceForm = true" class="bg-blue-600 text-white px-6 py-2 rounded mb-4">
        + Ajouter un service
      </button>
      
      <div v-if="showServiceForm" class="bg-white rounded-lg shadow p-6 mb-4">
        <h3 class="text-xl font-bold mb-4">Nouveau service</h3>
        <form @submit.prevent="createService">
          <div class="grid grid-cols-2 gap-4">
            <select v-model="serviceForm.type" required class="border rounded px-4 py-2">
              <option value="VIDANGE">Vidange</option>
              <option value="REVISION">Révision</option>
              <option value="PNEUS">Pneus</option>
              <option value="DIAGNOSTIC">Diagnostic</option>
              <option value="FREINAGE">Freinage</option>
              <option value="CARROSSERIE">Carrosserie</option>
            </select>
            <input v-model="serviceForm.name" placeholder="Nom" required class="border rounded px-4 py-2">
            <input v-model="serviceForm.price" type="number" placeholder="Prix" required class="border rounded px-4 py-2">
            <input v-model="serviceForm.duration" type="number" placeholder="Durée (min)" required class="border rounded px-4 py-2">
          </div>
          <div class="mt-4 space-x-2">
            <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded">Créer</button>
            <button type="button" @click="showServiceForm = false" class="bg-gray-300 px-6 py-2 rounded">Annuler</button>
          </div>
        </form>
      </div>

      <div class="space-y-4">
        <div v-for="service in services" :key="service.id" class="bg-white rounded-lg shadow p-6 flex justify-between items-center">
          <div>
            <h3 class="font-bold">{{ service.name }}</h3>
            <p class="text-gray-600">{{ service.duration }} min - {{ service.price }}€</p>
          </div>
          <button @click="deleteService(service.id)" class="bg-red-500 text-white px-4 py-2 rounded">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Créneaux -->
    <div v-if="tab === 'slots'">
      <div class="bg-white rounded-lg shadow p-6 mb-4">
        <h3 class="text-xl font-bold mb-4">Créer des créneaux</h3>
        <form @submit.prevent="createSlot">
          <div class="grid grid-cols-2 gap-4">
            <input v-model="slotForm.date" type="date" required class="border rounded px-4 py-2">
            <input v-model="slotForm.startTime" type="time" required class="border rounded px-4 py-2">
            <input v-model="slotForm.endTime" type="time" required class="border rounded px-4 py-2">
          </div>
          <button type="submit" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded">Créer créneau</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const tab = ref('bookings');
const stats = ref(null);
const bookings = ref([]);
const services = ref([]);
const page = ref(1);
const totalPages = ref(1);
const showServiceForm = ref(false);
const serviceForm = ref({ type: 'VIDANGE', name: '', price: '', duration: '' });
const slotForm = ref({ date: '', startTime: '', endTime: '' });

const loadStats = async () => {
  const { data } = await api.get('/garages/stats');
  stats.value = data;
};

const loadBookings = async () => {
  const { data } = await api.get('/bookings/garage', { params: { page: page.value } });
  bookings.value = data.bookings;
  totalPages.value = data.totalPages;
};

const loadServices = async () => {
  const { data } = await api.get('/garages/my');
  services.value = data.services;
};

const createService = async () => {
  await api.post('/services', serviceForm.value);
  showServiceForm.value = false;
  serviceForm.value = { type: 'VIDANGE', name: '', price: '', duration: '' };
  await loadServices();
};

const deleteService = async (id) => {
  if (!confirm('Supprimer ce service ?')) return;
  await api.delete(`/services/${id}`);
  await loadServices();
};

const createSlot = async () => {
  const startTime = new Date(`${slotForm.value.date}T${slotForm.value.startTime}`);
  const endTime = new Date(`${slotForm.value.date}T${slotForm.value.endTime}`);
  
  await api.post('/slots', {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString()
  });
  
  slotForm.value = { date: '', startTime: '', endTime: '' };
  alert('Créneau créé !');
};

const updateStatus = async (id, status) => {
  await api.patch(`/bookings/${id}/status`, { status });
};

const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');
const formatTime = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

onMounted(async () => {
  await loadStats();
  await loadBookings();
  await loadServices();
});
</script>
