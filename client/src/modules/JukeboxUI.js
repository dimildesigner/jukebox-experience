const API_URL = "https://jukebox-experience.onrender.com";

export default class JukeboxUI {
  constructor(experience) {
    this.experience = experience;
    this.isOpen = false;
    this.init();
  }

  init() {
    // 🍔 BOTÃO
    this.button = document.createElement("div");
    this.button.innerHTML = "☰";
    this.button.style = `
      position: fixed;
      top: 20px;
      left: 80px;
      font-size: 30px;
      cursor: pointer;
      z-index: 10;
      color: #fff49d;
      user-select: none;
      text-shadow: 2px 2px 6px rgba(0,0,0,0.7);
    `;
    document.body.appendChild(this.button);

    // 🎛️ PAINEL
    this.panel = document.createElement("div");
    this.panel.style = `
      position: fixed;
      top: 70px;
      left: 40px;
      width: 380px;
      background: rgba(250, 226, 196, 0.9);
      padding: 12px;
      display: none;
      z-index: 10;
      border: 8px solid #a31b27;
      // border-radius: 2px;
    `;

    // 🔍 INPUTS
    this.artistInput = this.createInput("Artista");
    this.albumInput  = this.createInput("Álbum");
    this.trackInput  = this.createInput("Música");

    // 🔘 BOTÃO DE BUSCA
    this.searchBtn = document.createElement("button");
    this.searchBtn.innerText = "Buscar";
    this.searchBtn.style = `
      width: 50%;
      padding: 8px;
      margin-top: 8px;
      cursor: pointer;
      font-family: sans-serif;
      font-optical-sizing: auto;
      font-weight: 700;
      font-size: 15px;
      // font-weight: bold;
      color: #fcf3af;
      background: #a31b27;     
      border-color: #a31b27;
      border-radius: 5px;
    `;

    // 📋 RESULTADOS
    this.resultList = document.createElement("div");
    this.resultList.style.marginTop = "10px";

    // montar painel
    this.panel.appendChild(this.artistInput);
    this.panel.appendChild(this.albumInput);
    this.panel.appendChild(this.trackInput);
    this.panel.appendChild(this.searchBtn);
    this.panel.appendChild(this.resultList);
    document.body.appendChild(this.panel);

    // 🎯 EVENTOS
    this.button.onclick = () => this.toggleMenu();
    this.searchBtn.onclick = () => this.search();
  }

  createInput(placeholder) {
    const input = document.createElement("input");
    input.placeholder = placeholder;
    input.style = `
      width: 80%;
      padding: 10px;
      margin-bottom: 4px;
      font-size: 14px;
      border-radius: 5px;
      border: 1px solid #e2b968;
    `;
    return input;
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.panel.style.display = this.isOpen ? "block" : "none";
    this.button.innerHTML = this.isOpen ? "✖" : "☰";
  }

  async search() {
    const parts = [];

    if (this.artistInput.value) parts.push(`artist:${this.artistInput.value}`);
    if (this.albumInput.value)  parts.push(`album:${this.albumInput.value}`);
    if (this.trackInput.value)  parts.push(`track:${this.trackInput.value}`);

    if (parts.length === 0) {
      alert("Digite algo para buscar");
      return;
    }

    const query = parts.join(" ");

    this.searchBtn.innerText = "Buscando...";
    this.searchBtn.disabled = true;

    try {
      const res  = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      console.log("🔍 resposta completa:", data);

      // ❌ Erro vindo do servidor
      if (data.error) {
        const msg = typeof data.error === "string"
          ? data.error
          : data.error.message || JSON.stringify(data.error);
        console.error("❌ Erro da API:", msg);
        this.showError(`Erro: ${msg}`);
        return;
      }

      // ⚠️ iTunes retorna { resultCount, results[] }
      if (!data.results || data.results.length === 0) {
        this.showError("Nenhum resultado encontrado");
        return;
      }

      this.renderResults(data.results);

    } catch (err) {
      console.error("Erro na busca:", err);
      this.showError("Erro de conexão com o servidor");
    } finally {
      this.searchBtn.innerText = "Buscar";
      this.searchBtn.disabled = false;
    }
  }

  showError(msg) {
    this.resultList.innerHTML = `<div style="color: red; padding: 10px; font-size: 13px;">${msg}</div>`;
  }

  renderResults(tracks) {
    this.resultList.innerHTML = "";

    tracks.forEach((track) => {
      // iTunes: trackName, artistName, previewUrl, artworkUrl60
      const name   = track.trackName   || "Desconhecido";
      const artist = track.artistName  || "Desconhecido";
      const preview = track.previewUrl || null;

      const item = document.createElement("div");
      item.style = `
        cursor: pointer;
        padding: 8px;
        border-bottom: 1px solid #e2b968;
        display: flex;
        align-items: center;
        font-family: sans-serif;
        gap: 6px;
      `;

      // miniatura do álbum
      if (track.artworkUrl60) {
        const img = document.createElement("img");
        img.src = track.artworkUrl60;
        img.style = "width:40px;height:40px;border-radius:4px;flex-shrink:0;";
        item.appendChild(img);
      }

      const label = document.createElement("span");
      label.innerText = `${name} — ${artist}`;
      label.style = "font-size:13px;";
      item.appendChild(label);

      // indicador visual se não tiver preview
      if (!preview) {
        label.style.color = "#999";
        label.title = "Sem preview disponível";
      }

      item.onclick = () => {
        console.log("🎵 tocar:", preview);

        if (!preview) {
          alert("Essa música não tem preview disponível 😢");
          return;
        }

        this.experience.audio.loadFromUrl(preview);
      };

      this.resultList.appendChild(item);
    });
  }
}
