import { Request, Response } from "express";
import driver from "../database/neo4j";

// Participar de evento
export const participarEvento = async (req: Request, res: Response) => {
  const session = driver.session();
  const { idosoId, eventoId } = req.params;

  try {
    await session.run(
      `
      MATCH (i:Idoso {id: $idosoId}), (e:Evento {id: $eventoId})
      MERGE (i)-[:PARTICIPA]->(e)
      `,
      { idosoId, eventoId }
    );

    res.json({ message: "Participação registrada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar participação" });
  } finally {
    await session.close();
  }
};

// Sair de evento
export const sairEvento = async (req: Request, res: Response) => {
  const session = driver.session();
  const { idosoId, eventoId } = req.params;

  try {
    await session.run(
      `
      MATCH (i:Idoso {id: $idosoId})-[r:PARTICIPA]->(e:Evento {id: $eventoId})
      DELETE r
      `,
      { idosoId, eventoId }
    );

    res.json({ message: "Participação removida com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover participação" });
  } finally {
    await session.close();
  }
};
