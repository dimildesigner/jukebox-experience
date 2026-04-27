import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

let accessToken = null;
let tokenExpiresAt = 0;

// 🎯 GERAR TOKEN
async function getAccessToken() {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    console.log("🔑 CLIENT ID:", clientId ? "OK" : "MISSING");
    console.log("🔑 CLIENT SECRET:", clientSecret ? "OK" : "MISSING");

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

    console.log("🔐 TOKEN RESPONSE:", data);

    if (!data.access_token) {
      throw new Error("Falha ao obter token");
    }

    accessToken = data.access_token;
    tokenExpiresAt = Date.now() + data.expires_in * 1000;

    console.log("✅ Token gerado com sucesso");
  } catch (err) {
    console.error("💥 ERRO AO GERAR TOKEN:", err.message);
    accessToken = null;
  }
}

// 🎯 GARANTE TOKEN
async function ensureToken() {
  if (!accessToken || Date.now() > tokenExpiresAt) {
    console.log("🔄 Token expirado ou inexistente");
    await getAccessToken();
  }
}

// 🎯 ROTA DE BUSCA
app.get("/search", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: "Query não informada" });
    }

    await ensureToken();

    if (!accessToken) {
      return res.status(500).json({
        error: "Falha ao gerar token Spotify",
      });
    }

    console.log("🔍 Buscando:", query);

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    console.log("🎧 RESPOSTA SPOTIFY:", data);

    if (data.error) {
      return res.status(data.error.status || 500).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error("💥 ERRO NA ROTA /search:", err);
    res.status(500).json({
      error: "Erro interno no servidor",
    });
  }
});

// 🚀 START
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});
