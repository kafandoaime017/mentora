import AppDataSource from '../../config/data-source';
import { Ecole } from '../models/Ecole';
import { Filiere } from '../models/Filiere';
import { Classe } from '../models/Classe';

// GET /api/ref/ecoles?search=...
export const getEcoles = async (search?: string) => {
  const qb = AppDataSource.getRepository(Ecole)
    .createQueryBuilder('ecole')
    .select(['ecole.id', 'ecole.nom', 'ecole.ville', 'ecole.logo'])
    .where('ecole.isActive = :active', { active: true })
    .orderBy('ecole.nom', 'ASC');

  if (search?.trim()) {
    qb.andWhere('ecole.nom LIKE :search', { search: `%${search.trim()}%` });
  }

  return qb.getMany();
};

// GET /api/ref/ecoles/:ecoleId/filieres
export const getFilieresByEcole = async (ecoleId: number) => {
  return AppDataSource.getRepository(Filiere).find({
    where: { ecoleId, isActive: true },
    select: ['id', 'nom'],
    order: { nom: 'ASC' },
  });
};

// GET /api/ref/filieres/:filiereId/classes
export const getClassesByFiliere = async (filiereId: number) => {
  return AppDataSource.getRepository(Classe).find({
    where: { filiereId, isActive: true },
    select: ['id', 'nom'],
    order: { nom: 'ASC' },
  });
};