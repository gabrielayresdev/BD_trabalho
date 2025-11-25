create table clash_royale;
use clash_royale;

CREATE TABLE carta (
    id_carta INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    custo_elixir INT NOT NULL,
    raridade VARCHAR(50),
    url_image VARCHAR(255)
);

CREATE TABLE deck (
    id_deck INT PRIMARY KEY
);

CREATE TABLE deck_carta (
    id_deck INT,
    id_carta INT,

    PRIMARY KEY (id_deck, id_carta),

    FOREIGN KEY (id_deck) REFERENCES deck(id_deck),
    FOREIGN KEY (id_carta) REFERENCES carta(id_carta)
);

CREATE TABLE jogador (
    tag_jogador VARCHAR(20) PRIMARY KEY,
    trofeus INT,
    id_cla VARCHAR(20),
    last_update DATETIME,

    FOREIGN KEY (id_cla) REFERENCES cla(tag_cla)
);

CREATE TABLE cla (
    tag_cla VARCHAR(20) PRIMARY KEY,
    badge_id INT
);



CREATE TABLE modo_jogo (
    id_mode INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE arena (
    id_arena INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE batalha (
    id_batalha INT PRIMARY KEY,
    data_hora DATETIME NOT NULL,
    media_trofeus INT,
    id_vencedor VARCHAR(20) NOT NULL,
    id_perdedor VARCHAR(20) NOT NULL,
    id_deck_vencedor INT NOT NULL,
    id_deck_perdedor INT NOT NULL,

    FOREIGN KEY (id_vencedor) REFERENCES jogador(tag_jogador),
    FOREIGN KEY (id_perdedor) REFERENCES jogador(tag_jogador),
    FOREIGN KEY (id_deck_vencedor) REFERENCES deck(id_deck),
    FOREIGN KEY (id_deck_perdedor) REFERENCES deck(id_deck)
);

/* Queries úteis */


/* Retorna um deck */
SELECT 
    d.id_deck,
    c.id_carta,
    c.nome AS nome_carta
FROM deck d
JOIN deck_carta dc ON dc.id_deck = d.id_deck
JOIN carta c ON c.id_carta = dc.id_carta
WHERE d.id_deck = 1     
ORDER BY c.id_carta;

/* Win rate */

SELECT 
    d.id_deck,
    COUNT(*) AS total_partidas,
    SUM(CASE WHEN b.id_deck_vencedor = d.id_deck THEN 1 ELSE 0 END) AS vitorias,
    SUM(CASE WHEN b.id_deck_perdedor = d.id_deck THEN 1 ELSE 0 END) AS derrotas,
    SUM(CASE WHEN b.id_deck_vencedor = d.id_deck THEN 1 ELSE 0 END) / COUNT(*) AS taxa_vitoria
FROM deck d
JOIN batalha b 
    ON b.id_deck_vencedor = d.id_deck
    OR b.id_deck_perdedor = d.id_deck
GROUP BY d.id_deck
HAVING COUNT(*) >= 4
ORDER BY taxa_vitoria DESC;


/* Mesma query, mas com filtro por cartas */

WITH decks_filtrados AS (
    SELECT id_deck
    FROM deck_carta
    WHERE id_carta IN (26000006, 26000003)
    GROUP BY id_deck
)

SELECT 
    d.id_deck,
    COUNT(*) AS total_partidas,
    SUM(CASE WHEN b.id_deck_vencedor = d.id_deck THEN 1 ELSE 0 END) AS vitorias,
    SUM(CASE WHEN b.id_deck_perdedor = d.id_deck THEN 1 ELSE 0 END) AS derrotas,
    SUM(CASE WHEN b.id_deck_vencedor = d.id_deck THEN 1 ELSE 0 END) / COUNT(*) AS taxa_vitoria
FROM decks_filtrados d
JOIN batalha b 
    ON b.id_deck_vencedor = d.id_deck
    OR b.id_deck_perdedor = d.id_deck
GROUP BY d.id_deck
HAVING COUNT(*) >= 4
ORDER BY taxa_vitoria DESC;