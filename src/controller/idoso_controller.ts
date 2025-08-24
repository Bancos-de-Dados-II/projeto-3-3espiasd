import { Request, Response } from "express";
import Idoso from "../models/idoso";
import driver from "../database/neo4j";

// Criar um idoso
export const createIdoso = async (req: Request, res: Response) => {
  try {
    // 1. Cria no MongoDB
    const idoso = new Idoso(req.body);
    await idoso.save();

    // 2. Cria no Neo4j
    const session = driver.session();
    await session.run(
      `
      CREATE (i:Idoso {
        id: $id,
        nome: $nome,
        cpf: $cpf,
        rg: $rg,
        sus: $sus,
        data_nascimento: $data_nascimento,
        sexo: $sexo,
        nacionalidade: $nacionalidade,
        naturalidade: $naturalidade
      })
      `,
      {
        id: idoso._id.toString(),
        nome: idoso.nome,
        cpf: idoso.cpf,
        rg: idoso.rg,
        sus: idoso.sus,
        data_nascimento: idoso.data_nascimento.toISOString(),
        sexo: idoso.sexo,
        nacionalidade: idoso.nacionalidade,
        naturalidade: idoso.naturalidade
      }
    );
    await session.close();

    res.status(201).json(idoso);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar idoso", error });
  }
};

// Get todos os idosos
export const getIdosos = async (req: Request, res: Response) => {
  try {
    const idosos = await Idoso.find();
    res.status(200).json(idosos);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar idosos", error });
  }
};


export async function getIdosoById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idoso = await Idoso.findById(id);

    if (!idoso) {
      res.status(404).json({ message: "Idoso não encontrado" });
      return;
    }

    res.status(200).json(idoso);

  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar idoso", error });
  }
}; 


// Atualizar idoso
export const putIdoso = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    nome,
    cpf,
    rg,
    sus,
    data_nascimento,
    sexo,
    nacionalidade,
    naturalidade
  } = req.body;

  const session = driver.session();

  try {
    // Atualiza no MongoDB
    const idosoAtualizado = await Idoso.findByIdAndUpdate(
      id,
      { nome, cpf, rg, sus, data_nascimento, sexo, nacionalidade, naturalidade },
      { new: true }
    );

    if (!idosoAtualizado) {
      return res.status(404).json({ message: "Idoso não encontrado" });
    }

    // Atualiza no Neo4j
    await session.run(
      `
      MATCH (i:Idoso {id: $id})
      SET i.nome = $nome,
          i.cpf = $cpf,
          i.rg = $rg,
          i.sus = $sus,
          i.data_nascimento = $data_nascimento,
          i.sexo = $sexo,
          i.nacionalidade = $nacionalidade,
          i.naturalidade = $naturalidade
      RETURN i
      `,
      {
        id: idosoAtualizado._id.toString(),
        nome: idosoAtualizado.nome,
        cpf: idosoAtualizado.cpf,
        rg: idosoAtualizado.rg,
        sus: idosoAtualizado.sus,
        data_nascimento: idosoAtualizado.data_nascimento.toISOString(),
        sexo: idosoAtualizado.sexo,
        nacionalidade: idosoAtualizado.nacionalidade,
        naturalidade: idosoAtualizado.naturalidade
      }
    );

    res.status(200).json(idosoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar idoso:", error);
    res.status(500).json({ message: "Erro interno ao atualizar idoso" });
  } finally {
    await session.close();
  }
};

// Deletar idoso
export const delIdoso = async (req: Request, res: Response) => {
  const session = driver.session();

  try {
    const { id } = req.params;

    // 1. Deletar no MongoDB
    const deletedIdoso = await Idoso.findByIdAndDelete(id);
    if (!deletedIdoso) {
      return res.status(404).json({ message: "Idoso não encontrado" });
    }

    // 2. Deletar no Neo4j
    await session.run(
      `MATCH (i:Idoso {id: $id}) DETACH DELETE i`,
      { id: deletedIdoso._id.toString() }
    );

    res.status(200).json({ message: "Idoso deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar idoso", error });
  } finally {
    await session.close();
  }
};
