// src/controllers/EtudiantController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../../../config/data-source"; // ton fichier de config TypeORM
import { Etudiant } from "../../models/Etudiant";

export class EtudiantController {
    // Méthode pour récupérer tous les étudiants
    static async getAll(req: Request, res: Response) {
        try {
            const etudiantRepo = AppDataSource.getRepository(Etudiant);
            const etudiants = await etudiantRepo.find(); // SELECT * FROM etudiants
            res.json(etudiants);
        } catch (error) {
            console.error("Erreur lors de la récupération des étudiants:", error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
}