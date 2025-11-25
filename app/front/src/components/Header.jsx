import React from "react";

export default function Header({ busca, setBusca }) {
  return (
    <header className="header">
      <div className="titulo">Meta Clash Royale Temporada 18</div>
      {setBusca && (
        <input
          type="text"
          className="barra-busca"
          placeholder="Buscar cartas"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      )}
    </header>
  );
}