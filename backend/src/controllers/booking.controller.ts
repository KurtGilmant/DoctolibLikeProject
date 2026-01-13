import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { garageId, serviceId, slotId, notes } = req.body;

    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot || slot.isBooked) {
      return res.status(400).json({ error: 'Créneau non disponible' });
    }

    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: { userId: req.user!.userId, garageId, serviceId, slotId, notes },
        include: { garage: true, service: true, slot: true }
      }),
      prisma.slot.update({ where: { id: slotId }, data: { isBooked: true } })
    ]);

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', status } = req.query;
    const limit = 20;
    const skip = (Number(page) - 1) * limit;

    const where: any = { userId: req.user!.userId };
    if (status) where.status = status;

    const now = new Date();
    const isPast = req.path.includes('past');
    
    if (isPast) {
      where.slot = { endTime: { lt: now } };
    } else {
      where.slot = { startTime: { gte: now } };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: { garage: true, service: true, slot: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({ bookings, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getGarageBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1' } = req.query;
    const limit = 20;
    const skip = (Number(page) - 1) * limit;

    const garage = await prisma.garage.findUnique({ where: { ownerId: req.user!.userId } });
    if (!garage) {
      return res.status(404).json({ error: 'Garage non trouvé' });
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { garageId: garage.id },
        skip,
        take: limit,
        include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } }, service: true, slot: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where: { garageId: garage.id } })
    ]);

    res.json({ bookings, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: { slot: true }
    });

    if (!booking || booking.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Réservation déjà annulée' });
    }

    await prisma.$transaction([
      prisma.booking.update({ where: { id: Number(req.params.id) }, data: { status: 'CANCELLED' } }),
      prisma.slot.update({ where: { id: booking.slotId }, data: { isBooked: false } })
    ]);

    res.json({ message: 'Réservation annulée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: { garage: true }
    });

    if (!booking || booking.garage.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const updated = await prisma.booking.update({
      where: { id: Number(req.params.id) },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
