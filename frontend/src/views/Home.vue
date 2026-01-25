<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Trouvez votre garage en quelques clics</h1>
          <p class="text-xl text-blue-100">Réservez un créneau pour l'entretien de votre véhicule près de chez vous</p>
        </div>
        
        <!-- Barre de recherche principale -->
        <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="md:col-span-2">
              <label class="block text-gray-700 text-sm font-medium mb-2">📍 Adresse ou ville</label>
              <input 
                v-model="searchAddress" 
                @input="debounceSearch"
                type="text" 
                placeholder="Entrez une adresse..."
                class="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <!-- Suggestions d'adresse -->
              <div v-if="addressSuggestions.length > 0" class="absolute z-50 bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                <div 
                  v-for="suggestion in addressSuggestions" 
                  :key="suggestion.place_id"
                  @click="selectAddress(suggestion)"
                  class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-800"
                >
                  {{ suggestion.display_name }}
                </div>
              </div>
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-medium mb-2">🔧 Service</label>
              <select v-model="filters.serviceType" class="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500">
                <option value="">Tous les services</option>
                <option value="VIDANGE">Vidange</option>
                <option value="REVISION">Révision</option>
                <option value="PNEUS">Pneus</option>
                <option value="DIAGNOSTIC">Diagnostic</option>
                <option value="FREINAGE">Freinage</option>
                <option value="CARROSSERIE">Carrosserie</option>
              </select>
            </div>
            <div class="flex items-end">
              <button @click="searchGarages" class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Rechercher
              </button>
            </div>
          </div>
          
          <!-- Filtres avancés -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <button @click="showAdvancedFilters = !showAdvancedFilters" class="text-blue-600 text-sm font-medium hover:text-blue-800">
              {{ showAdvancedFilters ? '▲ Masquer les filtres' : '▼ Filtres avancés' }}
            </button>
            <div v-if="showAdvancedFilters" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">💰 Prix maximum</label>
                <input v-model="filters.maxPrice" type="number" placeholder="Ex: 150€" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800">
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">📏 Rayon de recherche</label>
                <select v-model="searchRadius" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800">
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="20">20 km</option>
                  <option value="50">50 km</option>
                </select>
              </div>
              <div class="flex items-center pt-6">
                <label class="flex items-center cursor-pointer">
                  <input v-model="filters.available" type="checkbox" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
                  <span class="ml-2 text-gray-700">Disponible aujourd'hui</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Bouton localisation -->
        <div class="text-center mt-6">
          <button @click="getUserLocation" class="text-blue-100 hover:text-white flex items-center justify-center gap-2 mx-auto">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Utiliser ma position actuelle
          </button>
        </div>
      </div>
    </section>

    <!-- Statistiques -->
    <section class="py-8 bg-white border-b">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p class="text-3xl font-bold text-blue-600">{{ totalGarages }}+</p>
            <p class="text-gray-600">Garages partenaires</p>
          </div>
          <div>
            <p class="text-3xl font-bold text-blue-600">6</p>
            <p class="text-gray-600">Types de services</p>
          </div>
          <div>
            <p class="text-3xl font-bold text-blue-600">24/7</p>
            <p class="text-gray-600">Réservation en ligne</p>
          </div>
          <div>
            <p class="text-3xl font-bold text-blue-600">100%</p>
            <p class="text-gray-600">Gratuit</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenu principal -->
    <section class="py-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Carte -->
          <div class="lg:w-1/2">
            <div class="sticky top-4">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">🗺️ Garages à proximité</h2>
              <div id="map" class="h-[500px] rounded-xl shadow-lg border-4 border-white"></div>
              <p v-if="userLocation" class="text-sm text-gray-500 mt-2 text-center">
                📍 Votre position : {{ userLocation.lat.toFixed(4) }}, {{ userLocation.lng.toFixed(4) }}
              </p>
            </div>
          </div>

          <!-- Liste des garages -->
          <div class="lg:w-1/2">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-bold text-gray-800">🔧 {{ garages.length }} garage(s) trouvé(s)</h2>
              <select v-model="sortBy" @change="sortGarages" class="border rounded-lg px-3 py-2 text-sm">
                <option value="distance">Trier par distance</option>
                <option value="name">Trier par nom</option>
                <option value="services">Trier par services</option>
              </select>
            </div>

            <div v-if="loading" class="text-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p class="text-gray-500 mt-4">Recherche des garages...</p>
            </div>

            <div v-else-if="garages.length === 0" class="bg-white rounded-xl shadow p-8 text-center">
              <div class="text-6xl mb-4">🔍</div>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">Aucun garage trouvé</h3>
              <p class="text-gray-500">Essayez d'élargir votre zone de recherche ou de modifier vos filtres.</p>
            </div>

            <div v-else class="space-y-4">
              <div 
                v-for="garage in garages" 
                :key="garage.id" 
                @mouseenter="highlightMarker(garage.id)"
                @mouseleave="unhighlightMarker(garage.id)"
                class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div class="p-6">
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h3 class="text-xl font-bold text-gray-800">{{ garage.name }}</h3>
                      <p class="text-gray-500 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        </svg>
                        {{ garage.address }}, {{ garage.city }}
                      </p>
                    </div>
                    <span v-if="garage.distance" class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      {{ garage.distance.toFixed(1) }} km
                    </span>
                  </div>
                  
                  <p v-if="garage.description" class="text-gray-600 text-sm mb-4 line-clamp-2">{{ garage.description }}</p>
                  
                  <!-- Services -->
                  <div class="mb-4">
                    <div class="flex flex-wrap gap-2">
                      <span 
                        v-for="service in garage.services?.slice(0, 4)" 
                        :key="service.id"
                        class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        {{ service.name }} - {{ service.price }}€
                      </span>
                      <span v-if="garage.services?.length > 4" class="text-gray-500 text-xs py-1">
                        +{{ garage.services.length - 4 }} autres
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        {{ garage.phone }}
                      </span>
                    </div>
                    <router-link 
                      :to="`/garages/${garage.id}`" 
                      class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      Réserver
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex justify-center mt-8 space-x-2">
              <button 
                @click="page > 1 && (page--, searchGarages())"
                :disabled="page === 1"
                class="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                ← Précédent
              </button>
              <span class="px-4 py-2 text-gray-600">Page {{ page }} sur {{ totalPages }}</span>
              <button 
                @click="page < totalPages && (page++, searchGarages())"
                :disabled="page === totalPages"
                class="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Services -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">Nos services disponibles</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div v-for="service in serviceTypes" :key="service.value" 
            @click="filters.serviceType = service.value; searchGarages()"
            class="bg-gray-50 rounded-xl p-6 text-center hover:bg-blue-50 hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-blue-200"
          >
            <div class="text-4xl mb-3">{{ service.icon }}</div>
            <h3 class="font-semibold text-gray-800">{{ service.label }}</h3>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const garages = ref([]);
