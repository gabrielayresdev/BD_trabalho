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

class ClanController {
  public async getTotalBattleAmount(req: Request, res: Response) {
    try {
      const sql = Prisma.sql`
      SELECT
          c.tag_cla,
          COUNT(*) AS total_batalhas_envolvidas,
          SUM(CASE WHEN jv.id_cla = c.tag_cla THEN 1 ELSE 0 END) AS batalhas_vencidas_por_membros,
          SUM(CASE WHEN jp.id_cla = c.tag_cla THEN 1 ELSE 0 END) AS batalhas_perdidas_por_membros
      FROM batalha b
      JOIN jogador jv ON b.id_vencedor = jv.tag_jogador
      JOIN jogador jp ON b.id_perdedor = jp.tag_jogador
      JOIN cla c ON c.tag_cla IN (jv.id_cla, jp.id_cla)
      GROUP BY c.tag_cla
      ORDER BY total_batalhas_envolvidas DESC
    `;

      const rows = await prisma.$queryRaw<
        Array<{
          tag_cla: string;
          total_batalhas_envolvidas: bigint;
          batalhas_vencidas_por_membros: bigint;
          batalhas_perdidas_por_membros: bigint;
        }>
      >(sql);

      return res.status(200).json(serializeBigInt(rows));
    } catch (err) {
      console.error("Erro ao obter total de batalhas por clã:", err);
      return res
        .status(500)
        .json({ message: "Erro interno ao consultar batalhas por clã" });
    }
  }
}

export default new ClanController();
