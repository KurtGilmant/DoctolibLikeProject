import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import GarageDetail from '../views/GarageDetail.vue';
import Bookings from '../views/Bookings.vue';
import ProDashboard from '../views/ProDashboard.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/garages/:id', component: GarageDetail },
  { path: '/bookings', component: Bookings, meta: { requiresAuth: true } },
  { path: '/pro/dashboard', component: ProDashboard, meta: { requiresAuth: true, requiresPro: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresPro && !authStore.isProfessional) {
    next('/');
  } else {
    next();
  }
});

export default router;
