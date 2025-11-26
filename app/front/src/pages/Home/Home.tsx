import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchCards, fetchTopCards } from "../../lib/api.ts";
import DeckRow from "../../components/DeckRow.tsx";
import Header from "../../components/Header.jsx";
import "./Home.css";

// Tipos
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

export default function Home() {
  const [cartas, setCartas] = useState<Card[]>([]);
  const [topDecks, setTopDecks] = useState<Deck[]>([]);
  const [busca, setBusca] = useState<string>("");
  const [pagina, setPagina] = useState<number>(1);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [verDecks, setVerDecks] = useState<boolean>(true);

  useEffect(() => {
    const getData = async () => {
      const decks = await fetchTopCards();
      const cards = await fetchCards();

      if (!decks || !cards) {
        console.error("Erro ao buscar dados da API");
        return;
      }
      console.log(decks);

      setTopDecks(decks);
      setCartas(cards);
      setCarregando(false);
    };
    getData();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [verDecks, busca]);

  /* const conteudoVisivel = useMemo<Deck[] | Card[]>(() => {
    const filtradas = cartas.filter((c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase())
    );

    if (verDecks) {
      if (busca.length > 0) {
        if (filtradas.length === 0) return [];
        const cartaAlvo = filtradas[0];
        const poolDeCartas = cartas.filter((c) => c.id !== cartaAlvo.id);

        const decksGerados: Deck[] = [];
        const qtdParaGerar = pagina * 10;

        for (let i = 0; i < qtdParaGerar; i++) {
          const aleatorias = poolDeCartas
            .sort(() => 0.5 - Math.random())
            .slice(0, 7);

          const deckCompleto = [cartaAlvo, ...aleatorias];

          const totalCost = deckCompleto.reduce(
            (acc, c) => acc + (c.elixirCost || 0),
            0
          );
          const media = (totalCost / 8).toFixed(1);

          const cartaChefe = deckCompleto.reduce(
            (p, c) => (p.elixirCost > c.elixirCost ? p : c),
            deckCompleto[0]
          );

          decksGerados.push({
            id: `gen-${cartaAlvo.id}-${i}`,
            cartas: deckCompleto,
            mediaElixir: media,
            nome: `${cartaAlvo.name} com ${cartaChefe.name}`,
            etiqueta: parseFloat(media) > 4.0 ? "Pesado" : "Rápido",
          });
        }
        return decksGerados;
      }

      const grupos: Deck[] = [];
      for (let i = 0; i < filtradas.length; i += 8) {
        const sub = filtradas.slice(i, i + 8);
        if (sub.length < 8) break;

        const totalCost = sub.reduce((acc, c) => acc + (c.elixirCost || 0), 0);
        const main = sub.reduce(
          (p, c) => (p.elixirCost > c.elixirCost ? p : c),
          sub[0]
        );

        grupos.push({
          id: i,
          cartas: sub,
          mediaElixir: (totalCost / sub.length).toFixed(1),
          nome: main ? `${main.name} Ciclo` : "Meta Deck",
          etiqueta:
            main && main.elixirCost && main.elixirCost > 3.6
              ? "Pesado"
              : "Ciclo Rápido",
        });
      }
      return grupos.slice(0, pagina * 10);
    } else {
      return filtradas.slice(0, pagina * 24);
    }
  }, [cartas, busca, pagina, verDecks]); */

  return (
    <div className="conteiner">
      <Header busca={busca} setBusca={setBusca} />

      <div className="toggle-container">
        <button
          className={`btn-toggle ${verDecks ? "ativo" : ""}`}
          onClick={() => setVerDecks(true)}
        >
          Ver Meta Decks
        </button>
        <button
          className={`btn-toggle ${!verDecks ? "ativo" : ""}`}
          onClick={() => setVerDecks(false)}
        >
          Ver Todas as Cartas
        </button>
      </div>

      <main>
        {carregando ? (
          <div className="carregando">Carregando Meta...</div>
        ) : (
          <>
            {verDecks ? (
              <div className="lista-decks">
                {topDecks.length > 0 ? (
                  topDecks
                    .slice(0, 5 * pagina)
                    .map((deck) => <DeckRow key={deck.id_deck} deck={deck} />)
                ) : (
                  <div className="msg-vazio">
                    {busca
                      ? `Nenhuma carta encontrada para "${busca}"`
                      : "Nenhum deck disponível."}
                  </div>
                )}
              </div>
            ) : (
              <div className="grade-todas-cartas">
                {cartas.slice(0, 18 * pagina).map((carta) => (
                  <Link
                    to={`/card/${carta.id_carta}`}
                    key={carta.id_carta}
                    className="wrapper-carta grande"
                  >
                    <span className="custo-elixir">{carta.custo_elixir}</span>
                    <img
                      src={carta.url_image}
                      alt={carta.nome}
                      className="img-carta"
                      loading="lazy"
                    />
                    <div className="nome-carta-overlay">{carta.nome}</div>
                  </Link>
                ))}
              </div>
            )}

            <div className="btn-container">
              <button
                onClick={() => setPagina((p) => p + 1)}
                className="btn-carregar"
              >
                Carregar mais
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
