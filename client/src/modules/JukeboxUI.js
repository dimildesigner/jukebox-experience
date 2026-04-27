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
      left: 20px;
      font-size: 32px;
      cursor: pointer;
      z-index: 10;
      color: white;
      user-select: none;
    `;

    document.body.appendChild(this.button);

    // 🎛️ PAINEL
    this.panel = document.createElement("div");
    this.panel.style = `
      position: fixed;
      top: 80px;
      left: 20px;
      width: 380px;
      background: rgba(254, 248, 236, 0.8);
      // background: url('/textures/list_bg.png');
      // background-size: cover;
      padding: 10px;
      display: none;
      z-index: 10;
      border-radius: 10px;
    `;

    // 🔍 INPUTS
    this.artistInput = this.createInput("Artista");
    this.albumInput = this.createInput("Álbum");
    this.trackInput = this.createInput("Música");

    // 🔘 BOTÃO DE BUSCA
    this.searchBtn = document.createElement("button");
    this.searchBtn.innerText = "Buscar";

    this.searchBtn.style = `
      width: 100%;
      padding: 20px;
      margin-top: 20px;
      cursor: pointer;
      font-size: 22px;
      font-weight: bold;
      background: #71c837;
      color: #000000;
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
      width: 88%;
      padding: 20px;
      margin-bottom: 4px;
      font-size: 14px;
    `;

    return input;
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;

    this.panel.style.display = this.isOpen ? "block" : "none";

    // 🍔 vira X
    this.button.innerHTML = this.isOpen ? "✖" : "☰";
  }

  async search() {
    // 🎯 montar query inteligente
    const parts = [];

    if (this.artistInput.value) parts.push(`artist:${this.artistInput.value}`);

    if (this.albumInput.value) parts.push(`album:${this.albumInput.value}`);

    if (this.trackInput.value) parts.push(`track:${this.trackInput.value}`);

    if (parts.length === 0) {
      alert("Digite algo para buscar");
      return;
    }

    const query = parts.join(" ");

    try {
      const res = await fetch(`${API_URL}/search?q=${query}`);
      // const res = await fetch(
      //   `http://localhost:3001/search?q=${encodeURIComponent(query)}`,
      // );

      const data = await res.json();

      // 🧠 DEBUG AQUI
      console.log("🔍 resposta completa:", data);

      if (!data.tracks || !data.tracks.items) {
        console.warn("⚠️ resposta inesperada:", data);
        alert("Nenhum resultado encontrado ou erro na API");
        return;
      }

      this.renderResults(data.tracks.items);
    } catch (err) {
      console.error("Erro na busca:", err);
    }
  }

  renderResults(tracks) {
    this.resultList.innerHTML = "";

    tracks.forEach((track) => {
      const item = document.createElement("div");

      item.innerText = `${track.name} - ${track.artists[0].name}`;

      item.style = `
        cursor: pointer;
        padding: 6px;
        border-bottom: 1px solid #639780;
      `;

      item.onclick = () => {
        console.log("🎵 tocar:", track.preview_url);

        // 🚨 TRATAMENTO IMPORTANTE
        if (!track.preview_url) {
          alert("Essa música não tem preview 😢");
          return;
        }

        this.experience.audio.loadFromUrl(track.preview_url);
      };

      this.resultList.appendChild(item);
    });
  }
}
