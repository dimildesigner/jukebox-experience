import * as THREE from "three";

export default class CheckerFloor {
  constructor(scene, experience) {
    this.scene = scene;
    this.experience = experience;

    this.size = 20;
    this.tileSize = 1;
    this.centerRadius = 4; // 🔥 área sólida maior

    this.tiles = [];

    this.init();
  }

  init() {
    const group = new THREE.Group();

    for (let x = -this.size; x < this.size; x++) {
      for (let z = -this.size; z < this.size; z++) {
        const isWhite = (x + z) % 2 === 0;

        const material = new THREE.MeshStandardMaterial({
          color: isWhite ? "#f5f5dc" : "#111111",
          roughness: 0.3,
          metalness: 0.2,
          emissive: isWhite ? "#220022" : "#000000",
          emissiveIntensity: 0,
        });

        const geometry = new THREE.BoxGeometry(
          this.tileSize,
          0.1,
          this.tileSize,
        );

        const mesh = new THREE.Mesh(geometry, material);

        // 🔥 altura ajustada (flutuando)
        mesh.position.set(x * this.tileSize, -0.6, z * this.tileSize);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const dist = Math.sqrt(x * x + z * z);

        this.tiles.push({
          mesh,
          material,
          baseY: mesh.position.y,
          dist,
          offset: Math.random() * Math.PI * 2,
        });

        group.add(mesh);
      }
    }

    this.group = group;
    this.scene.add(group);
  }

  update() {
    const time = Date.now() * 0.001;

    const freq = this.experience?.audio?.getFrequency?.() || 0;

    this.tiles.forEach((tile) => {
      const { mesh, material, dist, baseY, offset } = tile;

      if (dist < this.centerRadius) {
        mesh.position.y = baseY + Math.sin(time + offset) * 0.03;

        mesh.rotation.x = 0;
        mesh.rotation.z = 0;

        material.emissiveIntensity = freq * 0.5;

        return;
      }

      // 🔥 intensidade por distância
      const factor = Math.min(dist / 10, 2);

      // 🌊 onda
      const wave = Math.sin(time * 2 + offset) * 0.3 * factor;

      // 🎧 áudio
      const audioImpact = freq * 2 * factor;

      // 🌌 queda nas bordas
      const falloff = Math.max(0, (dist - this.centerRadius) * 0.05);

      // 🎯 posição final CORRETA
      mesh.position.y = baseY + wave + audioImpact - falloff;

      // 🎬 rotação
      mesh.rotation.x = Math.sin(time + offset) * 0.1 * factor;

      mesh.rotation.z = Math.cos(time + offset) * 0.1 * factor;

      // ✨ brilho
      material.emissiveIntensity = freq * 2 * factor;
    });
  }
}
