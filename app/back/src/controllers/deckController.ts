import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma/client";
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

class DeckController {
  public async getBestDecks(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit) || 10;
      const offset = Number(req.query.offset) || 0;

      /* console.log("oi");
      const result = await prisma.$queryRaw<
        {
          id_carta: number;
          nome: string;
        }[]
      >`SELECT * FROM carta;`; */

      const result = await prisma.$queryRaw<
        {
          id_deck: number;
          total_partidas: number;
          vitorias: number;
          derrotas: number;
          taxa_vitoria: number;
        }[]
      >`
      SELECT 
          d.id_deck,
          COUNT(*) AS total_partidas,
          SUM(CASE WHEN b.id_deck_vencedor = d.id_deck THEN 1 ELSE 0 END) AS vitorias,
          SUM(CASE WHEN b.id_deck_perdedor = d.id_deck THEN 1 ELSE 0 END) AS derrotas,
          SUM(CASE WHEN b.id_deck_vencedor = d.id_deck THEN 1 ELSE 0 END) / COUNT(*) AS taxa_vitoria
      FROM deck d
      JOIN batalha b 
          ON b.id_deck_vencedor = d.id_deck
          OR b.id_deck_perdedor = d.id_deck
      GROUP BY d.id_deck
      HAVING COUNT(*) >= 4
      ORDER BY taxa_vitoria DESC
      LIMIT ${limit}
      OFFSET ${offset};
    `;
      const serializedResult = JSON.parse(serializeBigInt(result));
      return res.json(serializedResult);
    } catch (err) {
      console.error("Erro getTopDecks:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}

export default new DeckController();