const page = ref(1);
const totalPages = ref(1);
const totalGarages = ref(0);
const loading = ref(false);
const filters = ref({ city: '', serviceType: '', maxPrice: '', available: false });
const searchAddress = ref('');
const addressSuggestions = ref([]);
const showAdvancedFilters = ref(false);
const searchRadius = ref(20);
const sortBy = ref('distance');
const userLocation = ref(null);

let map = null;
let markers = {};
let userMarker = null;
let searchTimeout = null;

const serviceTypes = [
  { value: 'VIDANGE', label: 'Vidange', icon: '🛢️' },
  { value: 'REVISION', label: 'Révision', icon: '🔧' },
  { value: 'PNEUS', label: 'Pneus', icon: '🛞' },
  { value: 'DIAGNOSTIC', label: 'Diagnostic', icon: '🔍' },
  { value: 'FREINAGE', label: 'Freinage', icon: '🛑' },
  { value: 'CARROSSERIE', label: 'Carrosserie', icon: '🚗' },
];

// Icône personnalisée pour les garages
const garageIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #2563eb; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
    <span style="font-size: 18px;">🔧</span>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const garageIconHighlight = L.divIcon({
  className: 'custom-marker-highlight',
  html: `<div style="background-color: #dc2626; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.4); transform: scale(1.1);">
    <span style="font-size: 22px;">🔧</span>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44]
});

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchAddressSuggestions();
  }, 300);
};

const searchAddressSuggestions = async () => {
  if (searchAddress.value.length < 3) {
    addressSuggestions.value = [];
    return;
  }
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress.value)}&countrycodes=fr&limit=5`
    );
    addressSuggestions.value = await response.json();
  } catch (error) {
    console.error('Erreur recherche adresse:', error);
  }
};

