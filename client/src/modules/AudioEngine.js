export default class AudioEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";

    this.scratch = new Audio("/audio/scratch.mp3");
    this.scratch.volume = 0.5;

    this.tracks = [
      "/audio/music1.mp3",
      "/audio/music2.mp3",
      "/audio/music3.mp3",
    ];

    this.currentTrack = 0;
    this.audio.src = this.tracks[this.currentTrack];
    this.audio.loop = true;
    this.isPlaying = false;

    this.context = null;
    this.analyser = null;
    this.source = null;

    // Callbacks de estado
    this._onPlayStateChange = null;

    // Detecta fim natural da faixa
    this.audio.addEventListener("ended", () => {
      this.isPlaying = false;
      this._onPlayStateChange?.(false);
    });
  }

  onPlayStateChange(fn) {
    this._onPlayStateChange = fn;
  }

  setPlaybackRate(rate) {
    if (!this.audio) return;
    const clamped = Math.max(0.5, Math.min(2, rate));
    this.audio.playbackRate = clamped;
  }

  setDetune(value) {
    if (this.source && this.source.detune) {
      this.source.detune.value = value;
    }
  }

  initAudio() {
    if (this.context) return;
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.source = this.context.createMediaElementSource(this.audio);
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256;
    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
  }

  play() {
    this.initAudio();
    if (this.context && this.context.state === "suspended") {
      this.context.resume();
    }
    this.audio.play().catch(() => {
      console.warn("⚠️ Clique necessário para iniciar áudio");
    });
    this.isPlaying = true;
    this._onPlayStateChange?.(true);
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this._onPlayStateChange?.(false);
  }

  loadFromUrl(url) {
    if (!url) {
      console.log("❌ música sem preview");
      return;
    }
    const proxyUrl = `https://jukebox-experience.onrender.com/proxy?url=${encodeURIComponent(url)}`;
    this.audio.pause();
    this.audio.src = proxyUrl;
    this.audio.loop = false;
    this.play();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  nextTrack() {
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    this.audio.pause();
    this.audio.src = this.tracks[this.currentTrack];
    this.audio.loop = true;
    this.play();
  }

  getFrequency() {
    if (!this.analyser) return 0;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    return sum / data.length / 255;
  }

  playScratch() {
    if (!this.scratch) return;
    this.scratch.currentTime = 0;
    this.scratch.play().catch(() => {});
  }
}
