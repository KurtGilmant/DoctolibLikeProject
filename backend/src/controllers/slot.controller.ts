import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getSlots = async (req: AuthRequest, res: Response) => {
  try {
    const { garageId, date } = req.query;
    
    if (!garageId) {
      return res.status(400).json({ error: 'garageId requis' });
    }

    const where: any = { garageId: Number(garageId), isBooked: false };
    
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.startTime = { gte: startDate, lt: endDate };
    } else {
      where.startTime = { gte: new Date() };
    }

    const slots = await prisma.slot.findMany({ where, orderBy: { startTime: 'asc' } });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createSlot = async (req: AuthRequest, res: Response) => {
  try {
    const { startTime, endTime } = req.body;
    
    const garage = await prisma.garage.findUnique({ where: { ownerId: req.user!.userId } });
    if (!garage) {
      return res.status(404).json({ error: 'Garage non trouvé' });
    }

    const slot = await prisma.slot.create({
      data: { garageId: garage.id, startTime: new Date(startTime), endTime: new Date(endTime) }
    });

    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteSlot = async (req: AuthRequest, res: Response) => {
  try {
    const slot = await prisma.slot.findUnique({
      where: { id: Number(req.params.id) },
      include: { garage: true }
    });

    if (!slot || slot.garage.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ error: 'Créneau déjà réservé' });
    }

    await prisma.slot.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
