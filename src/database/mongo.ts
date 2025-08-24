import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const conectarMongo = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL is not defined in the environment variables');
  }
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
};
