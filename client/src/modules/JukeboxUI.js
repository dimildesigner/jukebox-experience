const API_URL = "https://jukebox-experience.onrender.com";

export default class JukeboxUI {
  constructor(experience) {
    this.experience = experience;
    this.isOpen = false;
    this.activeItem = null;
    this.currentTrackData = null;
    this.noteInterval = null;
    this.init();

    // Escuta mudanças de estado do áudio
    this.experience.audio.onPlayStateChange((playing) => {
      this.setPlayState(playing);
    });
  }

  init() {
    this.injectStyles();
    this.buildHamburger();
    this.buildDrawer();
    this.buildVinylWidget();
    this.buildMiniPlayer();
  }

  injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes floatNote {
        0%   { opacity: 0; transform: translateY(0) scale(0.8); }
        20%  { opacity: 1; }
        80%  { opacity: 0.7; }
        100% { opacity: 0; transform: translateY(-70px) scale(1.1); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
      }
      @keyframes drawerIn  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      @keyframes drawerOut { from { transform: translateX(0); }    to { transform: translateX(-100%); } }
      @keyframes playerIn  { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

      .jk-drawer {
        position: fixed; top: 0; left: 0; height: 100%;
        width: min(360px, 90vw);
        background: rgba(20, 14, 10, 0.92);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        z-index: 100;
        display: flex; flex-direction: column;
        box-shadow: 4px 0 32px rgba(0,0,0,0.5);
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
      }
      .jk-drawer.open { transform: translateX(0); }

      .jk-overlay {
        position: fixed; inset: 0; background: rgba(10, 10, 10, 0.75);
        z-index: 99; opacity: 0; pointer-events: none;
        transition: opacity 0.3s;
      }
      .jk-overlay.open { opacity: 1; pointer-events: all; }

      .jk-drawer-header {
        padding: 20px 16px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        flex-shrink: 0;
      }
      .jk-drawer-title {
        font-family: sans-serif;
        font-size: 22px; font-weight: 700;
        color: #a31b27; letter-spacing: 0.03em;
        margin-top: 35px;
        margin-bottom: 12px;
      }

      .jk-drawer-title span {      
        color: #71c837;
      }

      .jk-drawer-title span.bco {      
        color: #fafbf9;
      }

      .jk-input {
        width: 90%; padding: 10px 12px;
        background: rgba(255, 255, 255, 0.13);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 4px; color: #f5e6c8;
        font-family: sans-serif;
        font-size: 14px; margin-bottom: 8px;
        outline: none; transition: border-color 0.2s;
      }
      .jk-input::placeholder { color: rgba(245,230,200,0.35); }
      .jk-input:focus { border-color: rgba(113,200,55,0.6); }

      .jk-search-btn {
        width: 60%; padding: 8px;
        background: #71c837; border: none;
        border-radius: 4px; color: #0a1a06;
        font-family: sans-serif;
        font-size: 15px; font-weight: 700;
        cursor: pointer; transition: background 0.2s, transform 0.1s;
      }
      .jk-search-btn:hover   { background: #86d44f; }
      .jk-search-btn:active  { transform: scale(0.98); }
      .jk-search-btn:disabled { opacity: 0.55; cursor: not-allowed; }

      .jk-results {
        flex: 1; overflow-y: auto; padding: 10px 0;
        scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent;
      }
      .jk-results::-webkit-scrollbar { width: 4px; }
      .jk-results::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

      .jk-track-item {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 16px; cursor: pointer;
        transition: background 0.15s; border-left: 3px solid transparent;
      }
      .jk-track-item:hover   { background: rgba(255,255,255,0.06); }
      .jk-track-item.active  {
        background: rgba(113,200,55,0.12);
        border-left-color: #71c837;
      }
      .jk-track-item.no-preview { opacity: 0.45; cursor: not-allowed; }

      .jk-track-art {
        width: 44px; height: 44px; border-radius: 6px;
        object-fit: cover; flex-shrink: 0;
        background: rgba(255,255,255,0.08);
      }
      .jk-track-info { flex: 1; min-width: 0; }
      .jk-track-name {
        font-family: sans-serif;
        font-size: 13px; font-weight: 600; color: #f5e6c8;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .jk-track-artist {
        font-family: sans-serif;
        font-size: 12px; color: rgba(245,230,200,0.5);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        margin-top: 2px;
      }
      .jk-track-play-icon {
        font-family: sans-serif;
        font-size: 14px; color: #71c837;
        animation: pulse 1.4s ease-in-out infinite;
        flex-shrink: 0;
      }
      .jk-error {
        padding: 16px 18px; font-family: sans-serif; font-size: 14px;
        color: #e8705a; line-height: 1.5;
      }

      /* Mini player */
      .jk-mini-player {
        position: fixed; bottom: 0; left: 0; right: 0;
        background: rgba(20,14,10,0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-top: 1px solid rgba(255,255,255,0.08);
        display: flex; align-items: center; gap: 12px;
        padding: 10px 16px; z-index: 98;
        transform: translateY(100%); opacity: 0;
        transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s;
      }
      .jk-mini-player.visible { transform: translateY(0); opacity: 1; }
      .jk-mini-art {
        width: 40px; height: 40px; border-radius: 6px;
        object-fit: cover; flex-shrink: 0;
        background: rgba(255,255,255,0.08);
      }
      .jk-mini-info { flex: 1; min-width: 0; }
      .jk-mini-name {
        font-family: sans-serif;
        font-size: 13px; font-weight: 600; color: #f5e6c8;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .jk-mini-artist {
        font-family: sans-serif;
        font-size: 12px; color: rgba(245,230,200,0.5);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .jk-mini-eq {
        display: flex; gap: 2px; align-items: flex-end;
        height: 18px; flex-shrink: 0;
      }
      .jk-mini-bar {
        width: 3px; background: #71c837; border-radius: 2px;
        animation: pulse 0.8s ease-in-out infinite;
      }
      .jk-mini-bar:nth-child(2) { animation-delay: 0.2s; height: 10px; }
      .jk-mini-bar:nth-child(3) { animation-delay: 0.4s; height: 16px; }
      .jk-mini-bar:nth-child(1) { height: 12px; }

      /* Vinyl widget */
      .jk-vinyl-widget {
        position: fixed; bottom: 72px; right: 20px;
        z-index: 97; width: 72px; height: 72px;
        pointer-events: none; opacity: 0;
        transition: opacity 0.4s;
      }
      .jk-vinyl-widget.playing { opacity: 1; }
      .jk-vinyl-disc {
        width: 62px; height: 62px; border-radius: 50%;
        background: repeating-radial-gradient(
          circle,
          #333,
          #333 1px,
          #111 2px,
          #111 3px
        );
        
        animation: spin 3s linear infinite;
        // animation: girar 3s linear infinite;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.72);
        
        animation-play-state: paused;
        position: relative;
      }

      // /* Keyframes para a rotação */
      // @keyframes girar {
      //   from {
      //     transform: rotate(0deg);
      //   }
      //   to {
      //     transform: rotate(360deg);
      //   }
      // }

      .jk-vinyl-disc.spinning { animation-play-state: running; }

      .jk-vinyl-disc::after {
        content: ''; position: absolute;
        top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 14px; height: 14px; border-radius: 50%;
        background: #71c837;
      }
      .jk-note {
        position: absolute; font-size: 16px;
        animation: floatNote 2s ease-out forwards;
        pointer-events: none;
      }

      /* Hamburger */
      .jk-hamburger {
        position: fixed; top: 15px; left: 15px;
        width: 32px; height: 32px;
        background: rgb(165, 28, 39, 0.75);
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px; cursor: pointer;
        z-index: 101; display: flex;
        align-items: center; justify-content: center;
        font-size: 20px; color: #f5e6c8;
        user-select: none; transition: background 0.2s;
      }
      .jk-hamburger:hover { background: rgba(212, 36, 50, 0.9); }
    `;
    document.head.appendChild(style);
  }

  buildHamburger() {
    this.hamburger = document.createElement("div");
    this.hamburger.className = "jk-hamburger";
    this.hamburger.innerHTML = "☰";
    this.hamburger.onclick = () => this.toggleDrawer();
    document.body.appendChild(this.hamburger);
  }

  buildDrawer() {
    // Overlay
    this.overlay = document.createElement("div");
    this.overlay.className = "jk-overlay";
    this.overlay.onclick = () => this.closeDrawer();
    document.body.appendChild(this.overlay);

    // Drawer
    this.drawer = document.createElement("div");
    this.drawer.className = "jk-drawer";
    this.drawer.innerHTML = `
      <div class="jk-drawer-header">
        <div class="jk-drawer-title"> <span> ♫ ♩ </span> Jukebox <span class="bco"> Experience </span> <span> ♪ ♬ </span></div>
        <input class="jk-input" id="jk-artist" placeholder="Artista" />
        <input class="jk-input" id="jk-album"  placeholder="Álbum" />
        <input class="jk-input" id="jk-track"  placeholder="Música" />
        <button class="jk-search-btn" id="jk-search-btn">Buscar</button>
      </div>
      <div class="jk-results" id="jk-results"></div>
    `;
    document.body.appendChild(this.drawer);

    this.artistInput = this.drawer.querySelector("#jk-artist");
    this.albumInput = this.drawer.querySelector("#jk-album");
    this.trackInput = this.drawer.querySelector("#jk-track");
    this.searchBtn = this.drawer.querySelector("#jk-search-btn");
    this.resultList = this.drawer.querySelector("#jk-results");

    this.searchBtn.onclick = () => this.search();

    // Enter nos inputs dispara busca
    [this.artistInput, this.albumInput, this.trackInput].forEach((input) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.search();
      });
    });
  }

  buildVinylWidget() {
    this.vinylWidget = document.createElement("div");
    this.vinylWidget.className = "jk-vinyl-widget";
    this.vinylWidget.innerHTML = `<div class="jk-vinyl-disc" id="jk-disc"></div>`;
    document.body.appendChild(this.vinylWidget);
    this.disc = this.vinylWidget.querySelector("#jk-disc");
  }

  buildMiniPlayer() {
    this.miniPlayer = document.createElement("div");
    this.miniPlayer.className = "jk-mini-player";
    this.miniPlayer.innerHTML = `
      <img class="jk-mini-art" id="jk-mini-art" src="" alt="" />
      <div class="jk-mini-info">
        <div class="jk-mini-name" id="jk-mini-name">—</div>
        <div class="jk-mini-artist" id="jk-mini-artist">—</div>
      </div>
      <div class="jk-mini-eq" id="jk-mini-eq">
        <div class="jk-mini-bar"></div>
        <div class="jk-mini-bar"></div>
        <div class="jk-mini-bar"></div>
      </div>
    `;
    document.body.appendChild(this.miniPlayer);
  }

  toggleDrawer() {
    this.isOpen ? this.closeDrawer() : this.openDrawer();
  }

  openDrawer() {
    this.isOpen = true;
    this.drawer.classList.add("open");
    this.overlay.classList.add("open");
    this.hamburger.innerHTML = "✕";
  }

  closeDrawer() {
    this.isOpen = false;
    this.drawer.classList.remove("open");
    this.overlay.classList.remove("open");
    this.hamburger.innerHTML = "☰";
  }

  setPlayState(playing) {
    if (playing) {
      this.disc.classList.add("spinning");
      this.vinylWidget.classList.add("playing");
      if (!this.noteInterval) {
        this.noteInterval = setInterval(() => this.spawnNote(), 900);
      }
      if (this.currentTrackData) {
        this.miniPlayer.classList.add("visible");
      }
    } else {
      this.disc.classList.remove("spinning");
      this.vinylWidget.classList.remove("playing");
      clearInterval(this.noteInterval);
      this.noteInterval = null;
      this.miniPlayer.classList.remove("visible");
    }
  }

  spawnNote() {
    const notes = ["♩", "♪", "♫", "♬"];
    const note = document.createElement("span");
    note.className = "jk-note";
    note.textContent = notes[Math.floor(Math.random() * notes.length)];
    note.style.cssText = `
      left: ${Math.random() * 80}px;
      bottom: ${68 + Math.random() * 10}px;
      color: hsl(${80 + Math.random() * 40}, 80%, ${60 + Math.random() * 20}%);
    `;
    this.vinylWidget.appendChild(note);
    setTimeout(() => note.remove(), 2100);
  }

  async search() {
    const parts = [];
    if (this.artistInput.value) parts.push(`artist:${this.artistInput.value}`);
    if (this.albumInput.value) parts.push(`album:${this.albumInput.value}`);
    if (this.trackInput.value) parts.push(`track:${this.trackInput.value}`);

    if (parts.length === 0) {
      this.showError("Digite pelo menos um campo para buscar");
      return;
    }

    const query = parts.join(" ");
    this.searchBtn.textContent = "Buscando...";
    this.searchBtn.disabled = true;

    try {
      const res = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();

      if (data.error) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : data.error.message || JSON.stringify(data.error);
        this.showError(`Erro: ${msg}`);
        return;
      }
      if (!data.results || data.results.length === 0) {
        this.showError("Nenhum resultado encontrado");
        return;
      }
      this.renderResults(data.results);
    } catch (err) {
      this.showError("Erro de conexão com o servidor");
    } finally {
      this.searchBtn.textContent = "Buscar";
      this.searchBtn.disabled = false;
    }
  }

  showError(msg) {
    this.resultList.innerHTML = `<div class="jk-error">${msg}</div>`;
  }

  renderResults(tracks) {
    this.resultList.innerHTML = "";
    this.activeItem = null;

    tracks.forEach((track) => {
      const name = track.trackName || "Desconhecido";
      const artist = track.artistName || "Desconhecido";
      const preview = track.previewUrl || null;
      const art = track.artworkUrl60 || "";

      const item = document.createElement("div");
      item.className = "jk-track-item" + (preview ? "" : " no-preview");

      item.innerHTML = `
        ${art ? `<img class="jk-track-art" src="${art.replace("60x60", "100x100")}" alt="" loading="lazy" />` : `<div class="jk-track-art"></div>`}
        <div class="jk-track-info">
          <div class="jk-track-name">${name}</div>
          <div class="jk-track-artist">${artist}</div>
        </div>
        ${preview ? `<span class="jk-track-play-icon" style="display:none">▶</span>` : `<span style="font-size:11px;color:rgba(245,230,200,0.3)">sem preview</span>`}
      `;

      if (preview) {
        item.onclick = () => {
          // Remove active do item anterior
          if (this.activeItem) {
            this.activeItem.classList.remove("active");
            const icon = this.activeItem.querySelector(".jk-track-play-icon");
            if (icon) icon.style.display = "none";
          }

          // Ativa este item
          item.classList.add("active");
          const icon = item.querySelector(".jk-track-play-icon");
          if (icon) icon.style.display = "block";
          this.activeItem = item;

          // Atualiza dados da faixa atual
          this.currentTrackData = { name, artist, art };
          this.updateMiniPlayer(name, artist, art);

          this.experience.audio.loadFromUrl(preview);
        };
      }

      this.resultList.appendChild(item);
    });
  }

  updateMiniPlayer(name, artist, art) {
    this.miniPlayer.querySelector("#jk-mini-name").textContent = name;
    this.miniPlayer.querySelector("#jk-mini-artist").textContent = artist;
    const img = this.miniPlayer.querySelector("#jk-mini-art");
    img.src = art ? art.replace("60x60", "80x80") : "";
    img.style.display = art ? "block" : "none";
  }
}
