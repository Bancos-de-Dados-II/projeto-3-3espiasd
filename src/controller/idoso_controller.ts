import { Request, Response } from "express";
import Idoso from "../models/idoso";

type Params = {
  id: string
};

type Paramentro = {
  nome: string;
  cpf: string;
  rg: string;
  sus: string;
  data_nascimento: Date;
  sexo: string;
  nacionalidade: string;
  naturalidade: string;
};

export async function createIdoso(req: Request, res: Response) {
  try {
    const { nome, cpf, rg, sus, data_nascimento, sexo, nacionalidade, naturalidade } = req.body as Paramentro;

    const cpfExists = await Idoso.findOne({ cpf });
    if (cpfExists) {
      res.status(400).json({ message: "CPF já está cadastrado" });
      return;
    }

    const rgExists = await Idoso.findOne({ rg });
    if (rgExists) {
      res.status(400).json({ message: "RG já está cadastrado" });
      return;
    }

    const susExists = await Idoso.findOne({ sus });
    if (susExists) {
      res.status(400).json({ message: "SUS já está cadastrado" });
      return;

    }

    const newIdoso = await Idoso.create({
      nome,
      cpf,
      rg,
      sus,
      data_nascimento,
      sexo,
      nacionalidade,
      naturalidade
    });

    res.status(201).json({ message: "Idoso cadastrado com sucesso", newIdoso });

  } catch (error) {
    return res.status(500).json({ message: "Erro ao cadastrar idoso", error });
  }
};

export async function getIdosos(req: Request, res: Response) {
  try {
    const idosos = await Idoso.find();
    if (!idosos || idosos.length === 0) {
      return res.status(404).json({ message: "Nenhum idoso encontrado" });
    }
    res.status(200).json(idosos);

  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar idosos", error });
  }
};

export async function getIdosoById(req: Request, res: Response) {
  try {
    const { id } = req.params as Params;
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

export async function putIdoso(req: Request, res: Response) {
  try {
    const { id } = req.params as Params;
    const idoso = await Idoso.findById(id);

    if (!idoso) {
      res.status(404).json({ message: "Idoso não encontrado" });
      return;
    }

    idoso.set(req.body);
    await idoso.save();

    res.status(200).json(idoso);

  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar idoso", error });
  }
};

export async function delIdoso(req: Request, res: Response) {
  try {
    const { id } = req.params as Params;
    const idosoDeleted = await Idoso.findByIdAndDelete(id);

    if (!idosoDeleted) {
      res.status(404).json({ message: "Idoso não encontrado" });
      return;
    }

    res.status(200).json({ message: "Idoso deletado com sucesso" });

  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar idoso", error });
  }
};