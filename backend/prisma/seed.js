const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Nettoyer la base
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.service.deleteMany();
  await prisma.garage.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Créer des utilisateurs
  const user1 = await prisma.user.create({
    data: {
      email: 'user@test.com',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0612345678',
      role: 'USER'
    }
  });

  const pro1 = await prisma.user.create({
    data: {
      email: 'garage1@test.com',
      password: hashedPassword,
      firstName: 'Pierre',
      lastName: 'Martin',
      phone: '0623456789',
      role: 'PROFESSIONAL'
    }
  });

  const pro2 = await prisma.user.create({
    data: {
      email: 'garage2@test.com',
      password: hashedPassword,
      firstName: 'Marie',
      lastName: 'Dubois',
      phone: '0634567890',
      role: 'PROFESSIONAL'
    }
  });

  // Créer des garages
  const garage1 = await prisma.garage.create({
    data: {
      name: 'Garage Auto Plus',
      description: 'Spécialiste toutes marques, 20 ans d\'expérience',
      address: '15 Rue de la République',
      city: 'Paris',
      postalCode: '75001',
      latitude: 48.8566,
      longitude: 2.3522,
      phone: '0145678901',
      email: 'contact@autoplus.fr',
      ownerId: pro1.id
    }
  });

  const garage2 = await prisma.garage.create({
    data: {
      name: 'Garage Speedy',
      description: 'Réparation rapide et efficace',
      address: '42 Avenue des Champs',
      city: 'Lyon',
      postalCode: '69001',
      latitude: 45.7640,
      longitude: 4.8357,
      phone: '0478901234',
      email: 'contact@speedy.fr',
      ownerId: pro2.id
    }
  });

  // Créer des services
  await prisma.service.createMany({
    data: [
      { garageId: garage1.id, type: 'VIDANGE', name: 'Vidange complète', price: 80, duration: 60 },
      { garageId: garage1.id, type: 'REVISION', name: 'Révision 15000 km', price: 150, duration: 120 },
      { garageId: garage1.id, type: 'PNEUS', name: 'Changement 4 pneus', price: 300, duration: 90 },
      { garageId: garage1.id, type: 'DIAGNOSTIC', name: 'Diagnostic électronique', price: 50, duration: 45 },
      { garageId: garage2.id, type: 'VIDANGE', name: 'Vidange express', price: 70, duration: 45 },
      { garageId: garage2.id, type: 'FREINAGE', name: 'Changement plaquettes', price: 120, duration: 90 },
      { garageId: garage2.id, type: 'CLIMATISATION', name: 'Recharge clim', price: 60, duration: 30 }
    ]
  });

  // Créer des créneaux
  const today = new Date();
  const slots = [];
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 9; hour < 18; hour++) {
      const startTime = new Date(today);
      startTime.setDate(today.getDate() + day);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(hour + 1);
      
      slots.push(
        { garageId: garage1.id, startTime, endTime, isBooked: false },
        { garageId: garage2.id, startTime, endTime, isBooked: false }
      );
    }
  }

  await prisma.slot.createMany({ data: slots });

  console.log('✅ Base de données peuplée avec succès');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
