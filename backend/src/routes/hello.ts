import { Router } from "express";


const router= Router();
import { sayHello } from "../app/controllers/HelloController";

router.get("/", sayHello);
export default router;