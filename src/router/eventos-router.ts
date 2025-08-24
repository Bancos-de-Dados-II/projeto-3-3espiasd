import  {Router} from "express";
import { getEventos, getBuscaSearch, postEvento, putEvento, delEvento } from "../controller/eventos-controller"

const eventsRouter = Router();

eventsRouter.get("/", getEventos);
eventsRouter.get("/search/:texto", getBuscaSearch);
eventsRouter.post("/", postEvento);
eventsRouter.put("/:id", putEvento);
eventsRouter.delete("/:id", delEvento);

export default eventsRouter;