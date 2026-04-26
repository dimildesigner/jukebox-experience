import * as THREE from 'three'

export default class Renderer {
  constructor(experience) {
    this.experience = experience

    this.instance = new THREE.WebGLRenderer({
      canvas: this.experience.canvas,
      antialias: true
    })

    this.instance.setSize(window.innerWidth, window.innerHeight)

    this.instance.shadowMap.enabled = true
  }

  update() {
    this.instance.render(
      this.experience.scene,
      this.experience.camera.instance
    )
  }
}
