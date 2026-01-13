import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getGarages = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', city, serviceType, minPrice, maxPrice, available } = req.query;
    const limit = 20;
    const skip = (Number(page) - 1) * limit;

    const where: any = {};
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    
    if (serviceType || minPrice || maxPrice) {
      where.services = { some: {} };
      if (serviceType) where.services.some.type = serviceType;
      if (minPrice) where.services.some.price = { gte: Number(minPrice) };
      if (maxPrice) where.services.some.price = { ...where.services.some.price, lte: Number(maxPrice) };
    }

    if (available === 'true') {
      where.slots = { some: { isBooked: false, startTime: { gte: new Date() } } };
    }

    const [garages, total] = await Promise.all([
      prisma.garage.findMany({
        where,
        skip,
        take: limit,
        include: { services: true, _count: { select: { slots: { where: { isBooked: false } } } } }
      }),
      prisma.garage.count({ where })
    ]);

    res.json({ garages, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getGarageById = async (req: AuthRequest, res: Response) => {
  try {
    const garage = await prisma.garage.findUnique({
      where: { id: Number(req.params.id) },
      include: { services: true, owner: { select: { firstName: true, lastName: true, phone: true } } }
    });

    if (!garage) {
      return res.status(404).json({ error: 'Garage non trouvé' });
    }

    res.json(garage);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createGarage = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, address, city, postalCode, latitude, longitude, phone, email } = req.body;

    const existing = await prisma.garage.findUnique({ where: { ownerId: req.user!.userId } });
    if (existing) {
      return res.status(400).json({ error: 'Vous avez déjà un garage' });
    }

    const garage = await prisma.garage.create({
      data: { name, description, address, city, postalCode, latitude, longitude, phone, email, ownerId: req.user!.userId }
    });

    res.status(201).json(garage);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateGarage = async (req: AuthRequest, res: Response) => {
  try {
    const garage = await prisma.garage.findUnique({ where: { id: Number(req.params.id) } });
    
    if (!garage || garage.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const updated = await prisma.garage.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getMyGarage = async (req: AuthRequest, res: Response) => {
  try {
    const garage = await prisma.garage.findUnique({
      where: { ownerId: req.user!.userId },
      include: { services: true }
    });

    if (!garage) {
      return res.status(404).json({ error: 'Aucun garage trouvé' });
    }

    res.json(garage);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getGarageStats = async (req: AuthRequest, res: Response) => {
  try {
    const garage = await prisma.garage.findUnique({ where: { ownerId: req.user!.userId } });
    
    if (!garage) {
      return res.status(404).json({ error: 'Garage non trouvé' });
    }

    const [totalBookings, completedBookings, revenue] = await Promise.all([
      prisma.booking.count({ where: { garageId: garage.id } }),
      prisma.booking.count({ where: { garageId: garage.id, status: 'COMPLETED' } }),
      prisma.booking.findMany({
        where: { garageId: garage.id, status: 'COMPLETED' },
        include: { service: true }
      })
    ]);

    const totalRevenue = revenue.reduce((sum, b) => sum + b.service.price, 0);

    res.json({ totalBookings, completedBookings, totalRevenue });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
