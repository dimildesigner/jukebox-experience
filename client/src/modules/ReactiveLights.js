import * as THREE from 'three'

export default class ReactiveLights {
  constructor(scene, experience) {
    this.scene = scene
    this.experience = experience

    this.createLights()
  }

  createLights() {
    // luz principal (global)
    this.mainLight = new THREE.PointLight(0xffffff, 1, 15)
    this.mainLight.position.set(0, 2, 2)

    // luz secundária (contraste)
    this.secondaryLight = new THREE.PointLight(0x00ffff, 1, 15)
    this.secondaryLight.position.set(2, 1, -2)

    this.scene.add(this.mainLight, this.secondaryLight)
  }

  update() {
    const audio = this.experience.audio?.getFrequency?.() || 0

    // intensidade baseada no áudio
    const intensity = 0.5 + audio * 5

    this.mainLight.intensity = intensity
    this.secondaryLight.intensity = intensity * 0.6

    // cor dinâmica (psicodélica)
    const hue = (Date.now() * 0.0002 + audio) % 1

    this.mainLight.color.setHSL(hue, 1, 0.5)
    this.secondaryLight.color.setHSL((hue + 0.3) % 1, 1, 0.5)
  }
}
