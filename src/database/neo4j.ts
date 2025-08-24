import neo4j from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.NEO4J_URI || !process.env.NEO4J_USER || !process.env.NEO4J_PASSWORD) {
  throw new Error("NEO4J_URI, NEO4J_USER ou NEO4J_PASSWORD não definidos no .env");
}

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

export const conectarNeo4j = async () => {
  try {
    const session = driver.session();
    const result = await session.run("RETURN 'Conectado ao Neo4j!' AS msg");
    console.log("conectado", result.records[0].get("msg"));
    await session.close();
  } catch (error) {
    console.error("Erro ao conectar ao Neo4j:", error);
  }
};

export default driver;

