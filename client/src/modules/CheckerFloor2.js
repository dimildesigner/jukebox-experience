import * as THREE from "three";

export default class CheckerFloor {
  constructor(scene, experience) {
    this.scene = scene;
    this.experience = experience;

    this.size = 20; // quantidade de tiles por eixo
    this.tileSize = 1;
    this.centerRadius = 4; // área sólida

    this.tiles = [];

    this.init();
  }

  init() {
    const group = new THREE.Group();

    for (let x = -this.size; x < this.size; x++) {
      for (let z = -this.size; z < this.size; z++) {
        const isWhite = (x + z) % 2 === 0;

        const material = new THREE.MeshStandardMaterial({
          color: isWhite ? "#faffbe" : "#6d3e2a",          
          roughness: 0.4,
          metalness: 0.1,
        });

        const geometry = new THREE.BoxGeometry(
          this.tileSize,
          0.1,
          this.tileSize
        );

        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(
          x * this.tileSize,
          -1.2,
          z * this.tileSize
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // distância do centro
        const dist = Math.sqrt(x * x + z * z);

        this.tiles.push({
          mesh,
          baseY: mesh.position.y,
          dist,
          offset: Math.random() * 2,
        });

        group.add(mesh);
      }
    }

    this.group = group;
    this.scene.add(group);
  }

  update() {
    const time = Date.now() * 0.001;

    const freq =
      this.experience?.audio?.getFrequency?.() || 0;

    this.tiles.forEach((tile) => {
      // área central = estável
      if (tile.dist < this.centerRadius) {
        tile.mesh.position.y = tile.baseY;
        return;
      }

      // 🔥 efeito flutuante
      const wave =
        Math.sin(time + tile.offset) * 0.3;

      const audioBoost = freq * 2;

      tile.mesh.position.y =
        tile.baseY + wave + audioBoost;
    });
  }
}