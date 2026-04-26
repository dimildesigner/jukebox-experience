export default class AudioEngine {
  constructor() {
    this.audio = new Audio();

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
  }

  // controla velocidade do áudio
  setPlaybackRate(rate) {
    if (!this.audio) return;

    // limita para não quebrar o áudio
    const clamped = Math.max(0.5, Math.min(2, rate));

    this.audio.playbackRate = clamped;
  }

  // altera pich
  setDetune(value) {
    if (this.source && this.source.detune) {
      this.source.detune.value = value;
    }
  }

  initAudio() {
    if (this.context) return;

    this.context = new (window.AudioContext || window.webkitAudioContext)();

    const source = this.context.createMediaElementSource(this.audio);
    this.analyser = this.context.createAnalyser();

    source.connect(this.analyser);
    this.analyser.connect(this.context.destination);

    this.analyser.fftSize = 256;
  }

  play() {
    this.initAudio();

    this.audio.play().catch((e) => {
      console.warn("⚠️ Clique necessário para iniciar áudio");
    });

    this.isPlaying = true;

    this.sound.play();
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;

    this.sound.pause();
  }

  // UI para carregar música de URL (ex: preview do Spotify)
  loadFromUrl(url) {
    if (!url) {
      console.log("❌ música sem preview");
      return;
    }

    const listener = this.listener;

    const audioLoader = new THREE.AudioLoader();

    audioLoader.load(url, (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.play();
    });
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

    this.audio.src = this.tracks[this.currentTrack];
    this.play();
  }

  getFrequency() {
    if (!this.analyser) return 0;

    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);

    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }

    return sum / data.length / 255;
  }

  playScratch() {
    if (!this.scratch) return;

    // reinicia o som
    this.scratch.currentTime = 0;

    this.scratch.play().catch(() => {});
  }
}
