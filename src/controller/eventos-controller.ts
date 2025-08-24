import Evento from "../models/Evento";
import Idoso from "../models//idoso";
import { Request, Response } from "express";
import driver from "../database/neo4j";

// Adiciona tipagem para req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        // Adicione outros campos conforme necessário
      };
    }
  }
}

type Params = { id: string };
type ParamsBusca = { texto: string };
type Paramentro = {
  nome: string;
  descricao?: string;
  dataHora?: Date;
  local: {
    type: "Point";
    coordinates: [number, number];
  };
};

// ---------------- GET todos os eventos ----------------
export async function getEventos(req: Request, res: Response) {
  try {
    const events = await Evento.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar eventos", error });
  }
}

// ---------------- GET busca por texto ----------------
export async function getBuscaSearch(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { texto } = req.params as ParamsBusca;
    const event = await Evento.find({ $text: { $search: texto } });
    if (event.length === 0) {
      res.status(404).json({ message: "Evento não encontrado" });
      return;
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar evento", error });
  }
}

// ---------------- POST criar evento ----------------
export async function postEvento(req: Request, res: Response) {
  const session = driver.session();
  try {
    const { nome, descricao, dataHora, local } = req.body as Paramentro;

    // 1. Cria no MongoDB
    const newEvent = (await Evento.create({
      nome,
      descricao,
      dataHora,
      local,
    })) as any; 
    

    // 2. Cria também no Neo4j
    await session.run(
      `CREATE (e:Evento {id: $id, nome: $nome, descricao: $descricao, dataHora: $dataHora})`,
      {
        id: newEvent._id.toString(),
        nome: newEvent.nome,
        descricao: newEvent.descricao || "",
        dataHora: newEvent.dataHora ? newEvent.dataHora.toISOString() : null
      }
    );

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar o evento", error });
  } finally {
    await session.close();
  }
}

// ---------------- PUT atualizar evento ----------------
export async function putEvento(req: Request, res: Response): Promise<void> {
  const session = driver.session();
  try {
    const { id } = req.params as Params;
    const event = await Evento.findByIdAndUpdate(id, req.body, { new: true });

    if (!event) {
      res.status(404).json({ message: "Evento não encontrado" });
      return;
    }

    // Atualiza no Neo4j
    await session.run(
      `MATCH (e:Evento {id: $id})
       SET e.nome = $nome, e.descricao = $descricao, e.dataHora = $dataHora, e.local = $local`,
      {
        id: event._id.toString(),
        nome: event.nome,
        descricao: event.descricao || "",
        dataHora: event.data ? event.data.toISOString() : null,
        local: JSON.stringify(event.local),
      }
    );

    res.status(200).json(event);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Falha ao atualizar", error: err });
  } finally {
    await session.close();
  }
}

// ---------------- DELETE evento ----------------
export async function delEvento(req: Request, res: Response): Promise<void> {
  const session = driver.session();
  try {
    const { id } = req.params as Params;
    const deleted = await Evento.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: "Evento não encontrado" });
      return;
    }

    // Deleta também no Neo4j
    await session.run(`MATCH (e:Evento {id: $id}) DETACH DELETE e`, {
      id,
    });

    res.json({ message: "Evento removido com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar evento", error });
  } finally {
    await session.close();
  }
}

// ---------------- Participar de evento ----------------
export const participarEvento = async (req: Request, res: Response) => {
  const { idEvento, idIdoso } = req.params;

  const session = driver.session();

  try {
    // Verifica se o idoso existe no Mongo
    const idoso = await Idoso.findById(idIdoso);
    if (!idoso) {
      return res.status(404).json({ message: "Idoso não encontrado no MongoDB" });
    }

    // Cria nó de idoso (caso ainda não exista) e relação no Neo4j
    await session.run(
      `
      MERGE (i:Idoso {id: $idIdoso, nome: $nome})
      MATCH (e:Evento {id: $idEvento})
      MERGE (i)-[:PARTICIPOU]->(e)
      RETURN i, e
      `,
      {
        idIdoso,
        nome: idoso.nome,
        idEvento,
      }
    );

    res.status(200).json({ message: "Idoso participou do evento com sucesso!" });
  } catch (error) {
    console.error("Erro ao participar do evento:", error);
    res.status(500).json({ message: "Erro ao participar do evento" });
  } finally {
    await session.close();
  }
};
