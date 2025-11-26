import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCard, fetchDeckSuggestion } from "../../lib/api";
import DeckRow from "../../components/DeckRow.js";
import "./CardDetails.css";

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
  taxa_vitoria: string;
}

interface StatsBoxProps {
  label: string;
  value: string | number;
  monospace?: boolean;
}

const StatsBox: React.FC<StatsBoxProps> = ({ label, value, monospace }) => (
  <div className="caixa-estatistica">
    <span className="rotulo-estatistica">{label}</span>
    <span
      className="valor-estatistica"
      style={monospace ? { fontFamily: "monospace", fontSize: 14 } : {}}
    >
      {value}
    </span>
  </div>
);

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const [carta, setCarta] = useState<Card | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [status, setStatus] = useState<{ loading: boolean; error: string }>({
    loading: true,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!id) {
        setStatus({ loading: false, error: "Carta não encontrada." });
        return;
      }

      setStatus((s) => ({ ...s, loading: true, error: "" }));

      try {
        const card = await fetchCard(Number(id));
        if (!cancelled) setCarta(card);

        const suggestions = await fetchDeckSuggestion([Number(id)]);
        if (!cancelled) setDecks(Array.isArray(suggestions) ? suggestions : []);

        if (!cancelled) setStatus({ loading: false, error: "" });
      } catch {
        if (!cancelled) {
          setStatus({
            loading: false,
            error: "Falha ao carregar os dados. Tente novamente.",
          });
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const getRarityStyle = (r?: string) => {
    const map: Record<string, { c: string; bg: string }> = {
      common: { c: "var(--raridade-comum)", bg: "var(--raridade-comum)" },
      rare: { c: "var(--raridade-rara)", bg: "var(--raridade-rara)" },
      epic: { c: "var(--raridade-epica)", bg: "var(--raridade-epica)" },
      legendary: {
        c: "var(--raridade-lendaria)",
        bg: "var(--raridade-lendaria)",
      },
      champion: { c: "var(--raridade-campeao)", bg: "var(--raridade-campeao)" },
    };
    const theme = map[(r || "").toLowerCase()] || map.common;
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

  const estilo = getRarityStyle(carta?.raridade);

  return (
    <div className="conteiner-detalhes">
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
            src={carta?.url_image}
            alt={carta?.nome || "Carta"}
            className="imagem-carta-grande"
          />
        </div>

        <div className="secao-info">
          <div className="cabecalho-carta">
            <h1 className="nome-carta">{carta?.nome}</h1>
            <div className="linha-emblemas">
              <span className="emblema" style={estilo}>
                {carta?.raridade}
              </span>
            </div>
          </div>

          <div className="grade-estatisticas">
            <StatsBox
              label="Custo de Elixir"
              value={carta?.custo_elixir ?? "-"}
            />
            <StatsBox label="Raridade" value={carta?.raridade ?? "-"} />
            <StatsBox
              label="ID da Carta"
              value={`#${carta?.id_carta}`}
              monospace
            />
          </div>
        </div>
      </div>

      <div className="secao-decks-relacionados">
        <h2 className="titulo-secao">Melhores Decks com {carta?.nome}</h2>
        <div className="lista-decks">
          {decks.map((d) => (
            <DeckRow key={d.id_deck} deck={d} />
          ))}
        </div>
      </div>
    </div>
  );
}
