import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

let accessToken = null;
let tokenExpiresAt = 0;

// 🎯 GERAR TOKEN SPOTIFY
async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // ✅ Validação antecipada das credenciais
  if (!clientId || !clientSecret) {
    throw new Error(
      "SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET não configurados nas variáveis de ambiente"
    );
  }

  console.log("🔑 CLIENT ID:", clientId.slice(0, 6) + "...");

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  const data = await response.json();

  console.log("🔐 resposta token status:", response.status);

  if (!data.access_token) {
    // Loga o erro completo do Spotify para facilitar diagnóstico
    console.error("💥 Spotify recusou as credenciais:", JSON.stringify(data));
    throw new Error(
      data.error_description || data.error || "Spotify não retornou access_token"
    );
  }

  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  console.log("✅ Token válido gerado, expira em:", data.expires_in, "s");
}

// 🎯 GARANTIR TOKEN VÁLIDO — agora relança o erro para quem chamou tratar
async function ensureToken() {
  if (!accessToken || Date.now() > tokenExpiresAt) {
    console.log("🔄 Gerando novo token...");
    await getAccessToken(); // lança erro se falhar
  }
}

// 🎯 Função auxiliar: busca no Spotify com token atual
async function spotifySearch(query) {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.json();
}

// 🎯 ROTA DE BUSCA
app.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Query vazia" });
  }

  try {
    await ensureToken();

    console.log("🔍 Query recebida:", query);

    let data = await spotifySearch(query);

    console.log("🎧 Resposta Spotify status:", data.error?.status ?? "ok");

    // 🔄 TOKEN EXPIRADO (401) — renova uma vez e tenta novamente
    if (data.error && data.error.status === 401) {
      console.log("🔄 Token expirado, renovando...");
      accessToken = null; // força renovação
      await ensureToken();
      data = await spotifySearch(query);
    }

    // ❌ Outros erros do Spotify — loga e repassa com status correto
    if (data.error) {
      console.error("❌ Erro da API Spotify:", JSON.stringify(data.error));
      return res
        .status(data.error.status || 502)
        .json({ error: data.error.message || "Erro na API do Spotify" });
    }

    res.json(data);
  } catch (err) {
    console.error("💥 ERRO NO SERVER:", err.message);
    res.status(500).json({ error: err.message || "Erro interno no servidor" });
  }
});

// 🚀 START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});


// versão Cloud IA