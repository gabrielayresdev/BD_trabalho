import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchCards } from "@/lib/api";
import DeckRow from "../../components/DeckRow.jsx";
import Header from "../../components/Header.jsx";
import "./Home.css";

export default function Home() {
  const [cartas, setCartas] = useState([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [verDecks, setVerDecks] = useState(true);

  useEffect(() => {
    fetchCards()
      .then((dados) => {
        setCartas(dados.sort(() => 0.5 - Math.random()));
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [verDecks, busca]);

  const conteudoVisivel = useMemo(() => {
    const filtradas = cartas.filter((c) =>
      c.name.toLowerCase().includes(busca.toLowerCase())
    );

    if (verDecks) {
      if (busca.length > 0) {
        if (filtradas.length === 0) return [];

        const cartaAlvo = filtradas[0];
        const poolDeCartas = cartas.filter(c => c.id !== cartaAlvo.id);

        const decksGerados = [];
        const qtdParaGerar = pagina * 10;

        for (let i = 0; i < qtdParaGerar; i++) {
          const aleatorias = poolDeCartas
            .sort(() => 0.5 - Math.random()) 
            .slice(0, 7);
          
          const deckCompleto = [cartaAlvo, ...aleatorias];

          const totalCost = deckCompleto.reduce((acc, c) => acc + (c.elixirCost || 0), 0);
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
            etiqueta: media > 4.0 ? "Pesado" : "Rápido",
          });
        }
        return decksGerados;
      }

      const grupos = [];
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
          etiqueta: main && main.elixirCost > 3.6 ? "Pesado" : "Ciclo Rápido",
        });
      }
      return grupos.slice(0, pagina * 10);
    }

    else {
      return filtradas.slice(0, pagina * 24);
    }
  }, [cartas, busca, pagina, verDecks]);

  return (
    <div className="conteiner">
      <Header
        busca={busca}
        setBusca={setBusca}
        placeholder={verDecks ? "Digite uma carta para gerar decks..." : "Buscar carta por nome..."}
      />

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
                {conteudoVisivel.length > 0 ? (
                  conteudoVisivel.map((deck) => (
                    <DeckRow key={deck.id} deck={deck} />
                  ))
                ) : (
                  <div className="msg-vazio">
                     {busca ? `Nenhuma carta encontrada para "${busca}"` : "Nenhum deck disponível."}
                  </div>
                )}
              </div>
            ) : (
              <div className="grade-todas-cartas">
                {conteudoVisivel.map((carta) => (
                  <Link
                    to={`/card/${carta.id}`}
                    key={carta.id}
                    className="wrapper-carta grande"
                  >
                    <span className="custo-elixir">{carta.elixirCost}</span>
                    <img
                      src={carta.iconUrls?.medium}
                      alt={carta.name}
                      className="img-carta"
                      loading="lazy"
                    />
                    <div className="nome-carta-overlay">{carta.name}</div>
                  </Link>
                ))}
              </div>
            )}

            {conteudoVisivel.length > 0 && (
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
      </main>
    </div>
  );
}