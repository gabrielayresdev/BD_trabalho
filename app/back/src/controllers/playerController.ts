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

const prisma = new PrismaClient({ adapter });

type JogadorNuncaVenceu = {
  tag_jogador: string;
  trofeus: number;
  total_partidas: number;
  vitorias: number;
  last_update: Date | string;
};

type JogadorComTrofeus = {
  tag_jogador: string;
  trofeus: number;
  total_partidas: number;
  vitorias: number;
  last_update: Date | string;
};

type MelhorJogador = {
  tag_jogador: string;
  trofeus: number;
  total_partidas: number;
  vitorias: number;
  derrotas: number;
  taxa_vitoria: number;
  last_update: Date | string;
};

class PlayerController {
  async neverWon(req: Request, res: Response) {
    try {
      const jogadores = await prisma.$queryRaw<JogadorNuncaVenceu[]>(Prisma.sql`
        SELECT
            j.tag_jogador,
            j.trofeus,
            COUNT(b.id_batalha) AS total_partidas,
            0 AS vitorias,
            j.last_update
        FROM jogador j
        LEFT JOIN batalha b
            ON b.id_vencedor = j.tag_jogador
            OR b.id_perdedor = j.tag_jogador
        WHERE NOT EXISTS (
            SELECT 1
            FROM batalha b2
            WHERE b2.id_vencedor = j.tag_jogador
        ) with total_partidas > 2
        GROUP BY
            j.tag_jogador,
            j.trofeus,
            j.last_update;

      `);

      return res.json(JSON.parse(serializeBigInt(jogadores)));
    } catch (err: any) {
      return res.status(500).json({
        error: "Erro ao buscar jogadores que nunca venceram.",
        details: err?.message,
      });
    }
  }

  async aboveAverage(req: Request, res: Response) {
    try {
      const jogadores = await prisma.$queryRaw<JogadorComTrofeus[]>(Prisma.sql`
        SELECT
          j.tag_jogador,
          j.trofeus,
          COALESCE(COUNT(b.id_batalha), 0) AS total_partidas,
          COALESCE(SUM(CASE WHEN b.id_vencedor = j.tag_jogador THEN 1 ELSE 0 END), 0) AS vitorias,
          j.last_update
        FROM jogador j
        LEFT JOIN batalha b
          ON b.id_vencedor = j.tag_jogador
          OR b.id_perdedor = j.tag_jogador
        WHERE j.trofeus > (SELECT AVG(j2.trofeus) FROM jogador j2)
        GROUP BY j.tag_jogador, j.trofeus, j.last_update
        ORDER BY j.trofeus DESC
      `);

      return res.json(JSON.parse(serializeBigInt(jogadores)));
    } catch (err: any) {
      return res.status(500).json({
        error: "Erro ao buscar jogadores acima da média de troféus.",
        details: err?.message,
      });
    }
  }

  async bestPlayers(req: Request, res: Response) {
    try {
      const jogadores = await prisma.$queryRaw<MelhorJogador[]>(Prisma.sql`
        SELECT
          j.tag_jogador,
          j.trofeus,
          COUNT(b.id_batalha) AS total_partidas,
          SUM(CASE WHEN b.id_vencedor = j.tag_jogador THEN 1 ELSE 0 END) AS vitorias,
          SUM(CASE WHEN b.id_perdedor = j.tag_jogador THEN 1 ELSE 0 END) AS derrotas,
          CAST(SUM(CASE WHEN b.id_vencedor = j.tag_jogador THEN 1 ELSE 0 END) AS DOUBLE) / NULLIF(COUNT(*), 0) AS taxa_vitoria,
          j.last_update
        FROM jogador j
        JOIN batalha b
          ON b.id_vencedor = j.tag_jogador
          OR b.id_perdedor = j.tag_jogador
        GROUP BY j.tag_jogador, j.trofeus, j.last_update
        HAVING COUNT(*) >= 3
        ORDER BY taxa_vitoria DESC, vitorias DESC
      `);

      return res.json(JSON.parse(serializeBigInt(jogadores)));
    } catch (err: any) {
      return res.status(500).json({
        error: "Erro ao buscar melhores jogadores.",
        details: err?.message,
      });
    }
  }
}

export default new PlayerController();
