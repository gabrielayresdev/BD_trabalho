import { Link } from "react-router-dom";

export default function DeckRow({ deck }) {
  return (
    <div className="linha-deck">
      <div className="emblema-tier">S</div>

      <div className="info-deck">
        <span className="nome-deck">{deck.nome}</span>
        <div className="meta-deck">
          <span className="etiqueta">{deck.etiqueta}</span>
          <span className="etiqueta">Patch 15.9</span>
        </div>
      </div>

      <div className="conteiner-cartas">
        {deck.cartas.map((carta) => (
          <Link
            to={`/card/${carta.id}`}
            key={carta.id}
            className="wrapper-carta"
          >
            <span className="custo-elixir">{carta.elixirCost}</span>
            <img
              src={carta.iconUrls?.medium}
              alt={carta.name}
              className="img-carta"
              loading="lazy"
            />
          </Link>
        ))}
        {[...Array(Math.max(0, 8 - deck.cartas.length))].map((_, i) => (
          <div
            key={i}
            className="wrapper-carta"
            style={{ background: "transparent", border: "1px #333" }}
          ></div>
        ))}
      </div>

      <div className="estatisticas-deck">
        <span className="media-elixir">{deck.mediaElixir}</span>
        <span className="rotulo-media">Elixir Médio</span>
      </div>
    </div>
  );
}
