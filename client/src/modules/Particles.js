import * as THREE from "three";

export default class Particles {
  constructor(scene, experience) {
    this.scene      = scene;
    this.experience = experience;

    // Mobile recebe metade das partículas para economizar GPU
    this.count = experience.sizes?.isMobile ? 400 : 800;

    this.init();
  }

  init() {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;
      let y = Math.random() * 10;
      if (y < 1) y += 1;
      positions[i3 + 1] = y;
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const textureLoader = new THREE.TextureLoader();
    this.texture = textureLoader.load("/textures/stars.png");

    this.material = new THREE.PointsMaterial({
      size: 0.2,
      map: this.texture,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  update() {
    if (this.points) {
      this.points.rotation.y += 0.0003;
    }
  }
}
