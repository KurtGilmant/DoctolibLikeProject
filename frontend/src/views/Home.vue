<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center mb-8">Trouvez votre garage</h1>
    
    <!-- Filtres -->
    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input v-model="filters.city" @input="searchGarages" type="text" placeholder="Ville" class="border rounded px-4 py-2">
        <select v-model="filters.serviceType" @change="searchGarages" class="border rounded px-4 py-2">
          <option value="">Type de service</option>
          <option value="VIDANGE">Vidange</option>
          <option value="REVISION">Révision</option>
          <option value="PNEUS">Pneus</option>
          <option value="DIAGNOSTIC">Diagnostic</option>
          <option value="FREINAGE">Freinage</option>
          <option value="CARROSSERIE">Carrosserie</option>
        </select>
        <input v-model="filters.maxPrice" @input="searchGarages" type="number" placeholder="Prix max" class="border rounded px-4 py-2">
        <label class="flex items-center">
          <input v-model="filters.available" @change="searchGarages" type="checkbox" class="mr-2">
          Disponible maintenant
        </label>
      </div>
    </div>

    <!-- Carte -->
    <div id="map" class="h-96 rounded-lg shadow mb-8"></div>

    <!-- Liste des garages -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="garage in garages" :key="garage.id" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
        <h3 class="text-xl font-bold mb-2">{{ garage.name }}</h3>
        <p class="text-gray-600 mb-2">{{ garage.city }}</p>
        <p class="text-sm text-gray-500 mb-4">{{ garage.services?.length || 0 }} services disponibles</p>
        <router-link :to="`/garages/${garage.id}`" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block">
          Voir les créneaux
        </router-link>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8 space-x-2">
      <button v-for="p in totalPages" :key="p" @click="page = p; searchGarages()" 
        :class="['px-4 py-2 rounded', p === page ? 'bg-blue-600 text-white' : 'bg-gray-200']">
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import L from 'leaflet';

const garages = ref([]);
const page = ref(1);
const totalPages = ref(1);
const filters = ref({ city: '', serviceType: '', maxPrice: '', available: false });
let map = null;
let markers = [];

const searchGarages = async () => {
  const params = { page: page.value };
  if (filters.value.city) params.city = filters.value.city;
  if (filters.value.serviceType) params.serviceType = filters.value.serviceType;
  if (filters.value.maxPrice) params.maxPrice = filters.value.maxPrice;
  if (filters.value.available) params.available = 'true';

  const { data } = await api.get('/garages', { params });
  garages.value = data.garages;
  totalPages.value = data.totalPages;
  updateMap();
};

const updateMap = () => {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  
  garages.value.forEach(garage => {
    const marker = L.marker([garage.latitude, garage.longitude])
      .bindPopup(`<b>${garage.name}</b><br>${garage.city}`)
      .addTo(map);
    markers.push(marker);
  });

  if (garages.value.length > 0) {
    map.setView([garages.value[0].latitude, garages.value[0].longitude], 12);
  }
};

onMounted(async () => {
  map = L.map('map').setView([48.8566, 2.3522], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  await searchGarages();
});
</script>
