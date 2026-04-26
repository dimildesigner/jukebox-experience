import * as THREE from "three";

export default class Environment {
  constructor(scene) {
    this.scene = scene;

    this.createFloor();
    this.createLights();
  }

  createFloor() {
    const geometry = new THREE.PlaneGeometry(20, 20);

    const material = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.2,
    });

    this.floor = new THREE.Mesh(geometry, material);

    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -1;

    this.scene.add(this.floor);

    this.floor.receiveShadow = true;
  }

  createLights() {
    // luz ambiente (preenche tudo)
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);

    // luz principal (dramática)
    const directional = new THREE.DirectionalLight(0xffffff, 2);
    directional.position.set(5, 5, 5);

    this.scene.add(directional);

    // luz colorida (estilo jukebox)
    const point = new THREE.PointLight(0xff0040, 2, 10);
    point.position.set(0, 2, 2);

    this.scene.add(point);

    directional.castShadow = true;
  }
}
