# 🚗 Garage Booking - Plateforme de prise de rendez-vous

Application web de réservation de créneaux pour garages automobiles, similaire à Doctolib.

## 📋 Description

Cette plateforme permet aux utilisateurs de :
- Rechercher des garages par localisation
- Filtrer par type de prestation, prix, disponibilité
- Réserver des créneaux pour différentes prestations (vidange, révision, pneus, etc.)
- Gérer leurs rendez-vous (à venir, passés, annulation)

Les professionnels peuvent :
- Gérer leurs créneaux de disponibilité
- Consulter leurs rendez-vous
- Configurer leurs services et tarifs
- Accéder à des statistiques

## 🛠️ Stack technique

### Frontend
- **Vue.js 3** (Composition API)
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet** - Carte interactive
- **Pinia** - State management
- **Axios** - HTTP client

### Backend
- **Node.js + Express**
- **TypeScript**
- **Prisma** - ORM
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **Jest** - Tests (100% coverage backend)

### DevOps
- **Docker** - Conteneurisation (3 conteneurs : frontend, backend, db)
- **Docker Compose** - Orchestration

## 🚀 Installation et lancement

### Prérequis
- Docker et Docker Compose installés
- Node.js 18+ (pour développement local)

> ⚠️ **Note de sécurité** : Les credentials dans `docker-compose.yml` sont des valeurs par défaut pour le développement local uniquement. En production, utilisez des variables d'environnement sécurisées.

### Lancement avec Docker

```bash
# Cloner le repository
git clone <votre-repo>
cd DoctolibLikeProject

# Lancer tous les services
docker-compose up --build

# L'application sera accessible sur :
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3000
# - Base de données: localhost:5432
```

### Développement local (sans Docker)

#### Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Tests

```bash
cd backend
npm test                 # Lancer tous les tests
npm run test:watch      # Mode watch
npm run test:coverage   # Avec coverage
```

## 📊 Diagramme de base de données

Voir [database-diagram.png](./database-diagram.png)

## 🎯 Fonctionnalités

### ✅ Fonctionnalités principales
- [x] Recherche de garages avec carte interactive
- [x] Filtres : localisation, type de prestation, prix, disponibilité
- [x] Authentification utilisateur et professionnel
- [x] Réservation de créneaux
- [x] Gestion des rendez-vous (à venir, passés, annulation)
- [x] Espace professionnel avec gestion des créneaux
- [x] Configuration des services et tarifs
- [x] Statistiques pour professionnels
- [x] Pagination (max 20 éléments)

### 🎁 Fonctionnalités bonus
- [ ] Notifications email
- [ ] Système de notes et avis
- [ ] Gestion multi-services par garage

## 📁 Structure du projet

```
DoctolibLikeProject/
├── backend/              # API Express + TypeScript
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── package.json
├── frontend/             # Vue.js 3 + Vite
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── database-diagram.png
└── README.md
```

## 👥 Auteur

[Votre nom]

## 📝 Licence

MIT
