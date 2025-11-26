import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Request, Response } from "express";
import { PrismaClient, Prisma } from "../generated/prisma/client";
import serializeBigInt from "../utils/serializeBigInt";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "gabriel",
  password: "123",
  database: "clash_royale",
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

class CardController {
  public async getBestDecks(req: Request, res: Response) {
    try {
      const cartas = await prisma.$queryRaw<
        {
          id_carta: number;
          nome: string;
          custo_elixir: number;
          raridade: string;
          url_image: string;
        }[]
      >(Prisma.sql`
        SELECT *
        FROM carta;
      `);
      const serializedResult = JSON.parse(serializeBigInt(cartas));
      return res.json(serializedResult);
    } catch (err) {
      console.error("Erro getCards:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  public async getCardById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const idNum = Number(id);

      if (!Number.isInteger(idNum) || idNum <= 0) {
        return res.status(400).json({ error: "Parâmetro 'id' inválido" });
      }

      const result = await prisma.$queryRaw<
        {
          id_carta: number;
          nome: string;
          custo_elixir: number;
          raridade: string;
          url_image: string;
        }[]
      >(Prisma.sql`
        SELECT id_carta, nome, custo_elixir, raridade, url_image
        FROM carta
        WHERE id_carta = ${idNum}
        LIMIT 1;
      `);

      if (!result || result.length === 0) {
        return res.status(404).json({ error: "Carta não encontrada" });
      }

      const serialized = JSON.parse(serializeBigInt(result[0]));
      return res.json(serialized);
    } catch (err) {
      console.error("Erro getCardById:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}

export default new CardController();
