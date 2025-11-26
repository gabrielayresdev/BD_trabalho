import { Link } from "react-router-dom";

interface Card {
  id_carta: number;
  nome: string;
  custo_elixir: number;
  raridade: string;
  url_image: string;
}

interface Deck {
  id_deck: string | number;
  cartas: Card[];
  vitorias: string;
  derrotas: string;
  total_partidas: string;
  taxa_vitoria: string; // Ex: "0.63" para 63%
}

type Props = { deck: Deck };

export default function DeckRow({ deck }: Props) {
  const mediaElixir =
    deck.cartas.length > 0
      ? (
          deck.cartas.reduce(
            (sum, carta) => sum + (carta.custo_elixir || 0),
            0
          ) / deck.cartas.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="linha-deck">
      <div className="emblema-tier">S</div>

      <div className="info-deck">
        <span className="nome-deck">{`Deck ${deck.id_deck}`}</span>
        <div className="meta-deck">
          <span className="etiqueta">
            Taxa de Vitória: {(Number(deck.taxa_vitoria) * 100).toFixed(0)}%
          </span>
          <span className="etiqueta">Partidas: {deck.total_partidas}</span>
        </div>
      </div>

      <div className="conteiner-cartas">
        {deck.cartas.map((carta) => (
          <Link
            to={`/card/${carta.id_carta}`}
            key={carta.id_carta}
            className="wrapper-carta"
          >
            <span className="custo-elixir">{carta.custo_elixir}</span>
            <img
              src={carta.url_image}
              alt={carta.nome}
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
        <span className="media-elixir">{mediaElixir}</span>
        <span className="rotulo-media">Elixir Médio</span>
      </div>
    </div>
  );
}
