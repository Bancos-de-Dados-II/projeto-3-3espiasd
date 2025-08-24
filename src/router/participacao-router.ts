import { Router } from "express";
import { participarEvento, sairEvento } from "../controller/participacao-controller";


const router = Router();


router.post("/:idosoId/participa/:eventoId", participarEvento);
router.delete("/:idosoId/participa/:eventoId", sairEvento);

export default router;
