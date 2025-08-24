import Evento from "../models/Evento"
import { Request, Response } from 'express';

type Params = {
    id: string
};

type ParamsBusca = {
    texto: string
};

type Paramentro = {
    nome: string;
    descricao?: string;
    dataHora?: Date;
    local: {
        type: 'Point';
        coordinates: [number, number]; 
    };
};

export async function getEventos(req: Request, res: Response) {
    try {
        const events = await Evento.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar eventos", error });
    }
}

export async function getBuscaSearch(req: Request, res: Response): Promise<void> {
    try {
        const { texto } = req.params as ParamsBusca;
        const event = await Evento.find({$text:{$search:texto}});
        if (event.length == 0) {
            res.status(404).json({ message: "Evento não encontrado" });
            return;
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar evento", error });
    }
}

export async function postEvento(req: Request, res: Response) {
    try {
        const { nome, descricao, dataHora, local } = req.body as Paramentro;
        const newEvent = await Evento.create({
            nome,
            descricao,
            dataHora,
            local
        });
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar o evento", error });
    }
}

export async function putEvento(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params as Params;
        const event = await Evento.findByIdAndUpdate(id);

        if (!event) {
            res.status(404).json({ message: "Evento não encontrado" });
            return;
        }

        event.set(req.body);
        await event.save();

        res.status(200).json(event);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: "Falha ao atualizar", error: err });
    }
}

export async function delEvento(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params as Params;
        const deleted = await Evento.findByIdAndDelete(id);

        if (!deleted) {
            res.status(404).json({ message: "Evento não encontrado" });
            return;
        }

        res.json({ message: "Evento removido com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar evento", error });
    }
}
