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

      const decks = await prisma.$queryRaw<
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

      const deckIds = decks.map((d) => d.id_deck);

      const cartas = await prisma.$queryRaw<
        { id_deck: number; id_carta: number; nome: string }[]
      >(Prisma.sql`
        SELECT dc.id_deck, c.id_carta, c.nome
        FROM deck_carta dc
        JOIN carta c ON c.id_carta = dc.id_carta
        WHERE dc.id_deck IN (${Prisma.join(deckIds)});
      `);

      const result = decks.map((deck) => ({
        ...deck,
        cartas: cartas
          .filter((carta) => carta.id_deck === deck.id_deck)
          .map((carta) => ({ id_carta: carta.id_carta, nome: carta.nome })),
      }));

      const serializedResult = JSON.parse(serializeBigInt(result));
      return res.json(serializedResult);
    } catch (err) {
      console.error("Erro getTopDecks:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  public async getDeckSuggestion(req: Request, res: Response) {
    try {
      const {
        cards,
        limit = 10,
        offset = 0,
      } = req.body as {
        cards: number[];
        limit?: number;
        offset?: number;
      };

      if (!cards || !Array.isArray(cards)) {
        return res.status(400).json({ error: "Envie um array de cartas." });
      }

      const cardsSql = cards.join(",");

      const query = `
      WITH decks_filtrados AS (
          SELECT id_deck
          FROM deck_carta
          WHERE id_carta IN (${cardsSql})
          GROUP BY id_deck
      )
      SELECT 
          d.id_deck,
          COUNT(*) AS total_partidas,
          SUM(CASE WHEN b.id_deck_vencedor = d.id_deck THEN 1 ELSE 0 END) AS vitorias,
          SUM(CASE WHEN b.id_deck_perdedor = d.id_deck THEN 1 ELSE 0 END) AS derrotas,
          SUM(CASE WHEN b.id_deck_vencedor = d.id_deck THEN 1 ELSE 0 END) / COUNT(*) AS taxa_vitoria
      FROM decks_filtrados d
      JOIN batalha b 
          ON b.id_deck_vencedor = d.id_deck
          OR b.id_deck_perdedor = d.id_deck
      GROUP BY d.id_deck
      HAVING COUNT(*) >= 4
      ORDER BY taxa_vitoria DESC
      LIMIT ${Number(limit)}
      OFFSET ${Number(offset)};
    `;

      const result = await prisma.$queryRawUnsafe<
        {
          id_deck: number;
          total_partidas: number;
          vitorias: number;
          derrotas: number;
          taxa_vitoria: number;
        }[]
      >(query);

      return res.json(result);
    } catch (err) {
      console.error("Erro getSuggestedDecks:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}

export default new DeckController();
