import { Router } from "express";
import { createIdoso, getIdosos, getIdosoById, putIdoso, delIdoso } from "../controller/idoso_controller";


const routerIdoso = Router();

routerIdoso.post('/cadastrarIdoso', createIdoso);
routerIdoso.get('/', getIdosos);
routerIdoso.get('/:id', getIdosoById);
routerIdoso.put('/:id', putIdoso);
routerIdoso.delete('/:id', delIdoso);

export default routerIdoso;