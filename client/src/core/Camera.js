import * as THREE from "three";

export default class Camera {
  constructor(experience) {
    this.experience = experience;

    this.instance = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.instance.position.set(0, 1, 5);
    this.experience.scene.add(this.instance);

    window.addEventListener("sizes:resize", () => {
      this.instance.aspect = window.innerWidth / window.innerHeight;
      this.instance.updateProjectionMatrix();
    });
  }

  update() {
    if (this.experience.jukebox?.model) {
      this.instance.lookAt(this.experience.jukebox.model.position);
    }
  }
}
