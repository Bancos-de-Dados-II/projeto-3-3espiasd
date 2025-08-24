import express from 'express';
import { conectar } from './src/database/mongo';
import  eventsRouter from './src/router/eventos-router';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/Eventos', eventsRouter);

conectar();
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
