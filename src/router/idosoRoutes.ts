import { Router } from "express";
import { createIdoso, getIdosos, getIdosoById, putIdoso, delIdoso } from "../controller/idoso_controller";


const routerIdoso = Router();

routerIdoso.post('/cadastrarIdoso', createIdoso);
routerIdoso.get('/idosos', getIdosos);
routerIdoso.get('/idoso/:id', getIdosoById);
routerIdoso.put('/idoso/:id', putIdoso);
routerIdoso.delete('/idoso/:id', delIdoso);

export default routerIdoso;