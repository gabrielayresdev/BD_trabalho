import React from "react";

export interface ClanBattle {
  tag_cla: string;
  total_batalhas_envolvidas: number | string;
  batalhas_vencidas_por_membros: number | string;
  batalhas_perdidas_por_membros: number | string;
}

interface Props {
  clan: ClanBattle;
  rank: number;
}

export default function ClanRow({ clan, rank }: Props) {
  const total = Number(clan.total_batalhas_envolvidas) || 0;
  const wins = Number(clan.batalhas_vencidas_por_membros) || 0;
  const losses = Number(clan.batalhas_perdidas_por_membros) || 0;

  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0";

  const tierColor = "white";
  const bgTier = "#3b82f6";

  return (
    <div className="linha-deck">
      <div
        className="emblema-tier"
        style={{
          color: tierColor,
          borderColor: bgTier,
          backgroundColor: bgTier,
        }}
      >
        #{rank}
      </div>

      <div className="info-deck" style={{ width: "auto", flexGrow: 1 }}>
        <span className="nome-deck" style={{ fontSize: 18 }}>
          {clan.tag_cla}
        </span>
        <div className="meta-deck">
          <span className="etiqueta">
            {total} batalhas
          </span>
          <span className="etiqueta" style={{ color: "#8890a5" }}>
            {wins} vitórias
          </span>
          <span className="etiqueta" style={{ color: "#8890a5" }}>
            {losses} derrotas
          </span>
        </div>
      </div>

      <div className="estatisticas-deck" style={{ textAlign: "right" }}>
        <span className="media-elixir" style={{ color: "white" }}>
          {winRate}%
        </span>
        <span className="rotulo-media">Win Rate</span>
      </div>
    </div>
  );
}
