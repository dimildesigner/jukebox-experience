import * as THREE from "three";

export default class Scene extends THREE.Scene {
  constructor() {
    super();

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);

    this.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.add(ambient);
    
  }
}
