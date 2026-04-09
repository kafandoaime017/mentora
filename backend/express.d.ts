import { Multer } from 'multer';
import { User } from '../models/User';  // Ajoutez cette ligne

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: Multer.File[];
      user?: User;  // Ajoutez cette ligne
    }
  }
}