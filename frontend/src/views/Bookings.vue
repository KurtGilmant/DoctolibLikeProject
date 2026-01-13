<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Mes rendez-vous</h1>

    <div class="mb-6">
      <button @click="tab = 'upcoming'" :class="['px-6 py-2 rounded-l', tab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200']">
        À venir
      </button>
      <button @click="tab = 'past'" :class="['px-6 py-2 rounded-r', tab === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-200']">
        Passés
      </button>
    </div>

    <div class="space-y-4">
      <div v-for="booking in bookings" :key="booking.id" class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-xl font-bold">{{ booking.garage.name }}</h3>
            <p class="text-gray-600">{{ booking.service.name }} - {{ booking.service.price }}€</p>
            <p class="text-gray-600">📅 {{ formatDate(booking.slot.startTime) }}</p>
            <p class="text-gray-600">🕐 {{ formatTime(booking.slot.startTime) }} - {{ formatTime(booking.slot.endTime) }}</p>
            <span :class="['inline-block px-3 py-1 rounded text-sm mt-2', getStatusClass(booking.status)]">
              {{ getStatusLabel(booking.status) }}
            </span>
          </div>
          <button v-if="tab === 'upcoming' && booking.status !== 'CANCELLED'" 
            @click="cancelBooking(booking.id)" 
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Annuler
          </button>
        </div>
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
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../services/api';

const tab = ref('upcoming');
const bookings = ref([]);
const page = ref(1);
const totalPages = ref(1);

const loadBookings = async () => {
  const endpoint = tab.value === 'upcoming' ? '/bookings/my/upcoming' : '/bookings/my/past';
  const { data } = await api.get(endpoint, { params: { page: page.value } });
  bookings.value = data.bookings;
  totalPages.value = data.totalPages;
};

const cancelBooking = async (id) => {
  if (!confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) return;
  
  try {
    await api.patch(`/bookings/${id}/cancel`);
    await loadBookings();
  } catch (e) {
    alert('Erreur lors de l\'annulation');
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const getStatusLabel = (status) => {
  const labels = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    CANCELLED: 'Annulé',
    COMPLETED: 'Terminé'
  };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-gray-100 text-gray-800'
  };
  return classes[status] || '';
};

watch(tab, () => {
  page.value = 1;
  loadBookings();
});

onMounted(loadBookings);
</script>
