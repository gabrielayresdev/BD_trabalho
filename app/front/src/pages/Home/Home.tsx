import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  fetchCards,
  fetchTopCards,
  fetchBestPlayers,
  fetchNeverWonPlayers,
  fetchClansBattles,
} from "../../lib/api";
import ClanRow from "../../components/ClanRow";

import DeckRow from "../../components/DeckRow";
import PlayerRow from "../../components/PlayerRow";
import Header from "../../components/Header";
import "./Home.css";

interface Card {
  id_carta: number;
  nome: string;
  custo_elixir: number;
  raridade: string;
  url_image: string;
}
interface ClanBattle {
  tag_cla: string;
  total_batalhas_envolvidas: number | string;
  batalhas_vencidas_por_membros: number | string;
  batalhas_perdidas_por_membros: number | string;
}

interface Deck {
  id_deck: string | number;
  cartas: Card[];
  vitorias: string;
  derrotas: string;
  total_partidas: string;
  taxa_vitoria: string;
}

interface Player {
  tag_jogador: string;
  trofeus: number;
  total_partidas: number;
  vitorias: number;
  taxa_vitoria?: number | string;
}

type TabOption = "decks" | "cards" | "players" | "clans";

export default function Home() {
  const [cartas, setCartas] = useState<Card[]>([]);
  const [topDecks, setTopDecks] = useState<Deck[]>([]);
  const [bestPlayers, setBestPlayers] = useState<Player[]>([]);
  const [worstPlayers, setWorstPlayers] = useState<Player[]>([]);
  const [clans, setClans] = useState<ClanBattle[]>([]);

  const [busca, setBusca] = useState<string>("");
  const [pagina, setPagina] = useState<number>(1);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [abaAtiva, setAbaAtiva] = useState<TabOption>("decks");

  useEffect(() => {
    const getData = async () => {
      try {
        const [decksData, cardsData] = await Promise.all([
          fetchTopCards(),
          fetchCards(),
        ]);
        setTopDecks(decksData || []);
        setCartas(cardsData || []);
      } catch (error) {
        console.error("Erro inicial:", error);
      } finally {
        setCarregando(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (abaAtiva === "players" && bestPlayers.length === 0) {
      const getPlayers = async () => {
        setCarregando(true);
        try {
          const [best, worst] = await Promise.all([
            fetchBestPlayers(),
            fetchNeverWonPlayers(),
          ]);
          setBestPlayers(best || []);
          setWorstPlayers(worst || []);
        } catch (error) {
          console.error("Erro ao buscar jogadores:", error);
        } finally {
          setCarregando(false);
        }
      };
      getPlayers();
    }
  }, [abaAtiva, bestPlayers.length]);

  useEffect(() => {
    if (abaAtiva === "clans" && clans.length === 0) {
      const getClans = async () => {
        setCarregando(true);
        try {
          const data = await fetchClansBattles();
          setClans(data || []);
        } catch (error) {
          console.error("Erro ao buscar clãs:", error);
        } finally {
          setCarregando(false);
        }
      };
      getClans();
    }
  }, [abaAtiva, clans.length]);

  useEffect(() => {
    setPagina(1);
  }, [abaAtiva, busca]);

  const conteudoCartas = useMemo(() => {
    if (!busca) return cartas;
    return cartas.filter((c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [cartas, busca]);

  const clansOrdenados = useMemo(() => {
    if (!clans || clans.length === 0) return [];

    return [...clans].sort((a, b) => {
      const totalA = Number(a.total_batalhas_envolvidas) || 0;
      const totalB = Number(b.total_batalhas_envolvidas) || 0;
      const winsA = Number(a.batalhas_vencidas_por_membros) || 0;
      const winsB = Number(b.batalhas_vencidas_por_membros) || 0;

      const winRateA = totalA > 0 ? winsA / totalA : 0;
      const winRateB = totalB > 0 ? winsB / totalB : 0;

      return winRateB - winRateA;
    });
  }, [clans]);

  return (
    <div className="conteiner">
      <Header />

      <div className="toggle-container">
        <button
          className={`btn-toggle ${abaAtiva === "decks" ? "ativo" : ""}`}
          onClick={() => setAbaAtiva("decks")}
        >
          Meta Decks
        </button>
        <button
          className={`btn-toggle ${abaAtiva === "cards" ? "ativo" : ""}`}
          onClick={() => setAbaAtiva("cards")}
        >
          Todas as Cartas
        </button>
        <button
          className={`btn-toggle ${abaAtiva === "players" ? "ativo" : ""}`}
          onClick={() => setAbaAtiva("players")}
        >
          Jogadores
        </button>
        <button
          className={`btn-toggle ${abaAtiva === "clans" ? "ativo" : ""}`}
          onClick={() => setAbaAtiva("clans")}
        >
          Clãs
        </button>
      </div>

      <main>
        {carregando ? (
          <div className="carregando">Carregando dados...</div>
        ) : (
          <>
            {abaAtiva === "decks" && (
              <div className="lista-decks">
                {topDecks.length > 0 ? (
                  topDecks
                    .slice(0, 5 * pagina)
                    .map((deck) => <DeckRow key={deck.id_deck} deck={deck} />)
                ) : (
                  <div className="msg-vazio">Nenhum deck encontrado.</div>
                )}
                <div className="btn-container">
                  <button
                    onClick={() => setPagina((p) => p + 1)}
                    className="btn-carregar"
                  >
                    Carregar mais
                  </button>
                </div>
              </div>
            )}

            {abaAtiva === "cards" && (
              <>
                <div className="grade-todas-cartas">
                  {conteudoCartas.slice(0, 18 * pagina).map((carta) => (
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
                      <div className="">{carta.nome}</div>
                    </Link>
                  ))}
                </div>
                {conteudoCartas.length > 0 && (
                  <div className="btn-container">
                    <button
                      onClick={() => setPagina((p) => p + 1)}
                      className="btn-carregar"
                    >
                      Carregar mais
                    </button>
                  </div>
                )}
              </>
            )}

            {abaAtiva === "players" && (
              <div className="secao-jogadores">
                <div className="coluna-lista" style={{ marginBottom: 40 }}>
                  <h2
                    className="titulo-secao-lista"
                    style={{
                      color: "#3b82f6",
                      borderLeft: "4px solid #3b82f6",
                      paddingLeft: 10,
                    }}
                  >
                    Top Players
                  </h2>
                  <div className="lista-decks">
                    {bestPlayers.slice(0, 5 * pagina).map((player, index) => (
                      <PlayerRow
                        key={`best-${player.tag_jogador}`}
                        player={player}
                        tipo="melhor"
                        rank={index + 1}
                      />
                    ))}
                  </div>
                </div>

                <div className="coluna-lista">
                  <h2
                    className="titulo-secao-lista"
                    style={{
                      color: "#3b82f6",
                      borderLeft: "4px solid #3b82f6",
                      paddingLeft: 10,
                    }}
                  >
                    Piores jogadores
                  </h2>
                  <div className="lista-decks">
                    {worstPlayers.slice(0, 5 * pagina).map((player, index) => (
                      <PlayerRow
                        key={`worst-${player.tag_jogador}`}
                        player={player}
                        tipo="pior"
                        rank={index + 1}
                      />
                    ))}
                  </div>
                </div>

                <div className="btn-container">
                  <button
                    onClick={() => setPagina((p) => p + 1)}
                    className="btn-carregar"
                  >
                    Carregar mais
                  </button>
                </div>
              </div>
            )}

            {abaAtiva === "clans" && (
              <div className="secao-jogadores">
                <div
                  className="coluna-lista"
                  style={{ marginBottom: 40, width: "100%" }}
                >
                  <h2
                    className="titulo-secao-lista"
                    style={{
                      color: "#3b82f6",
                      borderLeft: "4px solid #3b82f6",
                      paddingLeft: 10,
                    }}
                  >
                    Clãs com mais vitórias por membro
                  </h2>

                  <div className="lista-decks">
                    {clansOrdenados.length > 0 ? (
                      clansOrdenados
                        .slice(0, 5 * pagina)
                        .map((clan, index) => (
                          <ClanRow
                            key={clan.tag_cla}
                            clan={clan}
                            rank={index + 1}
                          />
                        ))
                    ) : (
                      <div className="msg-vazio">Nenhum clã encontrado.</div>
                    )}
                  </div>

                  {clansOrdenados.length > 5 * pagina && (
                    <div className="btn-container">
                      <button
                        onClick={() => setPagina((p) => p + 1)}
                        className="btn-carregar"
                      >
                        Carregar mais
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
