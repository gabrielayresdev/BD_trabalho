import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCards } from "@/lib/api";
import DeckRow from "../../components/DeckRow.jsx";
import Header from "../../components/Header.jsx";
import "./CardDetails.css";

const StatsBox = ({ label, value, isElixir, monospace }) => (
  <div className="caixa-estatistica">
    <span className="rotulo-estatistica">{label}</span>
    <span
      className={`valor-estatistica ${isElixir ? "valor-elixir" : ""}`}
      style={monospace ? { fontFamily: "monospace", fontSize: 14 } : {}}
    >
      {value}
    </span>
  </div>
);

export default function DetalhesCarta() {
  const { id } = useParams();
  const [carta, setCarta] = useState(null);
  const [decks, setDecks] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    async function carregar() {
      try {
        setStatus({ loading: true, error: "" });
        const dados = await fetchCards();
        const atual = dados.find((c) => c.id === Number(id));

        if (!atual) throw new Error("Carta não encontrada.");

        setCarta(atual);
        const outros = dados.filter((c) => c.id !== Number(id));

        const decksGerados = Array.from({ length: 3 }).map((_, i) => {
          const sub = [
            atual,
            ...outros.sort(() => 0.5 - Math.random()).slice(0, 7),
          ];
          const media = (
            sub.reduce((acc, c) => acc + (c.elixirCost || 0), 0) / 8
          ).toFixed(1);
          const main = sub.reduce(
            (p, c) => (p.elixirCost > c.elixirCost ? p : c),
            sub[0]
          );

          return {
            id: i,
            cartas: sub,
            mediaElixir: media,
            nome: `${main.name} ${atual.name} Combo`,
            etiqueta: media > 4.0 ? "Beatdown" : "Controle",
          };
        });
        setDecks(decksGerados);
      } catch (e) {
        setStatus({
          loading: false,
          error: e.message || "Erro ao carregar detalhes.",
        });
      } finally {
        setStatus((s) => ({ ...s, loading: false }));
      }
    }
    carregar();
  }, [id]);

  const getRarityStyle = (r) => {
    const map = {
      common: { c: "var(--raridade-comum)", bg: "var(--raridade-comum)" },
      rare: { c: "var(--raridade-rara)", bg: "var(--raridade-rara)" },
      epic: { c: "var(--raridade-epica)", bg: "var(--raridade-epica)" },
      legendary: {
        c: "var(--raridade-lendaria)",
        bg: "var(--raridade-lendaria)",
      },
      champion: { c: "var(--raridade-campeao)", bg: "var(--raridade-campeao)" },
    };
    const theme = map[r?.toLowerCase()] || map.common;
    return { color: theme.c, borderColor: theme.c, background: theme.bg };
  };

  if (status.loading)
    return <div className="conteiner-msg">Carregando dados do servidor...</div>;
  if (status.error)
    return (
      <div className="conteiner-msg">
        {status.error}{" "}
        <Link to="/" className="link-tentar-novamente">
          Voltar
        </Link>
      </div>
    );

  const estilo = getRarityStyle(carta.rarity);

  return (
    <div className="conteiner-detalhes">
      <Header />
      
      <Link to="/" className="link-voltar">
        <span className="seta-voltar">←</span> Voltar para Meta Decks
      </Link>

      <div className="painel-detalhes">
        <div className="secao-visual">
          <div
            className="brilho-raridade"
            style={{ backgroundColor: estilo.borderColor }}
          ></div>
          <img
            src={carta.iconUrls?.evolutionMedium || carta.iconUrls?.medium}
            alt={carta.name}
            className="imagem-carta-grande"
          />
        </div>

        <div className="secao-info">
          <div className="cabecalho-carta">
            <h1 className="nome-carta">{carta.name}</h1>
            <div className="linha-emblemas">
              <span className="emblema" style={estilo}>
                {carta.rarity}
              </span>
              {carta.maxLevel && (
                <span className="emblema emblema-nivel">
                  Nível Máx {carta.maxLevel}
                </span>
              )}
            </div>
          </div>

          <div className="grade-estatisticas">
            <StatsBox
              label="Custo de Elixir"
              value={carta.elixirCost ?? "-"}
              isElixir
            />
            <StatsBox
              label="Desbloqueio na Arena"
              value={`Arena ${carta.arena ?? "Treino"}`}
            />
            <StatsBox label="ID do Banco" value={`#${carta.id}`} monospace />
            <StatsBox label="Tipo" value="Unidade" />
          </div>
        </div>
      </div>

      <div className="secao-decks-relacionados">
        <h2 className="titulo-secao">Melhores Decks com {carta.name}</h2>
        <div className="lista-decks">
          {decks.map((d) => (
            <DeckRow key={d.id} deck={d} />
          ))}
        </div>
      </div>
    </div>
  );
}