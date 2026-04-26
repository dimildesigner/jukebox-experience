import Scene from "./Scene.js";
import Camera from "./Camera.js";
import Renderer from "./Renderer.js";

import Sizes from "../utils/Sizes.js";
import Time from "../utils/Time.js";

import Jukebox from "../modules/Jukebox.js";
import Interaction from "../modules/Interaction.js";
import AudioEngine from "../modules/AudioEngine.js";

import PsychedelicBackground from "../modules/PsychedelicBackground.js";
import Environment from "../modules/Environment.js";

import CameraAnimation from "../systems/CameraAnimation.js";
import Parallax from "../modules/Parallax.js";

import ReactiveLights from "../modules/ReactiveLights.js";
import Particles from "../modules/Particles.js";

import CheckerFloor from "../modules/CheckerFloor.js";

import VinylFrames from "../modules/VinylFrames.js";

import JukeboxUI from "../modules/JukeboxUI.js";

export default class Experience {
  constructor(canvas) {
    this.canvas = canvas;

    this.sizes = new Sizes();
    this.time = new Time();

    this.scene = new Scene();
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);

    // 🎵 CORE
    this.audio = new AudioEngine();

    // 🎰 OBJETOS
    this.jukebox = new Jukebox(this.scene);

    // 🎮 INTERAÇÃO
    this.interaction = new Interaction(this);

    // 🌈 VISUAL
    this.psychedelic = new PsychedelicBackground(this.scene, this);
    this.environment = new Environment(this.scene);

    // 🎥 SISTEMAS
    this.cameraAnimation = new CameraAnimation(this);
    this.parallax = new Parallax(this);

    // 💡 FX
    this.reactiveLights = new ReactiveLights(this.scene, this);
    this.particles = new Particles(this.scene, this);

    this.floor = new CheckerFloor(this.scene, this);

    this.vinylFrames = new VinylFrames(this.scene);

    // ui
    this.ui = new JukeboxUI(this);

    this.update();
  }

  update() {
    // 🎥 câmera
    this.camera.update();

    // 🎮 interação
    this.interaction?.update();

    // 🌈 fundo
    this.psychedelic?.update();

    // 🎥 animação de câmera
    // this.cameraAnimation?.update();

    // 🖱️ parallax
    this.parallax?.update();

    // ✨ partículas
    this.particles?.update();

    // 💡 luz reativa
    this.reactiveLights?.update();

    // 🎯 opcional: câmera olhar para jukebox
    if (this.jukebox?.model) {
      this.camera.instance.lookAt(this.jukebox.model.position);
    }
    
    // CHÃO XADREZ
    this.floor?.update();

    // 🖥️ render
    this.renderer.update();

    requestAnimationFrame(() => this.update());
  }
}
