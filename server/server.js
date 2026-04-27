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
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    console.log("CLIENT ID:", clientId);
    console.log("CLIENT SECRET:", clientSecret);

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

    console.log("🔐 resposta token:", data);

    if (!data.access_token) {
      throw new Error("Token inválido");
    }

    accessToken = data.access_token;
    tokenExpiresAt = Date.now() + data.expires_in * 1000;

    console.log("✅ Token válido gerado");
  } catch (err) {
    console.error("💥 ERRO AO GERAR TOKEN:", err);
  }
}

// 🎯 GARANTIR TOKEN VÁLIDO
async function ensureToken() {
  if (!accessToken || Date.now() > tokenExpiresAt) {
    console.log("🔄 Gerando novo token...");
    await getAccessToken();
  }
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

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query,
      )}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await response.json();

    // 🔍 DEBUG
    console.log("🎧 Resposta Spotify:", data);

    // 🔄 TOKEN EXPIRADO
    if (data.error && data.error.status === 401) {
      console.log("🔄 Token expirado, renovando...");

      await getAccessToken();

      const retry = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query,
        )}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const retryData = await retry.json();
      return res.json(retryData);
    }

    res.json(data);
  } catch (err) {
    console.error("💥 ERRO NO SERVER:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// 🚀 START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});