const selectAddress = (suggestion) => {
  searchAddress.value = suggestion.display_name;
  addressSuggestions.value = [];
  userLocation.value = {
    lat: parseFloat(suggestion.lat),
    lng: parseFloat(suggestion.lon)
  };
  
  if (map && userLocation.value) {
    map.setView([userLocation.value.lat, userLocation.value.lng], 13);
    updateUserMarker();
  }
  
  searchGarages();
};

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        if (map) {
          map.setView([userLocation.value.lat, userLocation.value.lng], 13);
          updateUserMarker();
        }
        
        searchGarages();
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        alert('Impossible d\'obtenir votre position. Veuillez entrer une adresse.');
      }
    );
  }
};

const updateUserMarker = () => {
  if (userMarker) {
    map.removeLayer(userMarker);
  }
  
  if (userLocation.value) {
    userMarker = L.marker([userLocation.value.lat, userLocation.value.lng], { icon: userIcon })
      .bindPopup('<b>Votre position</b>')
      .addTo(map);
  }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const searchGarages = async () => {
  loading.value = true;
  
  try {
    const params = { page: page.value };
    if (filters.value.city) params.city = filters.value.city;
    if (filters.value.serviceType) params.serviceType = filters.value.serviceType;
    if (filters.value.maxPrice) params.maxPrice = filters.value.maxPrice;
    if (filters.value.available) params.available = 'true';

    const { data } = await api.get('/garages', { params });
    
    // Calculer la distance si on a la position utilisateur
    let garagesWithDistance = data.garages.map(garage => ({
      ...garage,
      distance: userLocation.value 
        ? calculateDistance(userLocation.value.lat, userLocation.value.lng, garage.latitude, garage.longitude)
        : null
    }));
    
    // Filtrer par rayon si position disponible
    if (userLocation.value) {
      garagesWithDistance = garagesWithDistance.filter(g => g.distance <= searchRadius.value);
    }
    
    garages.value = garagesWithDistance;
    totalPages.value = data.totalPages;
    totalGarages.value = data.total;
    
    sortGarages();
    updateMap();
  } catch (error) {
    console.error('Erreur recherche garages:', error);
  } finally {
    loading.value = false;
  }
};

const sortGarages = () => {
  if (sortBy.value === 'distance' && userLocation.value) {
    garages.value.sort((a, b) => (a.distance || 999) - (b.distance || 999));
  } else if (sortBy.value === 'name') {
    garages.value.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'services') {
    garages.value.sort((a, b) => (b.services?.length || 0) - (a.services?.length || 0));
  }
};

const updateMap = () => {
  // Supprimer les anciens markers
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};
  
  const bounds = [];
  
  garages.value.forEach(garage => {
    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${garage.name}</h3>
        <p style="color: #666; margin-bottom: 8px;">${garage.address}, ${garage.city}</p>
        <p style="color: #666; margin-bottom: 8px;">📞 ${garage.phone}</p>
        ${garage.distance ? `<p style="color: #2563eb; font-weight: 500;">📍 ${garage.distance.toFixed(1)} km</p>` : ''}
        <a href="/garages/${garage.id}" style="display: inline-block; margin-top: 8px; background: #2563eb; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 500;">
          Voir les créneaux
        </a>
      </div>
    `;
    
    const marker = L.marker([garage.latitude, garage.longitude], { icon: garageIcon })
      .bindPopup(popupContent)
      .addTo(map);
    
    markers[garage.id] = marker;
    bounds.push([garage.latitude, garage.longitude]);
  });

  // Ajouter la position utilisateur aux bounds
  if (userLocation.value) {
    bounds.push([userLocation.value.lat, userLocation.value.lng]);
    updateUserMarker();
  }

  // Ajuster la vue
  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }
};

const highlightMarker = (garageId) => {
  if (markers[garageId]) {
    markers[garageId].setIcon(garageIconHighlight);
    markers[garageId].openPopup();
  }
};

const unhighlightMarker = (garageId) => {
  if (markers[garageId]) {
    markers[garageId].setIcon(garageIcon);
  }
};

onMounted(async () => {
  // Initialiser la carte
  map = L.map('map').setView([46.603354, 1.888334], 6); // Centre de la France
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  
  await searchGarages();
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});
</script>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.custom-marker, .custom-marker-highlight, .user-marker {
  background: transparent;
  border: none;
}
</style>
