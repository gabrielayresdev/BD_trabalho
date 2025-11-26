const BASE_URL = "http://localhost:3000";

async function request(endpoint: string, headers?: RequestInit) {
  const res = await fetch(`${BASE_URL}${endpoint}`, headers);

  if (!res.ok) {
    console.error("Erro na API:", res.status, await res.text());
    throw new Error("Erro ao buscar dados da API Clash Royale");
  }

  return res.json();
}

export async function fetchTopCards() {
  const data = await request("/decks/top");
  return data;
}

export async function fetchCards() {
  const data = await request("/cards");
  return data;
}

export async function fetchCard(id: number) {
  const data = await request("/cards/" + id);
  return data;
}

export async function fetchDeckSuggestion(cardIds: number[]) {
  const data = await request("/decks/suggestion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cards: cardIds }),
  });

  return data;
}

export async function fetchBestPlayers() {
  const data = await request("/players/best");
  return data;
}

export async function fetchNeverWonPlayers() {
    const data = await request("/players/best");
  return data;
}

export async function fetchAboveAveragePlayers() {
  return await request("/players/above-average-trophies");
}
