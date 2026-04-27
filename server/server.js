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

    // iTunes aceita busca livre — extrai artista e música se vier no formato "artist:X track:Y"
    const cleanQuery = query
      .replace(/artist:/gi, "")
      .replace(/album:/gi, "")
      .replace(/track:/gi, "")
      .trim();

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=music&entity=song&limit=10&lang=pt_br`;

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

// 🚀 START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});
