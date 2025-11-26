import React from "react";

interface Player {
  tag_jogador: string;
  trofeus: number;
  total_partidas: number;
  vitorias: number;
  taxa_vitoria?: number | string;
}

interface Props {
  player: Player;
  tipo: "melhor" | "pior";
  rank: number;
}

export default function PlayerRow({ player, tipo, rank }: Props) {
  const winRate = player.taxa_vitoria
    ? (Number(player.taxa_vitoria) * 100).toFixed(1)
    : "0.0";
  
  const tierColor = tipo === "melhor" ? "var(--destaque-tier-s)" : "#94a3b8"; 
  const bgTier = tipo === "melhor" ? "rgba(255, 107, 107, 0.15)" : "rgba(148, 163, 184, 0.15)";
  const tierLabel = tipo === "melhor" ? `#${rank}` : "F";
  const winRateColor = tipo === "melhor" ? "#2dd4bf" : "#d13333ff"; 

  return (
    <div className="linha-deck">
      <div
        className="emblema-tier"
        style={{ color: tierColor, borderColor: tierColor, backgroundColor: bgTier }}
      >
        {tierLabel}
      </div>

      <div className="info-deck" style={{ width: "auto", flexGrow: 1 }}>
        <span className="nome-deck" style={{ fontSize: 18 }}>
          {player.tag_jogador}
        </span>
        <div className="meta-deck">
          <span className="etiqueta" style={{ color: "#facc15" }}>
             {player.trofeus} Troféus
          </span>
          <span className="etiqueta">
             {player.total_partidas} Partidas
          </span>
          {tipo === "melhor" && (
             <span className="etiqueta">
              {player.vitorias} Vitórias
           </span>
          )}
        </div>
      </div>

      <div className="estatisticas-deck" style={{ textAlign: "right" }}>
        <span className="media-elixir" style={{ color: winRateColor }}>
          {tipo === "melhor" ? `${winRate}%` : "0%"}
        </span>
        <span className="rotulo-media">Win Rate</span>
      </div>
    </div>
  );
}