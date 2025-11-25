const BASE_URL = "/api";
const API_TOKEN = import.meta.env.VITE_CLASH_API_TOKEN;

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });

  if (!res.ok) {
    console.error("Erro na API:", res.status, await res.text());
    throw new Error("Erro ao buscar dados da API Clash Royale");
  }

  return res.json();
}

export async function fetchCards() {
  const data = await request("/cards?limit=200");
  return data.items ?? [];
}
