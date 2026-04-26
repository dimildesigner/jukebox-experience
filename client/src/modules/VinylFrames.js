import * as THREE from "three";

export default class VinylFrames {
  constructor(scene) {
    this.scene = scene;

    this.loader = new THREE.TextureLoader();

    this.init();
  }

  init() {
    this.group = new THREE.Group();

    const geometry = new THREE.PlaneGeometry(0.6, 0.6);

    // 🟢 PLAY (ESQUERDA)
    const playTexture = this.loader.load("/textures/vinil-play.png");

    const playMaterial = new THREE.MeshBasicMaterial({
      map: playTexture,
      transparent: true,
    });

    this.playFrame = new THREE.Mesh(geometry, playMaterial);
    this.playFrame.position.set(-1.5, 1.1, 0);
    this.playFrame.name = "vinylPlay";

    // 🔴 PAUSE (DIREITA)
    const pauseTexture = this.loader.load("/textures/vinil-pause.png");

    const pauseMaterial = new THREE.MeshBasicMaterial({
      map: pauseTexture,
      transparent: true,
    });

    this.pauseFrame = new THREE.Mesh(geometry, pauseMaterial);
    this.pauseFrame.position.set(1.2, 1.0, 0);
    this.pauseFrame.name = "vinylPause";

    // 🎯 AGORA SIM podemos rotacionar (pois já existem)
    this.playFrame.rotation.y = 0.3;
    this.pauseFrame.rotation.y = -0.3;

    // adicionar ao grupo
    this.group.add(this.playFrame);
    this.group.add(this.pauseFrame);

    this.scene.add(this.group);
  }
}