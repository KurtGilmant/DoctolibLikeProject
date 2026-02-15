<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Dashboard Professionnel</h1>

    <!-- Formulaire de création de garage si pas de garage -->
    <div v-if="!garage && !loading" class="bg-white rounded-lg shadow p-8 mb-8">
      <div class="text-center mb-6">
        <div class="text-6xl mb-4">🏪</div>
        <h2 class="text-2xl font-bold mb-2">Bienvenue sur votre espace professionnel !</h2>
        <p class="text-gray-600">Pour commencer, créez votre garage en remplissant les informations ci-dessous.</p>
      </div>
      
      <form @submit.prevent="createGarage" class="max-w-2xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-gray-700 mb-2">Nom du garage *</label>
            <input v-model="garageForm.name" required class="w-full border rounded px-4 py-2" placeholder="Ex: Garage Auto Plus">
          </div>
          <div class="md:col-span-2">
            <label class="block text-gray-700 mb-2">Description</label>
            <textarea v-model="garageForm.description" class="w-full border rounded px-4 py-2" rows="3" placeholder="Décrivez votre garage et vos spécialités..."></textarea>
          </div>
          <div class="md:col-span-2">
            <label class="block text-gray-700 mb-2">Adresse *</label>
            <input 
              v-model="garageForm.address" 
              @input="debounceAddressSearch"
              required 
              class="w-full border rounded px-4 py-2" 
              placeholder="Entrez l'adresse de votre garage"
            >
            <!-- Suggestions d'adresse -->
            <div v-if="addressSuggestions.length > 0" class="relative">
              <div class="absolute z-50 bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto w-full">
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
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Ville *</label>
            <input v-model="garageForm.city" required class="w-full border rounded px-4 py-2" placeholder="Paris">
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Code postal *</label>
            <input v-model="garageForm.postalCode" required class="w-full border rounded px-4 py-2" placeholder="75001">
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Téléphone *</label>
            <input v-model="garageForm.phone" required class="w-full border rounded px-4 py-2" placeholder="01 23 45 67 89">
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Email du garage *</label>
            <input v-model="garageForm.email" type="email" required class="w-full border rounded px-4 py-2" placeholder="contact@mongarage.fr">
          </div>
        </div>
        
        <!-- Carte pour visualiser la position -->
        <div v-if="garageForm.latitude && garageForm.longitude" class="mt-4">
          <label class="block text-gray-700 mb-2">📍 Position sur la carte</label>
          <div id="garage-map" class="h-48 rounded-lg border"></div>
          <p class="text-sm text-gray-500 mt-1">Coordonnées : {{ garageForm.latitude.toFixed(4) }}, {{ garageForm.longitude.toFixed(4) }}</p>
        </div>

        <p v-if="garageError" class="text-red-500 mt-4">{{ garageError }}</p>
        
        <button type="submit" :disabled="creatingGarage" class="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
          {{ creatingGarage ? 'Création en cours...' : '🚀 Créer mon garage' }}
        </button>
      </form>
    </div>

    <!-- Contenu du dashboard si garage existe -->
    <template v-if="garage">
      <!-- Info garage -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold">{{ garage.name }}</h2>
            <p class="text-gray-600">📍 {{ garage.address }}, {{ garage.city }} {{ garage.postalCode }}</p>
            <p class="text-gray-600">📞 {{ garage.phone }} | ✉️ {{ garage.email }}</p>
          </div>
          <button @click="showEditGarage = !showEditGarage" class="text-blue-600 hover:text-blue-800">
            ✏️ Modifier
          </button>
        </div>
      </div>

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
        <div v-if="bookings.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
          <div class="text-4xl mb-4">📅</div>
          <p class="text-gray-500">Aucune réservation pour le moment</p>
        </div>
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
                <option value="CLIMATISATION">Climatisation</option>
                <option value="AUTRE">Autre</option>
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

        <div v-if="services.length === 0 && !showServiceForm" class="bg-white rounded-lg shadow p-8 text-center">
          <div class="text-4xl mb-4">🔧</div>
          <p class="text-gray-500">Aucun service configuré. Ajoutez vos premiers services !</p>
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
        
        <!-- Génération de créneaux en masse -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-bold mb-4">Générer des créneaux automatiquement</h3>
          <form @submit.prevent="generateSlots">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-gray-700 mb-2">Date de début</label>
                <input v-model="bulkSlotForm.startDate" type="date" required class="w-full border rounded px-4 py-2">
              </div>
              <div>
                <label class="block text-gray-700 mb-2">Date de fin</label>
                <input v-model="bulkSlotForm.endDate" type="date" required class="w-full border rounded px-4 py-2">
              </div>
              <div>
                <label class="block text-gray-700 mb-2">Heure début journée</label>
                <input v-model="bulkSlotForm.dayStartTime" type="time" required class="w-full border rounded px-4 py-2">
              </div>
              <div>
                <label class="block text-gray-700 mb-2">Heure fin journée</label>
                <input v-model="bulkSlotForm.dayEndTime" type="time" required class="w-full border rounded px-4 py-2">
              </div>
              <div>
                <label class="block text-gray-700 mb-2">Durée créneau (min)</label>
                <input v-model="bulkSlotForm.slotDuration" type="number" required class="w-full border rounded px-4 py-2" min="15" step="15">
              </div>
            </div>
            <button type="submit" class="mt-4 bg-green-600 text-white px-6 py-2 rounded">Générer les créneaux</button>
          </form>
        </div>
      </div>
    </template>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-500 mt-4">Chargement...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import api from '../services/api';
