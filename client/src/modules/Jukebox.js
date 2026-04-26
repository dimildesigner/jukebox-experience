import * as THREE from "three";
import Loader from "../assets/Loader.js";

export default class Jukebox {
  constructor(scene) {
    this.scene = scene;
    this.loader = new Loader();

    this.model = null;

    this.init();
  }

  createInteractionZones() {
    if (!this.model) return;

    this.buttons = [];

    // PLAY BUTTON
    const playBtn = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.3, 0.1),
      new THREE.MeshBasicMaterial({ visible: false })
    );

    playBtn.position.set(0.2, 0.9, 0.3);
    playBtn.name = "playButton";

    // NEXT BUTTON
    const nextBtn = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.3, 0.1),
      new THREE.MeshBasicMaterial({ visible: false })
    );

    nextBtn.position.set(-0.2, 0.9, 0.3);
    nextBtn.name = "nextButton";

    this.model.add(playBtn);
    this.model.add(nextBtn);

    this.buttons.push(playBtn, nextBtn);
  }

  async init() {
    try {
      const gltf = await this.loader.load("/models/jukebox.glb");

      this.model = gltf.scene;

      this.scene.add(this.model);

      // ajustes iniciais
      this.model.scale.set(1.5, 1.5, 1.5);
      this.model.position.set(0, -0.52, 0);

      this.model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });

      // ✅ criar botões depois que modelo existe
      this.createInteractionZones();

      console.log("✅ Jukebox carregada");
    } catch (error) {
      console.error("❌ Erro ao carregar jukebox:", error);
    }
  }
}