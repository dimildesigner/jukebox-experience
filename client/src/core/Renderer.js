import * as THREE from "three";

export default class Renderer {
  constructor(experience) {
    this.experience = experience;

    this.instance = new THREE.WebGLRenderer({
      canvas: this.experience.canvas,
      antialias: true,
    });

    this.instance.setSize(window.innerWidth, window.innerHeight);
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.shadowMap.enabled = true;

    window.addEventListener("sizes:resize", () => {
      this.instance.setSize(window.innerWidth, window.innerHeight);
      this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  update() {
    this.instance.render(
      this.experience.scene,
      this.experience.camera.instance
    );
  }
}
