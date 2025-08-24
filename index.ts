import express from 'express';
import { conectarMongo } from './src/database/mongo';
import  eventsRouter from './src/router/eventos-router';
import routerIdoso from './src/router/idosoRoutes';
import cors from 'cors';
import dotenv from 'dotenv';
import { conectarNeo4j } from "./src/database/neo4j"

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/Eventos', eventsRouter, routerIdoso);

const conectar = async () => {
  try {
    await conectarMongo();
    await conectarNeo4j();

    app.listen(3000, () => {
      console.log("🚀 Servidor rodando na porta 3000");
    });
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
};

conectar();