import L from 'leaflet';

const tab = ref('bookings');
const loading = ref(true);
const garage = ref(null);
const stats = ref(null);
const bookings = ref([]);
const services = ref([]);
const page = ref(1);
const totalPages = ref(1);
const showServiceForm = ref(false);
const showEditGarage = ref(false);
const serviceForm = ref({ type: 'VIDANGE', name: '', price: '', duration: '' });
const slotForm = ref({ date: '', startTime: '', endTime: '' });
const bulkSlotForm = ref({ 
  startDate: '', 
  endDate: '', 
  dayStartTime: '09:00', 
  dayEndTime: '18:00', 
  slotDuration: 60 
});

// Formulaire de création de garage
const garageForm = ref({
  name: '',
  description: '',
  address: '',
  city: '',
  postalCode: '',
  latitude: null,
  longitude: null,
  phone: '',
  email: ''
});
const garageError = ref('');
const creatingGarage = ref(false);
const addressSuggestions = ref([]);
let addressSearchTimeout = null;
let garageMap = null;
let garageMarker = null;

const debounceAddressSearch = () => {
  if (addressSearchTimeout) clearTimeout(addressSearchTimeout);
  addressSearchTimeout = setTimeout(() => {
    searchAddress();
  }, 300);
};

const searchAddress = async () => {
  if (garageForm.value.address.length < 3) {
    addressSuggestions.value = [];
    return;
  }
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(garageForm.value.address)}&countrycodes=fr&limit=5`
    );
    addressSuggestions.value = await response.json();
  } catch (error) {
    console.error('Erreur recherche adresse:', error);
  }
};

const selectAddress = async (suggestion) => {
  garageForm.value.address = suggestion.display_name.split(',')[0];
  garageForm.value.latitude = parseFloat(suggestion.lat);
  garageForm.value.longitude = parseFloat(suggestion.lon);
  addressSuggestions.value = [];
  
  // Extraire ville et code postal
  const addressParts = suggestion.display_name.split(',');
  if (addressParts.length >= 2) {
    // Chercher le code postal et la ville dans les parties de l'adresse
    const postalMatch = suggestion.display_name.match(/\d{5}/);
    if (postalMatch) {
      garageForm.value.postalCode = postalMatch[0];
    }
    // La ville est généralement avant le code postal
    for (const part of addressParts) {
      const trimmed = part.trim();
      if (trimmed && !trimmed.match(/^\d/) && trimmed.length > 2 && trimmed !== 'France') {
        garageForm.value.city = trimmed;
        break;
      }
    }
  }
  
  // Afficher la carte
  await nextTick();
  initGarageMap();
};

const initGarageMap = () => {
  if (!garageForm.value.latitude || !garageForm.value.longitude) return;
  
  if (garageMap) {
    garageMap.remove();
  }
  
  const mapElement = document.getElementById('garage-map');
  if (!mapElement) return;
  
  garageMap = L.map('garage-map').setView([garageForm.value.latitude, garageForm.value.longitude], 15);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(garageMap);
  
  garageMarker = L.marker([garageForm.value.latitude, garageForm.value.longitude]).addTo(garageMap);
};

const createGarage = async () => {
  if (!garageForm.value.latitude || !garageForm.value.longitude) {
    garageError.value = 'Veuillez sélectionner une adresse valide depuis les suggestions';
    return;
  }
  
  creatingGarage.value = true;
  garageError.value = '';
  
  try {
    const { data } = await api.post('/garages', {
      name: garageForm.value.name,
      description: garageForm.value.description,
      address: garageForm.value.address,
      city: garageForm.value.city,
      postalCode: garageForm.value.postalCode,
      latitude: garageForm.value.latitude,
      longitude: garageForm.value.longitude,
      phone: garageForm.value.phone,
      email: garageForm.value.email
    });
    
    garage.value = data;
    await loadStats();
  } catch (e) {
    garageError.value = e.response?.data?.error || 'Erreur lors de la création du garage';
  } finally {
    creatingGarage.value = false;
  }
};

const loadGarage = async () => {
  try {
    const { data } = await api.get('/garages/my');
    garage.value = data;
    services.value = data.services || [];
  } catch (e) {
    if (e.response?.status === 404) {
      garage.value = null;
    } else {
      console.error('Erreur chargement garage:', e);
    }
  }
};

const loadStats = async () => {
  try {
    const { data } = await api.get('/garages/stats');
    stats.value = data;
  } catch (e) {
    console.error('Erreur chargement stats:', e);
  }
};

const loadBookings = async () => {
  try {
    const { data } = await api.get('/bookings/garage', { params: { page: page.value } });
    bookings.value = data.bookings;
    totalPages.value = data.totalPages;
  } catch (e) {
    console.error('Erreur chargement réservations:', e);
  }
};

const loadServices = async () => {
  if (!garage.value) return;
  try {
    const { data } = await api.get('/garages/my');
    services.value = data.services || [];
  } catch (e) {
    console.error('Erreur chargement services:', e);
  }
};

const createService = async () => {
  try {
    await api.post('/services', serviceForm.value);
    showServiceForm.value = false;
    serviceForm.value = { type: 'VIDANGE', name: '', price: '', duration: '' };
    await loadServices();
  } catch (e) {
    alert('Erreur lors de la création du service');
  }
};

const deleteService = async (id) => {
  if (!confirm('Supprimer ce service ?')) return;
  try {
    await api.delete(`/services/${id}`);
    await loadServices();
  } catch (e) {
    alert('Erreur lors de la suppression');
  }
};

const createSlot = async () => {
  try {
    const startTime = new Date(`${slotForm.value.date}T${slotForm.value.startTime}`);
    const endTime = new Date(`${slotForm.value.date}T${slotForm.value.endTime}`);
    
    await api.post('/slots', {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
    
    slotForm.value = { date: '', startTime: '', endTime: '' };
    alert('Créneau créé !');
  } catch (e) {
    alert('Erreur lors de la création du créneau');
  }
};

const generateSlots = async () => {
  try {
    const { startDate, endDate, dayStartTime, dayEndTime, slotDuration } = bulkSlotForm.value;
    
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    
    while (currentDate <= end) {
      // Ignorer les dimanches (0 = dimanche)
      if (currentDate.getDay() !== 0) {
        const [startHour, startMin] = dayStartTime.split(':').map(Number);
        const [endHour, endMin] = dayEndTime.split(':').map(Number);
        
        let currentTime = new Date(currentDate);
        currentTime.setHours(startHour, startMin, 0, 0);
        
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(endHour, endMin, 0, 0);
        
        while (currentTime < dayEnd) {
          const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
          
          if (slotEnd <= dayEnd) {
            await api.post('/slots', {
              startTime: currentTime.toISOString(),
              endTime: slotEnd.toISOString()
            });
            count++;
          }
          
          currentTime = slotEnd;
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    alert(`${count} créneaux créés avec succès !`);
    bulkSlotForm.value = { startDate: '', endDate: '', dayStartTime: '09:00', dayEndTime: '18:00', slotDuration: 60 };
  } catch (e) {
    alert('Erreur lors de la génération des créneaux');
  }
};

const updateStatus = async (id, status) => {
  try {
    await api.patch(`/bookings/${id}/status`, { status });
  } catch (e) {
    alert('Erreur lors de la mise à jour');
  }
};

const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');
const formatTime = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

onMounted(async () => {
  loading.value = true;
  await loadGarage();
  
  if (garage.value) {
    await Promise.all([loadStats(), loadBookings()]);
  }
  
  loading.value = false;
});

onUnmounted(() => {
  if (garageMap) {
    garageMap.remove();
  }
});
</script>
