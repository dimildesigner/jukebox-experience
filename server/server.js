import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// 🎯 ROTA DE BUSCA — iTunes Search API (sem autenticação, gratuita)
app.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Query vazia" });
  }

  try {
    console.log("🔍 Query recebida:", query);

    // Remove prefixos "artist:", "album:", "track:" para montar termo limpo
    const cleanQuery = query
      .replace(/artist:/gi, "")
      .replace(/album:/gi, "")
      .replace(/track:/gi, "")
      .trim();

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=music&entity=song&limit=10`;

    console.log("🌐 URL iTunes:", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log("🎧 iTunes retornou", data.resultCount, "resultados");

    res.json(data);
  } catch (err) {
    console.error("💥 ERRO NO SERVER:", err.message);
    res.status(500).json({ error: err.message || "Erro interno no servidor" });
  }
});

// 🎵 PROXY DE ÁUDIO — resolve CORS dos previews do iTunes
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "URL não informada" });
  }

  // Aceita apenas domínios do iTunes/Apple para segurança
  const allowed = ["audio-ssl.itunes.apple.com", "itunes.apple.com", "audio.itunes.apple.com"];
  let hostname;

  try {
    hostname = new URL(targetUrl).hostname;
  } catch {
    return res.status(400).json({ error: "URL inválida" });
  }

  if (!allowed.includes(hostname)) {
    return res.status(403).json({ error: "Domínio não permitido" });
  }

  try {
    console.log("🔀 Proxy para:", targetUrl);

    const response = await fetch(targetUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Falha ao buscar áudio" });
    }

    // Repassa headers de áudio e faz streaming da resposta
    res.setHeader("Content-Type", response.headers.get("content-type") || "audio/mp4");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const reader = response.body.getReader();

    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) { res.end(); return; }
      res.write(Buffer.from(value));
      return pump();
    };

    await pump();

  } catch (err) {
    console.error("💥 ERRO NO PROXY:", err.message);
    res.status(500).json({ error: "Erro no proxy de áudio" });
  }
});

// 🚀 START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});
