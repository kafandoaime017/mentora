// Helper partagé par les tests d'intégration : initialise/ferme la base SQLite
// en mémoire (voir data-source.ts, branche NODE_ENV==='test') autour de chaque
// fichier de test. Chaque fichier de test Jest a son propre registre de modules,
// donc son propre singleton AppDataSource et donc sa propre base isolée.
import AppDataSource from '../../src/config/data-source';

export const initTestDb = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};

export const closeTestDb = async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};

export default AppDataSource;
