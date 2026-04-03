import { Router } from "express";
import { EtudiantController } from "../../app/controllers/etudiants/EtudiantController";

const router = Router();
router.get("/", EtudiantController.getAll);

export default router;