import * as THREE from "three";

export default class Particles {
  constructor(scene, experience) {
    this.scene = scene;
    this.experience = experience;

    this.count = 800;

    this.init();
  }

  init() {
    // 🔹 GEOMETRIA
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // 🎯 X e Z normais
      positions[i3 + 0] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      // 🔥 Y CONTROLADO (NUNCA NO CHÃO)
      let y = Math.random() * 10;

      // evita zona do chão (-1 até +1)
      if (y < 1) {
        y += 1;
      }

      positions[i3 + 1] = y;
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    // 🔹 TEXTURA
    const textureLoader = new THREE.TextureLoader();
    this.texture = textureLoader.load("/textures/stars.png");

    // 🔹 MATERIAL
    this.material = new THREE.PointsMaterial({
      size: 0.2,
      map: this.texture,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // 🔹 PARTICLES
    this.points = new THREE.Points(
      this.geometry,
      this.material
    );

    this.scene.add(this.points);
  }

  update() {
    const time = Date.now() * 0.001;

    // rotação leve
    this.points.rotation.y += 0.001;

    // 🔊 reação ao áudio
    const freq =
      this.experience?.audio?.getFrequency?.() || 0;

    const scale = 1 + freq * 3;
    this.points.scale.set(scale, scale, scale);

    // 🎯 SEGURANÇA: nunca descer demais
    const positions = this.geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);

      if (y < 1.5) {
        positions.setY(i, 1.5);
      }
    }

    positions.needsUpdate = true;
  }
}