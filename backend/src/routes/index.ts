import { Router } from "express";
import helloRoutes from "./hello";
import etudiantRoutes from "./etudiants/etudiants";

const router=Router();
router.use("/hello", helloRoutes);
router.use("/etudiants", etudiantRoutes);

export default router;  