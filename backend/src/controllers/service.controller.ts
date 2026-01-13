import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const { type, name, description, price, duration } = req.body;
    
    const garage = await prisma.garage.findUnique({ where: { ownerId: req.user!.userId } });
    if (!garage) {
      return res.status(404).json({ error: 'Garage non trouvé' });
    }

    const service = await prisma.service.create({
      data: { garageId: garage.id, type, name, description, price, duration }
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: Number(req.params.id) },
      include: { garage: true }
    });

    if (!service || service.garage.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const updated = await prisma.service.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: Number(req.params.id) },
      include: { garage: true }
    });

    if (!service || service.garage.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await prisma.service.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
